// components/AuthProvider.tsx - VERSÃO COMPLETA E CORRIGIDA
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  accept_terms?: boolean
  avatar_url?: string
  provider?: string
}

interface Favorite {
  id: string
  user_id: string
  api_id: string
  created_at: string
  apis?: {
    id: string
    name: string
    description: string
    rating: number
    tags: string
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  favorites: string[]
  favoriteObjects: Favorite[]
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ error: Error | null }>
  register: (email: string, password: string, name: string, acceptTerms: boolean) => Promise<{ error: Error | null }>
  logout: () => void
  toggleFavorite: (apiId: string) => Promise<void>
  loadFavorites: () => Promise<void>
  checkSession: () => Promise<boolean>
  updateUserData: (userData: Partial<User>) => void
  loginWithGitHub: () => void
  loginWithGoogle: () => void
  handleOAuthCallback: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apihub-br.duckdns.org'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [favoriteObjects, setFavoriteObjects] = useState<Favorite[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`favorites_objects_${user.id}`, JSON.stringify(favoriteObjects))
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favorites))
    }
  }, [favoriteObjects, favorites, user])

  const checkAuth = async () => {
    try {
      const savedUser = localStorage.getItem('apihub_user')
      const savedToken = localStorage.getItem('authToken')
      
      console.log('DEBUG checkAuth:', { savedUser: !!savedUser, savedToken: !!savedToken })
      
      if (savedUser && savedToken) {
        const userData = JSON.parse(savedUser)
        
        const isValid = await checkSession()
        
        if (isValid) {
          setUser(userData)
          setToken(savedToken)
          
          const savedFavorites = localStorage.getItem(`favorites_${userData.id}`)
          if (savedFavorites) {
            try {
              const parsed = JSON.parse(savedFavorites)
              setFavorites(parsed)
            } catch (e) {
              console.warn('Erro ao parsear favoritos:', e)
            }
          }
          
          try {
            await loadFavoritesFromBackend(userData.id)
          } catch (error) {
            console.warn('Não foi possível carregar favoritos:', error)
          }
        } else {
          clearAuthData()
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearAuthData = () => {
    setUser(null)
    setToken(null)
    setFavoriteObjects([])
    setFavorites([])
    localStorage.removeItem('apihub_user')
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('favorites_')) {
        localStorage.removeItem(key)
      }
    })
  }

  const checkSession = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return false

      const response = await fetch(`${API_BASE_URL}/auth/session`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 401) {
        return false
      }

      const data = await response.json()
      return data.success && data.data?.user
      
    } catch (error) {
      console.error('Erro ao verificar sessão:', error)
      return false
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          senha: password 
        })
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        const userData = {
          id: result.data?.user?.id,
          email: result.data?.user?.email || email,
          name: result.data?.user?.name || 'Usuário',
          accept_terms: result.data?.user?.accept_terms || false,
          avatar_url: result.data?.user?.avatar_url,
          provider: result.data?.user?.provider
        }
        
        if (result.data?.session?.access_token) {
          const accessToken = result.data.session.access_token
          localStorage.setItem('authToken', accessToken)
          setToken(accessToken)
        }
        
        if (result.data?.session?.refresh_token) {
          localStorage.setItem('refreshToken', result.data.session.refresh_token)
        }
        
        localStorage.setItem('apihub_user', JSON.stringify(userData))
        setUser(userData)
        
        await loadFavoritesFromBackend(userData.id)
        
        return { error: null }
      }
      
      return { 
        error: new Error(result.message || 'Email ou senha incorretos') 
      }
    } catch (error: any) {
      return { 
        error: new Error('Erro de conexão com o servidor. Tente novamente.') 
      }
    }
  }

  const register = async (email: string, password: string, name: string, acceptTerms: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cadastro`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
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
      return { 
        error: new Error('Erro de conexão com o servidor. Verifique sua internet.') 
      }
    }
  }

  const loadFavoritesFromBackend = async (userId: string) => {
    try {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        console.warn('Token não disponível para carregar favoritos')
        return
      }
      
      const response = await fetch(`${API_BASE_URL}/user-favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.status === 401) {
        console.warn('Token expirado')
        clearAuthData()
        return
      }
      
      if (!response.ok) {
        console.error('Erro HTTP ao carregar favoritos:', response.status)
        return
      }
      
      const data = await response.json()
      
      if (data.success && Array.isArray(data.data)) {
        const favoritesData = data.data.map((fav: any) => ({
          id: fav.id,
          user_id: fav.user_id,
          api_id: fav.api_id,
          created_at: fav.created_at,
          apis: fav.apis ? {
            id: fav.apis.id,
            name: fav.apis.name,
            description: fav.apis.description,
            rating: fav.apis.rating || 0,
            tags: fav.apis.tags || ''
          } : undefined
        }))
        
        setFavoriteObjects(favoritesData)
        setFavorites(favoritesData.map((fav: Favorite) => fav.api_id)) // Corrigido aqui
      }
      
    } catch (error: any) {
      console.error('Erro ao carregar favoritos:', error)
    }
  }

  const loadFavorites = async () => {
    if (!user) return
    await loadFavoritesFromBackend(user.id)
  }

  const toggleFavorite = async (apiId: string): Promise<void> => {
    if (!user) {
      alert('Você precisa estar logado para favoritar APIs')
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        alert('Sessão expirada. Faça login novamente.')
        clearAuthData()
        router.push('/login')
        return
      }

      const isCurrentlyFavorite = favorites.includes(apiId)
      
      if (isCurrentlyFavorite) {
        const response = await fetch(`${API_BASE_URL}/user-favorites/${apiId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.status === 401) {
          alert('Sessão expirada. Faça login novamente.')
          clearAuthData()
          router.push('/login')
          return
        }

        const data = await response.json()
        
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Erro ao remover favorito')
        }
        
        // CORREÇÃO COMPLETA: Tipagem explícita em todos os parâmetros
        setFavoriteObjects(prev => prev.filter((fav: Favorite) => fav.api_id !== apiId))
        setFavorites(prev => prev.filter((id: string) => id !== apiId))
        
      } else {
        const response = await fetch(`${API_BASE_URL}/user-favorites`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ api_id: apiId })
        })

        if (response.status === 401) {
          alert('Sessão expirada. Faça login novamente.')
          clearAuthData()
          router.push('/login')
          return
        }

        const data = await response.json()
        
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Erro ao adicionar favorito')
        }
        
        const newFavorite = {
          id: data.data?.id || Date.now().toString(),
          user_id: user.id,
          api_id: apiId,
          created_at: new Date().toISOString(),
          apis: data.data?.apis ? {
            id: data.data.apis.id,
            name: data.data.apis.name,
            description: data.data.apis.description,
            rating: data.data.apis.rating || 0,
            tags: data.data.apis.tags || ''
          } : undefined
        }
        
        setFavoriteObjects(prev => [...prev, newFavorite])
        setFavorites(prev => [...prev, apiId])
      }
      
    } catch (error: any) {
      console.error('Erro ao alternar favorito:', error)
      
      if (error.message.includes('Token') || error.message.includes('401')) {
        alert('Sessão expirada. Faça login novamente.')
        clearAuthData()
        router.push('/login')
      } else {
        alert(error.message || 'Erro ao favoritar/desfavoritar API')
      }
      throw error
    }
  }

  const updateUserData = (userData: Partial<User>) => {
    if (!user) return
    
    const updatedUser = { ...user, ...userData }
    setUser(updatedUser)
    localStorage.setItem('apihub_user', JSON.stringify(updatedUser))
  }

  const loginWithGitHub = () => {
    window.location.href = `${API_BASE_URL}/auth/github`
  }

  const loginWithGoogle = () => {
    window.location.href = `${API_BASE_URL}/auth/google`
  }

  const handleOAuthCallback = async (): Promise<boolean> => {
    try {
      console.log('DEBUG handleOAuthCallback - URL atual:', window.location.href)
      
      // Verificar se temos parâmetros de query
      const searchParams = new URLSearchParams(window.location.search)
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')
      const error = searchParams.get('error')
      
      if (error) {
        console.error('Erro no callback OAuth:', error)
        router.replace(`/login?error=${encodeURIComponent(error)}`)
        return false
      }
      
      // Se não tem parâmetros de query, verificar hash (formato do Supabase)
      if (!accessToken) {
        const hash = window.location.hash.replace('#', '')
        const hashParams = new URLSearchParams(hash)
        const hashAccessToken = hashParams.get('access_token')
        const hashRefreshToken = hashParams.get('refresh_token')
        
        if (hashAccessToken) {
          console.log('DEBUG: Token encontrado no hash')
          localStorage.setItem('authToken', hashAccessToken)
          if (hashRefreshToken) {
            localStorage.setItem('refreshToken', hashRefreshToken)
          }
          
          // Decodificar token JWT para obter dados do usuário
          try {
            const tokenParts = hashAccessToken.split('.')
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]))
              
              const userData = {
                id: payload.sub,
                email: payload.email,
                name: payload.user_metadata?.name || 
                      payload.user_metadata?.full_name || 
                      payload.email?.split('@')[0] || 
                      'Usuário',
                avatar_url: payload.user_metadata?.avatar_url,
                provider: payload.app_metadata?.provider
              }
              
              localStorage.setItem('apihub_user', JSON.stringify(userData))
              setUser(userData)
              setToken(hashAccessToken)
              
              // Limpar URL
              window.history.replaceState({}, document.title, window.location.pathname)
              
              // Carregar favoritos
              await loadFavoritesFromBackend(userData.id)
              
              return true
            }
          } catch (decodeError) {
            console.error('Erro ao decodificar token:', decodeError)
          }
        }
      } else {
        // Usar tokens dos parâmetros de query
        console.log('DEBUG: Token encontrado nos query params')
        localStorage.setItem('authToken', accessToken)
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }
        
        // Buscar dados do usuário do backend
        try {
          const response = await fetch(`${API_BASE_URL}/auth/session`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.data?.user) {
              localStorage.setItem('apihub_user', JSON.stringify(data.data.user))
              setUser(data.data.user)
              setToken(accessToken)
              
              await loadFavoritesFromBackend(data.data.user.id)
              
              // Limpar URL
              window.history.replaceState({}, document.title, window.location.pathname)
              
              return true
            }
          }
        } catch (sessionError) {
          console.error('Erro ao buscar dados da sessão:', sessionError)
        }
      }
      
      console.log('DEBUG: Nenhum token válido encontrado')
      router.replace('/login?error=oauth_failed')
      return false
      
    } catch (error) {
      console.error('Erro no callback OAuth:', error)
      router.replace('/login?error=callback_error')
      return false
    }
  }

  useEffect(() => {
    // Verificar se estamos na página de callback
    if (pathname === '/auth/callback') {
      handleOAuthCallback().then(success => {
        if (success) {
          router.replace('/')
        }
      })
    }
  }, [pathname])

  const logout = () => {
    const token = localStorage.getItem('authToken')
    
    if (token) {
      fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).catch(console.error)
    }
    
    clearAuthData()
    router.push('/')
  }

  const value: AuthContextType = {
    user,
    loading,
    favorites,
    favoriteObjects,
    token,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    toggleFavorite,
    loadFavorites,
    checkSession,
    updateUserData,
    loginWithGitHub,
    loginWithGoogle,
    handleOAuthCallback
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