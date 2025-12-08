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
  favorites: string[]
  toggleFavorite: (apiId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    initializeAuth()
  }, [])

  useEffect(() => {
    if (user) {
      loadFavorites()
    } else {
      setFavorites([])
    }
  }, [user])

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

  const loadFavorites = async () => {
    if (!user) return

    try {
      const response = await fetch(`https://apihub-br.duckdns.org/favoritos/${user.id}`)
      if (!response.ok) throw new Error('Erro ao carregar favoritos')
      
      const data = await response.json()
      const favoriteIds = data?.map((fav: any) => fav.api_id) || []
      setFavorites(favoriteIds)
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error)
    }
  }

  const toggleFavorite = async (apiId: string) => {
    if (!user) {
      alert('Você precisa estar logado para favoritar APIs')
      return
    }

    try {
      const isCurrentlyFavorite = favorites.includes(apiId)

      if (isCurrentlyFavorite) {
        const response = await fetch('https://apihub-br.duckdns.org/favoritos', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            api_id: apiId
          })
        })

        if (response.ok) {
          setFavorites(prev => prev.filter(id => id !== apiId))
        } else {
          const data = await response.json()
          throw new Error(data.message || 'Erro ao remover favorito')
        }
      } else {
        const response = await fetch('https://apihub-br.duckdns.org/favoritos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            api_id: apiId
          })
        })

        if (response.ok) {
          setFavorites(prev => [...prev, apiId])
        } else {
          const data = await response.json()
          throw new Error(data.message || 'Erro ao favoritar')
        }
      }
    } catch (error: any) {
      console.error('Erro ao alternar favorito:', error)
      alert(error.message || 'Erro ao favoritar/desfavoritar API')
    }
  }

  const handleLogin = async (email: string, password: string) => {
    const { user: loggedUser, error } = await login(email, password)
    
    if (error) {
      return { error }
    }
    
    if (loggedUser) {
      setUser(loggedUser)
      return { error: null }
    }
    
    return { error: new Error('Erro desconhecido') }
  }

  const handleRegister = async (email: string, password: string, name: string) => {
    const { user: newUser, error } = await register(email, password, name)
    
    if (error) {
      return { error }
    }
    
    if (newUser) {
      setUser(newUser)
      return { error: null }
    }
    
    return { error: new Error('Erro desconhecido') }
  }

  const handleLogout = async () => {
    await logout()
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    isLoading,
    favorites,
    toggleFavorite,
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
