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
      // O Supabase OAuth retorna estes parâmetros
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')
      
      console.log('📥 Parâmetros do callback:', { 
        code: !!code, 
        error, 
        errorDescription 
      })
      
      if (error) {
        console.error('❌ Erro de autenticação:', errorDescription || error)
        router.replace(`/login?error=${error}`)
        return
      }
      
      if (!code) {
        console.error('❌ Código de autorização não recebido')
        router.replace('/login?error=no_code')
        return
      }
      
      // Aqui você precisa trocar o código por um token
      // Chamar seu backend para fazer o exchange code→token
      console.log('🔄 Trocando código por token...')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://apihub-br.duckdns.org'}/auth/exchange-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      })
      
      if (!response.ok) {
        throw new Error('Falha ao trocar código por token')
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Erro na autenticação')
      }
      
      // Salvar token e dados do usuário
      localStorage.setItem('authToken', data.data.access_token)
      localStorage.setItem('apihub_user', JSON.stringify(data.data.user))
      
      console.log('✅ Login realizado com sucesso!')
      
      // Redirecionar para home ou página original
      const redirectTo = localStorage.getItem('redirectAfterLogin') || '/'
      localStorage.removeItem('redirectAfterLogin')
      router.replace(redirectTo)
      
    } catch (error: any) {
      console.error('🔥 Erro no processo de callback:', error)
      router.replace(`/login?error=callback_crash&message=${encodeURIComponent(error.message)}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Processando autenticação...
        </h2>
        <p className="text-gray-600">Isso pode levar alguns segundos</p>
      </div>
    </div>
  )
}