// app/auth/callback/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, X } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Processando autenticação...')

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Verificar se temos parâmetros na URL
        const urlParams = new URLSearchParams(window.location.search)
        const accessToken = urlParams.get('access_token')
        const refreshToken = urlParams.get('refresh_token')
        const error = urlParams.get('error')

        console.log('Auth Callback - Parâmetros:', {
          accessToken: !!accessToken,
          refreshToken: !!refreshToken,
          error
        })

        // Se tem erro
        if (error) {
          setStatus('error')
          setMessage(`Erro: ${error}`)
          setTimeout(() => {
            router.push(`/login?error=${encodeURIComponent(error)}`)
          }, 3000)
          return
        }

        // Se não tem token
        if (!accessToken) {
          setStatus('error')
          setMessage('Token de acesso não recebido')
          setTimeout(() => {
            router.push('/login?error=no_token')
          }, 3000)
          return
        }

        // Salvar tokens
        localStorage.setItem('authToken', accessToken)
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }

        // Decodificar token JWT para obter dados básicos
        try {
          const tokenParts = accessToken.split('.')
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]))
            
            const userData = {
              id: payload.sub,
              email: payload.email,
              name: payload.user_metadata?.name || 
                    payload.user_metadata?.full_name || 
                    payload.email?.split('@')[0] || 
                    'Usuário',
              avatar_url: payload.user_metadata?.avatar_url,
              provider: payload.app_metadata?.provider
            }
            
            localStorage.setItem('apihub_user', JSON.stringify(userData))
            
            setStatus('success')
            setMessage('Login realizado com sucesso!')
            
            // Redirecionar após 2 segundos
            setTimeout(() => {
              // Tentar pegar redirect da URL ou ir para home
              const urlParams = new URLSearchParams(window.location.search)
              const redirectTo = urlParams.get('redirect') || '/'
              
              // Limpar URL antes de redirecionar
              window.history.replaceState({}, document.title, '/auth/callback')
              
              router.push(redirectTo)
            }, 2000)
          } else {
            throw new Error('Token inválido')
          }
        } catch (decodeError) {
          console.error('Erro ao decodificar token:', decodeError)
          setStatus('error')
          setMessage('Token inválido')
          setTimeout(() => {
            router.push('/login?error=invalid_token')
          }, 3000)
        }

      } catch (error) {
        console.error('Erro no callback:', error)
        setStatus('error')
        setMessage('Erro durante a autenticação')
        setTimeout(() => {
          router.push('/login?error=callback_error')
        }, 3000)
      }
    }

    processCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border p-8 text-center">
        <div className="mb-6">
          {status === 'loading' && (
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-16 h-16 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
              <X className="w-8 h-8 text-red-600" />
            </div>
          )}
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'loading' && 'Processando...'}
            {status === 'success' && 'Sucesso!'}
            {status === 'error' && 'Erro'}
          </h1>
          
          <p className="text-gray-600 mb-6">{message}</p>
          
          {status === 'loading' && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-500">
          {status === 'loading' && 'Aguarde enquanto finalizamos seu login...'}
          {status === 'success' && 'Você será redirecionado automaticamente...'}
          {status === 'error' && 'Redirecionando para a página de login...'}
        </div>
      </div>
    </div>
  )
}