'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Capturar tokens da URL (do backend)
        const access_token = searchParams.get('access_token')
        const refresh_token = searchParams.get('refresh_token')
        const user_id = searchParams.get('user_id')
        const email = searchParams.get('email')
        const name = searchParams.get('name')
        
        console.log('AuthCallback: Tokens recebidos:', { 
          access_token: !!access_token, 
          user_id, 
          email 
        })
        
        if (access_token && user_id) {
          console.log('AuthCallback: Salvando tokens no localStorage')
          
          // Salvar tokens no localStorage
          localStorage.setItem('authToken', access_token)
          if (refresh_token) {
            localStorage.setItem('refreshToken', refresh_token)
          }
          
          // Criar objeto do usuário
          const userData = {
            id: user_id,
            email: email || '',
            name: name || (email ? email.split('@')[0] : 'Usuário')
          }
          
          localStorage.setItem('apihub_user', JSON.stringify(userData))
          
          // Fechar popup se estiver em um
          if (window.opener) {
            window.opener.postMessage({ type: 'oauth-completed' }, '*')
            window.close()
          } else {
            // Redirecionar para home
            window.location.href = '/'
          }
        } else {
          console.error('AuthCallback: Nenhum token encontrado')
          
          // Se estiver em popup, tentar fechar
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'oauth-error', 
              error: 'no_tokens' 
            }, '*')
            window.close()
          } else {
            router.push('/login?error=no_tokens')
          }
        }
      } catch (error) {
        console.error('AuthCallback: Erro no callback:', error)
        
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'oauth-error', 
            error: 'callback_failed' 
          }, '*')
          window.close()
        } else {
          router.push('/login?error=callback_failed')
        }
      }
    }
    
    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Finalizando autenticação...</p>
      </div>
    </div>
  )
}
