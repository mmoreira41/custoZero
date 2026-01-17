/**
 * ============================================================================
 * SUPABASE SECURE CLIENT
 * ============================================================================
 * Cliente Supabase com métodos seguros que respeitam RLS e usam Edge Functions
 * onde necessário para proteger dados sensíveis.
 *
 * @author Security Implementation
 * @date 2026-01-09
 */

import { supabase } from './supabase';

// ============================================================================
// TYPES
// ============================================================================

export interface ValidateTokenResponse {
  valid: boolean;
  email?: string;
  createdAt?: string;
  expiresAt?: string | null;
  isLifetime?: boolean;
  error?: string;
  expired?: boolean;
}

export interface AccessToken {
  email: string;
  token: string;
  used: boolean;
  is_lifetime: boolean;
  expires_at: string | null;
}

// ============================================================================
// SECURE TOKEN VALIDATION
// ============================================================================

/**
 * Valida um token de acesso de forma segura usando Edge Function.
 *
 * ⚠️ NUNCA consulte a tabela access_tokens diretamente do front-end!
 * Isso exporia todos os tokens do banco de dados.
 *
 * @param token - Token UUID gerado pela Kiwify
 * @returns Objeto com valid, email e error
 *
 * @example
 * const result = await validateTokenSecure('abc-123-def-456');
 * if (result.valid) {
 *   console.log(`Token válido para: ${result.email}`);
 * } else {
 *   console.error(`Token inválido: ${result.error}`);
 * }
 */
export async function validateTokenSecure(
  token: string
): Promise<ValidateTokenResponse> {
  try {
    // Chamar Edge Function que usa Service Role Key internamente
    const { data, error } = await supabase.functions.invoke('validate-token', {
      body: { token },
    });

    if (error) {
      console.error('Error calling validate-token function:', error);
      return {
        valid: false,
        error: 'Failed to validate token',
      };
    }

    return data as ValidateTokenResponse;
  } catch (err) {
    console.error('Unexpected error in validateTokenSecure:', err);
    return {
      valid: false,
      error: 'Internal error',
    };
  }
}

// ============================================================================
// FALLBACK: Direct Access (apenas para DEV MODE)
// ============================================================================

/**
 * ⚠️ INSEGURO: Validação direta de token (apenas para desenvolvimento)
 *
 * Esta função acessa a tabela access_tokens diretamente.
 * Só funciona se RLS estiver desabilitado.
 * NÃO marca como usado (Passe Livre 24h).
 *
 * @deprecated Use validateTokenSecure() em produção
 * @param token - Token UUID
 * @returns Token data ou null
 */
export async function validateTokenDirect(
  token: string
): Promise<{ email: string } | null> {
  try {
    const { data, error } = await supabase
      .from('access_tokens')
      .select('email, token, used, expires_at, created_at')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (error || !data) {
      console.error('Token validation error:', error);
      return null;
    }

    // Verificar se está dentro das 24h (Passe Livre)
    const createdAt = new Date(data.created_at);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceCreation >= 24) {
      // Token expirou (>24h) - marcar como usado
      await supabase
        .from('access_tokens')
        .update({ used: true })
        .eq('token', token);
      return null;
    }

    // Token válido - NÃO marca como usado durante 24h
    return { email: data.email };
  } catch (err) {
    console.error('Unexpected error in validateTokenDirect:', err);
    return null;
  }
}

// ============================================================================
// SMART TOKEN VALIDATION (Auto-detect)
// ============================================================================

/**
 * Validação inteligente de token que detecta automaticamente o método correto.
 *
 * - Tenta usar Edge Function (seguro)
 * - Se falhar, tenta acesso direto (dev mode)
 *
 * @param token - Token UUID
 * @returns Objeto com valid, email, isLifetime, expiresAt, createdAt
 */
export async function validateToken(
  token: string
): Promise<{
  valid: boolean;
  email: string | null;
  isLifetime?: boolean;
  expiresAt?: string | null;
  createdAt?: string;
}> {
  // Verificar se Supabase está configurado
  const hasSupabaseConfig =
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Dev mode: skip validation
  if (!hasSupabaseConfig) {
    console.log('🔧 DEV MODE: Supabase not configured, skipping validation');
    return { valid: true, email: 'dev@example.com', isLifetime: false };
  }

  // Dev tokens
  if (token?.startsWith('dev-') || token?.startsWith('test-')) {
    console.log('🔧 DEV MODE: Dev token detected, skipping validation');
    return { valid: true, email: 'dev@example.com', isLifetime: false };
  }

  // Tentar Edge Function primeiro (seguro)
  console.log('🔐 Validating token via Edge Function...');
  const secureResult = await validateTokenSecure(token);

  if (secureResult.valid) {
    console.log('✅ Token validated via Edge Function', {
      isLifetime: secureResult.isLifetime,
      expiresAt: secureResult.expiresAt,
    });
    return {
      valid: true,
      email: secureResult.email || null,
      isLifetime: secureResult.isLifetime,
      expiresAt: secureResult.expiresAt,
      createdAt: secureResult.createdAt,
    };
  }

  // Fallback: Acesso direto (dev mode)
  console.log('⚠️ Edge Function failed, trying direct access (dev mode)...');
  const directResult = await validateTokenDirect(token);

  if (directResult) {
    console.log('✅ Token validated via direct access');
    return {
      valid: true,
      email: directResult.email,
      isLifetime: false,
    };
  }

  // Token inválido
  console.error('❌ Token validation failed');
  return {
    valid: false,
    email: null,
  };
}

// ============================================================================
// DIAGNOSTIC INSERT (Secure)
// ============================================================================

/**
 * Insere um diagnóstico de forma segura.
 *
 * RLS Policy permite INSERT para anon, então é seguro usar diretamente.
 *
 * @param data - Dados do diagnóstico
 * @returns ID do diagnóstico criado ou null
 */
export async function insertDiagnosticSecure(data: {
  email: string;
  data: unknown;
}): Promise<string | null> {
  try {
    const { data: result, error } = await supabase
      .from('diagnostics')
      .insert(data)
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting diagnostic:', error);
      return null;
    }

    return result?.id || null;
  } catch (err) {
    console.error('Unexpected error in insertDiagnosticSecure:', err);
    return null;
  }
}

// ============================================================================
// DIAGNOSTIC SELECT BY ID (Secure)
// ============================================================================

/**
 * Busca um diagnóstico específico por ID.
 *
 * RLS Policy permite SELECT apenas por ID exato, então é seguro.
 *
 * @param id - UUID do diagnóstico
 * @returns Dados do diagnóstico ou null
 */
export async function getDiagnosticByIdSecure(
  id: string
): Promise<unknown | null> {
  try {
    const { data, error } = await supabase
      .from('diagnostics')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching diagnostic:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error in getDiagnosticByIdSecure:', err);
    return null;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  validateTokenSecure,
  validateToken,
  insertDiagnosticSecure,
  getDiagnosticByIdSecure,
};
