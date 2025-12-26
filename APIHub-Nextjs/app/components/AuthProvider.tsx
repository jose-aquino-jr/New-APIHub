// components/AuthProvider.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  favorites: string[]
  login: (email: string, password: string) => Promise<{ error: Error | null }>
  logout: () => void
  toggleFavorite: (apiId: string) => Promise<void>
  isAuthenticated: boolean
  loadFavorites: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    // Verificar se há usuário salvo
    const savedUser = localStorage.getItem('apihub_user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        
        // Carregar favoritos do localStorage
        const savedFavorites = localStorage.getItem(`favorites_${userData.id}`)
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites))
        }
      } catch (error) {
        localStorage.removeItem('apihub_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('https://apihub-br.duckdns.org/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          senha: password 
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        const userData = data.user
        
        // Salvar token se existir
        if (data.session?.access_token) {
          localStorage.setItem('authToken', data.session.access_token)
        }
        
        setUser(userData)
        localStorage.setItem('apihub_user', JSON.stringify(userData))
        
        // Carregar favoritos do backend
        await loadFavoritesFromBackend(userData.id)
        
        return { error: null }
      }
      return { error: new Error(data.message || 'Erro no login') }
    } catch (error) {
      return { error: new Error('Erro de conexão') }
    }
  }

  const loadFavoritesFromBackend = async (userId: string) => {
    try {
      const response = await fetch(`https://apihub-br.duckdns.org/user-favorites?user_id=${userId}`)
      
      if (response.ok) {
        const data = await response.json()
        const favoriteIds = data.data?.map((fav: any) => fav.api_id) || []
        
        setFavorites(favoriteIds)
        localStorage.setItem(`favorites_${userId}`, JSON.stringify(favoriteIds))
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos do backend:', error)
    }
  }

  const loadFavorites = async () => {
    if (!user) return
    
    await loadFavoritesFromBackend(user.id)
  }

  const toggleFavorite = async (apiId: string) => {
    if (!user) {
      alert('Você precisa estar logado para favoritar APIs')
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      const isCurrentlyFavorite = favorites.includes(apiId)

      if (isCurrentlyFavorite) {
        // Remover dos favoritos
        const response = await fetch(
          `https://apihub-br.duckdns.org/user-favorites?user_id=${user.id}&api_id=${apiId}`,
          { 
            method: 'DELETE',
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json'
            }
          }
        )

        if (response.ok) {
          const newFavorites = favorites.filter(id => id !== apiId)
          setFavorites(newFavorites)
          localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites))
        }
      } else {
        // Adicionar aos favoritos
        const response = await fetch('https://apihub-br.duckdns.org/user-favorites', {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          },
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

  const logout = () => {
    setUser(null)
    setFavorites([])
    localStorage.removeItem('apihub_user')
    localStorage.removeItem('authToken')
    // Limpar todos os favoritos do localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('favorites_')) {
        localStorage.removeItem(key)
      }
    })
    router.push('/')
  }

  const value = {
    user,
    loading,
    favorites,
    login,
    logout,
    toggleFavorite,
    isAuthenticated: !!user,
    loadFavorites
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
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
