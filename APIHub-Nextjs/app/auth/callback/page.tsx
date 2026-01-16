// app/auth/callback/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    processCallback()
  }, [])

  const processCallback = async () => {
    try {
      const token = searchParams.get('token')
      const error = searchParams.get('error')
      
      console.log('Callback params:', { token: !!token, error })
      
      if (error) {
        console.error('Erro:', error)
        router.replace(`/login?error=${error}`)
        return
      }
      
      if (!token) {
        console.error('Token não encontrado')
        router.replace('/login?error=no_token')
        return
      }
      
      // Decodificar token JWT
      const payload = JSON.parse(atob(token.split('.')[1]))
      
      const userData = {
        id: payload.sub,
        email: payload.email,
        name: payload.user_metadata?.name || 
              payload.user_metadata?.full_name || 
              payload.email?.split('@')[0] || 
              'Usuário',
        avatar_url: payload.user_metadata?.avatar_url || 
                   payload.user_metadata?.picture,
        provider: payload.app_metadata?.provider,
        accept_terms: false
      }
      
      console.log('Usuário autenticado:', userData.email)
      
      // Salvar no localStorage
      localStorage.setItem('authToken', token)
      localStorage.setItem('apihub_user', JSON.stringify(userData))
      
      // Redirecionar para home
      router.replace('/')
      
    } catch (error: any) {
      console.error('Erro no callback:', error)
      router.replace('/login?error=callback_error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Finalizando login...
        </h2>
      </div>
    </div>
  )
}