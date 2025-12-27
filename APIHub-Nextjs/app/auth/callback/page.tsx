'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      
      if (error) {
        console.error('Erro na autenticação:', error)
        router.push('/login?error=auth_failed')
        return
      }
      
      if (code) {
        try {
          const response = await fetch(`https://https://apihub-br.duckdns.orgauth/callback?code=${code}`)
          const data = await response.json()
          
          if (data.success) {
            // Salvar token
            localStorage.setItem('authToken', data.session.access_token)
            localStorage.setItem('apihub_user', JSON.stringify(data.user))
            
            // Redirecionar
            router.push('/dashboard')
          }
        } catch (err) {
          console.error('Erro no callback:', err)
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