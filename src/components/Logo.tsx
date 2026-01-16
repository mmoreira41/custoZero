import logo from '@/assets/custo_zero.png';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <img
      src={logo}
      alt="custoZero"
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}
