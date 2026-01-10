"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
} from 'react';
import { cn } from '@/lib/utils';

interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: 'default' | 'white';
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  movementDuration?: number;
  borderWidth?: number;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const animateValue = (
  from: number,
  to: number,
  {
    duration,
    onUpdate,
  }: {
    duration: number;
    onUpdate: (value: number) => void;
  },
) => {
  let frameId = 0;
  const start = performance.now();

  const step = (now: number) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / (duration * 1000), 1);
    const eased = easeOutCubic(progress);
    onUpdate(from + (to - from) * eased);
    if (progress < 1) {
      frameId = requestAnimationFrame(step);
    }
  };

  frameId = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frameId);
};

const GlowingEffect = memo(
  ({
    blur = 0,
    inactiveZone = 0.7,
    proximity = 0,
    spread = 20,
    variant = 'default',
    glow = false,
    className,
    movementDuration = 2,
    borderWidth = 1,
    disabled = true,
  }: GlowingEffectProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPosition = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number>(0);
    const angleAnimationCancelRef = useRef<(() => void) | null>(null);

    const handleMove = useCallback(
      (e?: MouseEvent | { x: number; y: number }) => {
        if (!containerRef.current) return;

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          const element = containerRef.current;
          if (!element) return;

          const { left, top, width, height } = element.getBoundingClientRect();
          const mouseX = e?.x ?? lastPosition.current.x;
          const mouseY = e?.y ?? lastPosition.current.y;

          if (e) {
            lastPosition.current = { x: mouseX, y: mouseY };
          }

          const center = [left + width * 0.5, top + height * 0.5];
          const distanceFromCenter = Math.hypot(
            mouseX - center[0],
            mouseY - center[1],
          );
          const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

          if (distanceFromCenter < inactiveRadius) {
            element.style.setProperty('--active', '0');
            return;
          }

          const isActive =
            mouseX > left - proximity &&
            mouseX < left + width + proximity &&
            mouseY > top - proximity &&
            mouseY < top + height + proximity;

          element.style.setProperty('--active', isActive ? '1' : '0');

          if (!isActive) return;

          const currentAngle =
            parseFloat(element.style.getPropertyValue('--start')) || 0;
          let targetAngle =
            ((180 * Math.atan2(mouseY - center[1], mouseX - center[0])) /
              Math.PI) +
            90;

          const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
          const newAngle = currentAngle + angleDiff;

          if (angleAnimationCancelRef.current) {
            angleAnimationCancelRef.current();
          }

          angleAnimationCancelRef.current = animateValue(currentAngle, newAngle, {
            duration: movementDuration,
            onUpdate: (value) => {
              element.style.setProperty('--start', String(value));
            },
          });
        });
      },
      [inactiveZone, proximity, movementDuration],
    );

    useEffect(() => {
      if (disabled) return;
      const node = containerRef.current;
      const handleScroll = () => handleMove();
      const handlePointerMove = (event: PointerEvent) => handleMove(event);

      window.addEventListener('scroll', handleScroll, { passive: true });
      document.body.addEventListener('pointermove', handlePointerMove, {
        passive: true,
      });
      node?.addEventListener('pointermove', handlePointerMove, { passive: true });

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (angleAnimationCancelRef.current) {
          angleAnimationCancelRef.current();
        }
        window.removeEventListener('scroll', handleScroll);
        document.body.removeEventListener('pointermove', handlePointerMove);
        node?.removeEventListener('pointermove', handlePointerMove);
      };
    }, [handleMove, disabled]);

    const gradient =
      variant === 'white'
        ? `repeating-conic-gradient(
            from 236.84deg at 50% 50%,
            var(--black),
            var(--black) calc(25% / var(--repeating-conic-gradient-times))
          )`
        : `radial-gradient(circle at 20% 50%, #10b981 0%, #10b98180 15%, #10b98100 30%),
          radial-gradient(circle at 80% 50%, #14b8a6 0%, #14b8a680 15%, #14b8a600 30%),
          radial-gradient(circle at 50% 50%, #a3e635 0%, #a3e63580 10%, #a3e63500 25%),
          repeating-conic-gradient(
            from 0deg at 50% 50%,
            #10b981 0deg,
            #a3e635 calc(360deg / 6),
            #14b8a6 calc(360deg / 3),
            #10b981 calc(360deg / 2),
            #a3e635 calc(360deg * 2 / 3),
            #14b8a6 calc(360deg * 5 / 6),
            #10b981 360deg
          )`;

    return (
      <>
        <div
          className={cn(
            'pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity',
            glow && 'opacity-100',
            variant === 'white' && 'border-white',
            disabled && '!block',
          )}
        />
        <div
          ref={containerRef}
          style={
            {
              '--blur': `${blur}px`,
              '--spread': spread,
              '--start': '0',
              '--active': '0',
              '--glowingeffect-border-width': `${borderWidth}px`,
              '--repeating-conic-gradient-times': '5',
              '--gradient': gradient,
            } as CSSProperties
          }
          className={cn(
            'pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity',
            glow && 'opacity-100',
            blur > 0 && 'blur-[var(--blur)]',
            className,
            disabled && '!hidden',
          )}
        >
          <div
            className={cn(
              'glow w-full h-full',
              'rounded-[inherit]',
              'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
              'after:[border:var(--glowingeffect-border-width)_solid_transparent]',
              'after:[background:var(--gradient)] after:[background-attachment:fixed]',
              'after:opacity-[var(--active)] after:transition-opacity after:duration-200',
              'after:[mask-clip:padding-box,border-box]',
              'after:[mask-composite:intersect]',
              'after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]',
              'after:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]',
            )}
          />
        </div>
      </>
    );
  },
);

GlowingEffect.displayName = 'GlowingEffect';

export { GlowingEffect };
