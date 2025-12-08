// components/AuthProvider.tsx
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@/types'
import { login, register, logout, checkAuth } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ error: any }>
  register: (email: string, password: string, name: string) => Promise<{ error: any }>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const currentUser = await checkAuth()
      setUser(currentUser)
    } catch (error) {
      console.error('Erro ao inicializar auth:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (email: string, password: string) => {
    console.log('AuthProvider: Iniciando login')
    const { user: loggedUser, error } = await login(email, password)
    
    if (error) {
      console.error('AuthProvider Erro:', error.message)
      return { error }
    }
    
    if (loggedUser) {
      console.log('AuthProvider: Login bem sucedido', loggedUser)
      setUser(loggedUser)
      return { error: null }
    }
    
    return { error: new Error('Erro desconhecido') }
  }

  const handleRegister = async (email: string, password: string, name: string) => {
    console.log('AuthProvider: Iniciando registro')
    const { user: newUser, error } = await register(email, password, name)
    
    if (error) {
      console.error('AuthProvider Erro:', error.message)
      return { error }
    }
    
    if (newUser) {
      console.log('AuthProvider: Registro bem sucedido', newUser)
      setUser(newUser)
      return { error: null }
    }
    
    return { error: new Error('Erro desconhecido') }
  }

  const handleLogout = async () => {
    await logout()
    setUser(null)
  }

  const value = {
    user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    isLoading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
