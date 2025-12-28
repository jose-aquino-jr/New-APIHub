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
        
        console.log('Tokens recebidos:', { access_token, user_id, email })
        
        if (access_token) {
          // Salvar tokens no localStorage
          localStorage.setItem('supabase_access_token', access_token)
          if (refresh_token) {
            localStorage.setItem('supabase_refresh_token', refresh_token)
          }
          if (user_id) {
            localStorage.setItem('supabase_user_id', user_id)
          }
          
          // Buscar dados do usuário do Supabase
          try {
            const userResponse = await fetch('https://apihub-br.duckdns.org/auth/session', {
              headers: {
                'Authorization': `Bearer ${access_token}`
              }
            })
            
            if (userResponse.ok) {
              const userData = await userResponse.json()
              if (userData.success) {
                localStorage.setItem('apihub_user', JSON.stringify(userData.data.user))
              }
            }
          } catch (userError) {
            console.warn('Não foi possível buscar dados do usuário:', userError)
            // Criar objeto básico do usuário
            const basicUser = {
              id: user_id,
              email: email,
              name: email ? email.split('@')[0] : 'Usuário'
            }
            localStorage.setItem('apihub_user', JSON.stringify(basicUser))
          }
          
          // Redirecionar para dashboard
          console.log('✅ Login realizado com sucesso!')
          router.push('/dashboard')
        } else {
          // Tentar usar código se não tiver tokens diretos
          const code = searchParams.get('code')
          if (code) {
            console.log('Usando código para autenticação...')
            // Chamar seu backend para trocar código
            const response = await fetch(`https://apihub-br.duckdns.org/auth/supabase-callback?code=${code}`)
            
            if (response.redirected) {
              // Se houver redirecionamento, seguir
              window.location.href = response.url
            } else {
              const data = await response.json()
              if (data.success && data.session) {
                localStorage.setItem('supabase_access_token', data.session.access_token)
                localStorage.setItem('supabase_refresh_token', data.session.refresh_token)
                localStorage.setItem('apihub_user', JSON.stringify(data.user))
                router.push('/dashboard')
              }
            }
          } else {
            console.error('Nenhum token ou código encontrado')
            router.push('/login?error=no_tokens')
          }
        }
      } catch (error) {
        console.error('Erro no callback:', error)
        router.push('/login?error=callback_failed')
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
