import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Gera uma URL alternativa para casos em que o host original bloqueia hotlink ou está indisponível
export function buildAlternateLogoUrl(logoUrl: string) {
  try {
    const parsed = new URL(logoUrl);
    const host = parsed.pathname.split('/')[1] || parsed.hostname;
    // Se já é unavatar, tenta logo.dev como alternativa
    if (parsed.hostname === 'unavatar.io') {
      return `https://logo.dev/${host}?format=png&size=200`;
    }
    return `https://unavatar.io/${host}`;
  } catch {
    return null;
  }
}

// Gera um data URI simples com a inicial do serviço para evitar depender de logos externas
export function buildFallbackLogo(serviceName: string) {
  const initial = serviceName?.trim().charAt(0)?.toUpperCase() || "?";
  const palette = [
    "#16a34a",
    "#0ea5e9",
    "#f59e0b",
    "#6366f1",
    "#ec4899",
    "#22c55e",
    "#ef4444",
  ];
  const color = palette[initial.charCodeAt(0) % palette.length];

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <rect width="96" height="96" rx="16" fill="${color}" />
      <text x="50%" y="55%" font-size="48" font-family="Inter, Arial, sans-serif" font-weight="700" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">
        ${initial}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Sanitiza input do usuário para prevenir XSS
 * Remove caracteres HTML perigosos, javascript: protocol e event handlers
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>'"]/g, '') // Remove caracteres HTML perigosos
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers (onclick=, onerror=, etc)
    .replace(/\s+/g, ' ') // Normaliza espaços múltiplos
    .trim();
}
