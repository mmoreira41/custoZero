import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateToken as validateTokenSecure } from '@/lib/supabase-secure';

interface UseAuthReturn {
  isValid: boolean | null;
  email: string;
  isLoading: boolean;
  isDevMode: boolean;
}

export function useAuth(): UseAuthReturn {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDevMode, setIsDevMode] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Flag para prevenir updates após unmount
    let cancelled = false;

    const validateAccess = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      // Verificar se Supabase está configurado
      const hasSupabaseConfig =
        import.meta.env.VITE_SUPABASE_URL &&
        import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Modo de desenvolvimento: permitir acesso sem token ou com token de teste
      const isDevToken = token?.startsWith('dev-') || token?.startsWith('test-');
      const skipValidation = !hasSupabaseConfig || isDevToken;

      if (!token) {
        console.error('No token provided');
        if (!cancelled) {
          navigate('/acesso-negado');
        }
        return;
      }

      if (skipValidation) {
        // Modo de desenvolvimento: bypass da validação
        console.log('🔧 DEV MODE: Validação de token desabilitada');
        console.log('💡 Token:', token);
        console.log('📧 Email: dev@example.com (mock)');
        if (!cancelled) {
          if (token) {
            localStorage.setItem('custozero_token', token);
          }
          setIsDevMode(true);
          setEmail('dev@example.com');
          setIsValid(true);
          setIsLoading(false);
        }
        return;
      }

      // Modo de produção: validação real com secure client
      await validateTokenWithSecureClient(token, cancelled);
    };

    validateAccess();

    // Cleanup: prevenir updates após unmount
    return () => {
      cancelled = true;
    };
  }, []); // Remover navigate das dependencies

  async function validateTokenWithSecureClient(token: string, cancelled: boolean) {
    try {
      if (!cancelled) {
        setIsLoading(true);
      }

      // ✅ Usar secure client que chama Edge Function
      // Edge Function valida E marca como usado automaticamente
      const result = await validateTokenSecure(token);

      // Evitar updates se componente foi desmontado
      if (cancelled) return;

      if (!result.valid || !result.email) {
        console.error('Token validation failed:', result.email);
        navigate('/acesso-negado');
        return;
      }

      // Token válido - atualizar state apenas se não foi cancelado
      if (!cancelled) {
        localStorage.setItem('custozero_token', token);
        setEmail(result.email);
        setIsValid(true);
        setIsDevMode(false);

        // Salvar informações de lifetime e expiração no localStorage
        if (result.isLifetime) {
          localStorage.setItem('custozero_is_lifetime', 'true');
          localStorage.removeItem('custozero_expires_at');
        } else {
          localStorage.setItem('custozero_is_lifetime', 'false');
          if (result.expiresAt) {
            localStorage.setItem('custozero_expires_at', result.expiresAt);
          }
        }
        if (result.createdAt) {
          localStorage.setItem('custozero_created_at', result.createdAt);
        }
      }

    } catch (err) {
      console.error('Unexpected error validating token:', err);
      if (!cancelled) {
        navigate('/acesso-negado');
      }
    } finally {
      if (!cancelled) {
        setIsLoading(false);
      }
    }
  }

  return {
    isValid,
    email,
    isLoading,
    isDevMode,
  };
}
