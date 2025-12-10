'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ error: any }>
  register: (email: string, password: string, name: string, acceptTerms: boolean) => Promise<{ error: any }> // ← ATUALIZADO
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
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          
          // Carregar favoritos do localStorage
          const favs = localStorage.getItem(`favorites_${parsedUser.id}`)
          if (favs) setFavorites(JSON.parse(favs))
        }
      }
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
      if (!response.ok) return
      
      const data = await response.json()
      const favoriteIds = data?.map((fav: any) => fav.api_id) || []
      setFavorites(favoriteIds)
      // Salvar no localStorage
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favoriteIds))
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
        // Remover dos favoritos
        const response = await fetch('https://apihub-br.duckdns.org/favoritos', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            api_id: apiId
          })
        })

        if (response.ok) {
          const newFavorites = favorites.filter(id => id !== apiId)
          setFavorites(newFavorites)
          localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites))
        }
      } else {
        // Adicionar aos favoritos
        const response = await fetch('https://apihub-br.duckdns.org/favoritos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            api_id: apiId
          })
        })

        if (response.ok) {
          const newFavorites = [...favorites, apiId]
          setFavorites(newFavorites)
          localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites))
        }
      }
    } catch (error: any) {
      console.error('Erro ao alternar favorito:', error)
      alert('Erro ao favoritar/desfavoritar API')
    }
  }

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('https://apihub-br.duckdns.org/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          senha: password 
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        const userData = data.user
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        // Carregar favoritos após login
        await loadFavorites()
        return { error: null }
      }
      return { error: new Error(data.message || 'Erro no login') }
    } catch (error) {
      return { error: new Error('Erro de conexão') }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (email: string, password: string, name: string, acceptTerms: boolean) => {
  setIsLoading(true)
  try {
    const response = await fetch('https://apihub-br.duckdns.org/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: email.trim().toLowerCase(), 
        senha: password,
        name: name.trim(),
        aceitou_termos: acceptTerms // ← AQUI ENVIAMOS OS TERMOS
      })
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      const userData = data.user
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return { error: null }
    }
    return { error: new Error(data.message || 'Erro no cadastro') }
  } catch (error) {
    return { error: new Error('Erro de conexão') }
  } finally {
    setIsLoading(false)
  }
}

  const handleLogout = async () => {
    setUser(null)
    setFavorites([])
    localStorage.removeItem('user')
    if (user) {
      localStorage.removeItem(`favorites_${user.id}`)
    }
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