// app/components/AuthProvider.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { User, AuthResponse } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  token: string | null
  login: (email: string, password: string) => Promise<{ error: Error | null }>
  logout: () => Promise<void>
  register: (email: string, password: string, name: string, acceptTerms: boolean) => Promise<{ error: Error | null }>
  loginWithGoogle: () => void
  loginWithGitHub: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apihub-br.duckdns.org'

// Funções auxiliares para cookies
const setCookie = (name: string, value: string, days = 7) => {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/; secure; samesite=lax`
}

const removeCookie = (name: string) => {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Verificar token no localStorage (para compatibilidade)
      const savedToken = localStorage.getItem('authToken')
      const savedUser = localStorage.getItem('apihub_user')
      
      if (savedToken && savedUser) {
        const userData = JSON.parse(savedUser) as User
        
        // Validar token com backend
        const isValid = await validateToken(savedToken)
        
        if (isValid) {
          setUser(userData)
          setToken(savedToken)
          setCookie('authToken', savedToken)
        } else {
          // Token inválido, limpar tudo
          clearAuthData()
        }
      }
      
      // Também verificar se há token nos cookies (para SSR)
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        acc[key] = value
        return acc
      }, {} as Record<string, string>)
      
      const cookieToken = cookies['authToken']
      
      if (cookieToken && cookieToken !== savedToken) {
        // Token no cookie mas não no localStorage, sincronizar
        setToken(cookieToken)
        setCookie('authToken', cookieToken)
        
        // Buscar dados do usuário
        await fetchUserData(cookieToken)
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserData = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/session`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.user) {
          const userData = data.data.user as User
          setUser(userData)
          localStorage.setItem('apihub_user', JSON.stringify(userData))
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error)
    }
  }

  const validateToken = async (authToken: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/session`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      return response.ok
    } catch {
      return false
    }
  }

  const clearAuthData = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('apihub_user')
    localStorage.removeItem('refreshToken')
    removeCookie('authToken')
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          senha: password 
        })
      })
      
      const result: AuthResponse = await response.json()
      
      if (response.ok && result.success && result.data) {
        const userData = result.data.user
        const accessToken = result.data.session.access_token
        
        // Salvar no localStorage
        localStorage.setItem('authToken', accessToken)
        localStorage.setItem('apihub_user', JSON.stringify(userData))
        
        if (result.data.session.refresh_token) {
          localStorage.setItem('refreshToken', result.data.session.refresh_token)
        }
        
        // Salvar nos cookies para SSR
        setCookie('authToken', accessToken)
        
        // Atualizar estado
        setUser(userData)
        setToken(accessToken)
        
        return { error: null }
      }
      
      return { error: new Error(result.message || 'Erro no login') }
    } catch (error: any) {
      return { error: new Error('Erro de conexão com o servidor') }
    }
  }

  const register = async (email: string, password: string, name: string, acceptTerms: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          senha: password,
          name: name.trim(),
          aceitou_termos: acceptTerms
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        return { error: null }
      }
      
      const errorMessage = data.message || 'Erro no registro'
      
      if (errorMessage.includes('já existe') || errorMessage.includes('already')) {
        return { error: new Error('Este email já está cadastrado') }
      }
      
      return { error: new Error(errorMessage) }
    } catch (error: any) {
      return { error: new Error('Erro de conexão com o servidor') }
    }
  }

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(console.error)
      }
    } finally {
      clearAuthData()
      router.push('/')
      router.refresh() // Forçar refresh de server components
    }
  }

  const refreshUser = async () => {
    if (!token) return
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/session`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.user) {
          const updatedUser = { ...user, ...data.data.user } as User
          setUser(updatedUser)
          localStorage.setItem('apihub_user', JSON.stringify(updatedUser))
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
    }
  }

  const loginWithGoogle = () => {
    localStorage.setItem('redirectAfterLogin', window.location.pathname)
    window.location.href = `${API_BASE_URL}/auth/google`
  }

  const loginWithGitHub = () => {
    localStorage.setItem('redirectAfterLogin', window.location.pathname)
    window.location.href = `${API_BASE_URL}/auth/github`
  }

  // Processar callback OAuth (se houver hash na URL)
  useEffect(() => {
    const handleOAuthCallback = () => {
      const hash = window.location.hash
      if (hash && (hash.includes('access_token') || hash.includes('provider_token'))) {
        // Processar tokens do hash
        const params = new URLSearchParams(hash.substring(1))
        const accessToken = params.get('access_token') || params.get('provider_token')
        
        if (accessToken) {
          // Salvar token
          localStorage.setItem('authToken', accessToken)
          setCookie('authToken', accessToken)
          
          // Limpar hash da URL
          window.history.replaceState(null, '', window.location.pathname)
          
          // Buscar dados do usuário e redirecionar
          fetchUserData(accessToken).then(() => {
            const redirectTo = localStorage.getItem('redirectAfterLogin') || '/'
            localStorage.removeItem('redirectAfterLogin')
            router.push(redirectTo)
          })
        }
      }
    }
    
    handleOAuthCallback()
  }, [router])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      token,
      login,
      logout,
      register,
      loginWithGoogle,
      loginWithGitHub,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}