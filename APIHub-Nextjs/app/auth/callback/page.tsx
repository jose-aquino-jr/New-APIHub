'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    // OAuth do Supabase vem no HASH (#)
    const hash = window.location.hash.replace('#', '')
    const params = new URLSearchParams(hash)

    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (!accessToken) {
      router.replace('/login?error=no_token')
      return
    }

    // 🔐 Salva tokens
    localStorage.setItem('authToken', accessToken)
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
    }

    // 👤 Extrai dados básicos do JWT (email, id)
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]))

      const user = {
        id: payload.sub,
        email: payload.email,
        name:
          payload.user_metadata?.full_name ||
          payload.user_metadata?.name ||
          'Usuário'
      }

      localStorage.setItem('apihub_user', JSON.stringify(user))
    } catch {
      router.replace('/login?error=invalid_token')
      return
    }

    // entra no app
    router.replace('/')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Finalizando login...</p>
      </div>
    </div>
  )
}
