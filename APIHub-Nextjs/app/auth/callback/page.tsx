'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

export default function AuthCallback() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { updateUserData } = useAuth()

  useEffect(() => {
    processOAuthCallback()
  }, [])

  const processOAuthCallback = async () => {
    try {
      console.log('🔐 Processando callback OAuth...')
      
      // OAuth do Supabase vem no HASH (#)
      const hash = window.location.hash.replace('#', '')
      const params = new URLSearchParams(hash)

      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const errorType = params.get('error')
      const errorDescription = params.get('error_description')

      console.log('DEBUG OAuth:', {
        hasAccessToken: !!accessToken,
        hasError: !!errorType,
        errorDescription
      })

      if (errorType) {
        console.error('Erro OAuth:', errorType, errorDescription)
        setError(`Erro na autenticação: ${errorDescription || errorType}`)
        
        setTimeout(() => {
          router.replace('/login?error=oauth_failed')
        }, 2000)
        return
      }

      if (!accessToken) {
        console.error('Token não encontrado no hash')
        setError('Token de acesso não recebido')
        
        setTimeout(() => {
          router.replace('/login?error=no_token')
        }, 2000)
        return
      }

      console.log('✅ Token recebido, salvando...')

      // 🔐 Salva tokens
      localStorage.setItem('authToken', accessToken)
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }

      // 👤 Extrai dados básicos do JWT
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]))
        console.log('DEBUG JWT Payload:', payload)

        const user = {
          id: payload.sub,
          email: payload.email,
          name: payload.user_metadata?.full_name || 
                payload.user_metadata?.name || 
                payload.email?.split('@')[0] || 
                'Usuário',
          avatar_url: payload.user_metadata?.avatar_url || 
                     payload.user_metadata?.picture,
          provider: payload.app_metadata?.provider,
          accept_terms: false // O usuário pode atualizar depois
        }

        console.log('👤 Usuário extraído do JWT:', user)

        // Salvar no localStorage
        localStorage.setItem('apihub_user', JSON.stringify(user))
        
        // Atualizar no contexto
        updateUserData(user)

        // Aguardar um momento para garantir que o contexto foi atualizado
        setTimeout(() => {
          console.log('✅ Login OAuth concluído, redirecionando...')
          router.replace('/')
        }, 500)

      } catch (jwtError: any) {
        console.error('Erro ao decodificar JWT:', jwtError)
        setError('Token inválido')
        
        setTimeout(() => {
          router.replace('/login?error=invalid_token')
        }, 2000)
      }

    } catch (error: any) {
      console.error('Erro geral no callback:', error)
      setError('Erro no processamento do login')
      
      setTimeout(() => {
        router.replace('/login?error=callback_crash')
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Finalizando login...
          </h2>
          <p className="text-gray-600">
            Aguarde enquanto configuramos sua conta
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Erro na autenticação
            </h2>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <button
              onClick={() => router.replace('/login')}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Voltar para o Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}