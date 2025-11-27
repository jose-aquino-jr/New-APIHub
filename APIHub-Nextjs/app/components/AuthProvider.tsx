// components/AuthProvider.tsx
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@/types'
import { checkAuth, login, register, logout } from '@/lib/auth'

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
    const { user: loggedUser, error } = await login(email, password)
    if (!error && loggedUser) {
      setUser(loggedUser)
      localStorage.setItem('user', JSON.stringify(loggedUser))
    }
    return { error }
  }

  const handleRegister = async (email: string, password: string, name: string) => {
    const { user: newUser, error } = await register(email, password, name)
    if (!error && newUser) {
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
    }
    return { error }
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
    isLoading
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
