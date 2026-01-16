// app/auth/callback/page.tsx - VERSÃO SIMPLIFICADA
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
        console.log('🔍 Iniciando processamento do callback OAuth')
        
        // Obter URL de redirecionamento salva
        const redirectPath = localStorage.getItem('oauth_redirect') || '/'
        localStorage.removeItem('oauth_redirect') // Limpar após usar
        
        // Extrair parâmetros da URL
        const urlParams = new URLSearchParams(window.location.search)
        const accessToken = urlParams.get('access_token')
        const refreshToken = urlParams.get('refresh_token')
        const error = urlParams.get('error')
        
        console.log('🔍 Parâmetros recebidos:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          error: error,
          redirectPath: redirectPath
        })

        // Se tem erro
        if (error) {
          console.error('❌ Erro no OAuth:', error)
          setStatus('error')
          setMessage(`Erro: ${error}`)
          setTimeout(() => {
            router.push(`/login?error=${encodeURIComponent(error)}`)
          }, 2000)
          return
        }

        // Se não tem token, verificar no hash (formato antigo)
        if (!accessToken) {
          const hash = window.location.hash.substring(1) // Remove o #
          const hashParams = new URLSearchParams(hash)
          const hashAccessToken = hashParams.get('access_token')
          const hashRefreshToken = hashParams.get('refresh_token')
          
          if (hashAccessToken) {
            console.log('✅ Token encontrado no hash')
            await processToken(hashAccessToken, hashRefreshToken, redirectPath)
            return
          }
          
          setStatus('error')
          setMessage('Token de acesso não recebido')
          setTimeout(() => {
            router.push(`/login?error=no_token`)
          }, 2000)
          return
        }

        // Processar token
        await processToken(accessToken, refreshToken, redirectPath)

      } catch (error) {
        console.error('❌ Erro crítico no callback:', error)
        setStatus('error')
        setMessage('Erro durante a autenticação')
        setTimeout(() => {
          router.push('/login?error=callback_error')
        }, 2000)
      }
    }

    const processToken = async (accessToken: string, refreshToken: string | null, redirectPath: string) => {
      try {
        console.log('🔧 Processando token...')
        
        // Salvar tokens
        localStorage.setItem('authToken', accessToken)
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }

        // Tentar obter dados do usuário do backend
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apihub-br.duckdns.org'
        
        try {
          console.log('🔄 Buscando dados da sessão no backend...')
          const response = await fetch(`${API_BASE_URL}/auth/session`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            console.log('✅ Resposta do backend:', data)
            
            if (data.success && data.data?.user) {
              // Salvar dados completos do backend
              const userData = {
                id: data.data.user.id,
                email: data.data.user.email,
                name: data.data.user.name || 'Usuário',
                accept_terms: data.data.user.accept_terms,
                avatar_url: data.data.user.avatar_url,
                provider: data.data.user.provider
              }
              
              localStorage.setItem('apihub_user', JSON.stringify(userData))
              
              setStatus('success')
              setMessage('Login realizado com sucesso!')
              
              // Limpar URL e redirecionar
              setTimeout(() => {
                window.history.replaceState({}, document.title, '/auth/callback')
                router.push(redirectPath)
              }, 1000)
              return
            }
          } else {
            console.warn('⚠️ Backend não respondeu com sucesso:', response.status)
          }
        } catch (apiError) {
          console.warn('⚠️ Não foi possível conectar ao backend, usando token JWT:', apiError)
        }

        // Fallback: Decodificar token JWT
        console.log('🔄 Decodificando token JWT...')
        const tokenParts = accessToken.split('.')
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]))
          console.log('✅ Payload JWT:', payload)
          
          const userData = {
            id: payload.sub || `user_${Date.now()}`,
            email: payload.email || 'usuario@exemplo.com',
            name: payload.user_metadata?.name || 
                  payload.user_metadata?.full_name || 
                  payload.email?.split('@')[0] || 
                  'Usuário',
            avatar_url: payload.user_metadata?.avatar_url,
            provider: payload.app_metadata?.provider || 'oauth'
          }
          
          localStorage.setItem('apihub_user', JSON.stringify(userData))
          
          setStatus('success')
          setMessage('Login realizado com sucesso!')
          
          // Limpar URL e redirecionar
          setTimeout(() => {
            window.history.replaceState({}, document.title, '/auth/callback')
            router.push(redirectPath)
          }, 1000)
        } else {
          throw new Error('Token JWT inválido')
        }

      } catch (error) {
        console.error('❌ Erro ao processar token:', error)
        setStatus('error')
        setMessage('Erro ao processar token de acesso')
        setTimeout(() => {
          router.push('/login?error=token_error')
        }, 2000)
      }
    }

    processCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 text-center">
        <div className="mb-8">
          {status === 'loading' && (
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-20 h-20 mx-auto mb-6 bg-green-50 rounded-full flex items-center justify-center animate-bounce">
              <Check className="w-10 h-10 text-green-600" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-20 h-20 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
              <X className="w-10 h-10 text-red-600" />
            </div>
          )}
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {status === 'loading' && 'Autenticando...'}
            {status === 'success' && 'Login bem-sucedido!'}
            {status === 'error' && 'Ocorreu um erro'}
          </h1>
          
          <p className="text-lg text-gray-700 mb-6">{message}</p>
          
          {status === 'loading' && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full animate-[loading_2s_ease-in-out_infinite]" 
                   style={{ animation: 'loading 2s ease-in-out infinite' }}></div>
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-600 font-medium">
          {status === 'loading' && 'Por favor, aguarde um momento...'}
          {status === 'success' && 'Redirecionando você de volta...'}
          {status === 'error' && 'Você será redirecionado para a página de login...'}
        </div>
        
        <style jsx>{`
          @keyframes loading {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    </div>
  )
}