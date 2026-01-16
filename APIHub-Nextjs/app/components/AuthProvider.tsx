// components/AuthProvider.tsx - VERSÃO COMPLETA E FUNCIONAL
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

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
  loginWithGoogle: () => void
  loginWithGitHub: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Configuração da API base
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apihub-br.duckdns.org'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [favoriteObjects, setFavoriteObjects] = useState<Favorite[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()

  // Verificar se há token na URL (callback do OAuth)
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token')
    const errorFromUrl = searchParams.get('error')
    
    if (errorFromUrl) {
      console.error('Erro no callback:', errorFromUrl)
      router.replace(`/login?error=${errorFromUrl}`)
      return
    }
    
    if (tokenFromUrl) {
      console.log('🔐 Token recebido da URL, processando...')
      processTokenFromCallback(tokenFromUrl)
    }
  }, [searchParams])

  // Verificar autenticação existente ao iniciar
  useEffect(() => {
    checkExistingAuth()
  }, [])

  // Sincronizar favorites com favoriteObjects
  useEffect(() => {
    const ids = favoriteObjects.map(fav => fav.api_id)
    setFavorites(ids)
    
    if (user?.id) {
      localStorage.setItem(`favorites_objects_${user.id}`, JSON.stringify(favoriteObjects))
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(ids))
    }
  }, [favoriteObjects, user])

  const processTokenFromCallback = async (token: string) => {
    try {
      console.log('🔄 Processando token do callback...')
      
      // Decodificar token JWT para extrair dados
      const payload = JSON.parse(atob(token.split('.')[1]))
      
      const userData = {
        id: payload.sub,
        email: payload.email,
        name: payload.user_metadata?.name || 
              payload.user_metadata?.full_name || 
              payload.email?.split('@')[0] || 
              'Usuário',
        avatar_url: payload.user_metadata?.avatar_url || 
                   payload.user_metadata?.picture,
        provider: payload.app_metadata?.provider,
        accept_terms: false
      }
      
      console.log('✅ Usuário extraído do token:', userData.email)
      
      // Salvar no localStorage
      localStorage.setItem('authToken', token)
      localStorage.setItem('apihub_user', JSON.stringify(userData))
      
      // Atualizar estado
      setToken(token)
      setUser(userData)
      
      // Carregar favoritos
      await loadFavoritesFromBackend(userData.id)
      
      // Limpar URL e redirecionar
      window.history.replaceState(null, '', '/')
      router.replace('/')
      
    } catch (error: any) {
      console.error('❌ Erro ao processar token:', error)
      router.replace('/login?error=token_error')
    }
  }

  const checkExistingAuth = async () => {
    try {
      const savedUser = localStorage.getItem('apihub_user')
      const savedToken = localStorage.getItem('authToken')
      
      if (savedUser && savedToken) {
        const userData = JSON.parse(savedUser)
        
        // Verificar se o token ainda é válido
        const isValid = await verifyToken(savedToken)
        
        if (isValid) {
          setUser(userData)
          setToken(savedToken)
          
          // Carregar favoritos do localStorage
          const savedFavorites = localStorage.getItem(`favorites_${userData.id}`)
          if (savedFavorites) {
            try {
              setFavorites(JSON.parse(savedFavorites))
            } catch (e) {
              console.warn('Erro ao parsear favoritos:', e)
            }
          }
          
          const savedFavoriteObjects = localStorage.getItem(`favorites_objects_${userData.id}`)
          if (savedFavoriteObjects) {
            try {
              setFavoriteObjects(JSON.parse(savedFavoriteObjects))
            } catch (e) {
              console.warn('Erro ao parsear favorite objects:', e)
            }
          }
          
          // Sincronizar com backend
          try {
            await loadFavoritesFromBackend(userData.id)
          } catch (error) {
            console.warn('Não foi possível carregar favoritos do backend:', error)
          }
        } else {
          console.log('Token inválido, limpando dados...')
          clearAuthData()
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
    } finally {
      setLoading(false)
    }
  }

  const verifyToken = async (token: string): Promise<boolean> => {
    try {
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
      console.error('Erro ao verificar token:', error)
      return false
    }
  }

  const clearAuthData = () => {
    setUser(null)
    setToken(null)
    setFavoriteObjects([])
    setFavorites([])
    
    // Limpar localStorage
    localStorage.removeItem('apihub_user')
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    
    if (user?.id) {
      localStorage.removeItem(`favorites_${user.id}`)
      localStorage.removeItem(`favorites_objects_${user.id}`)
    }
  }

  const checkSession = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('authToken')
      return await verifyToken(token || '')
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
        
        const accessToken = result.data?.session?.access_token
        if (accessToken) {
          localStorage.setItem('authToken', accessToken)
          setToken(accessToken)
          
          if (result.data?.session?.refresh_token) {
            localStorage.setItem('refreshToken', result.data.session.refresh_token)
          }
          
          localStorage.setItem('apihub_user', JSON.stringify(userData))
          setUser(userData)
          
          await loadFavoritesFromBackend(userData.id)
          
          return { error: null }
        }
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
        return
      }
      
      const response = await fetch(`${API_BASE_URL}/user-favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.status === 401) {
        clearAuthData()
        return
      }
      
      if (!response.ok) {
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

      const isCurrentlyFavorite = favoriteObjects.some(fav => fav.api_id === apiId)
      
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
        
        setFavoriteObjects(prev => prev.filter(fav => fav.api_id !== apiId))
        
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

  // FUNÇÕES OAuth SIMPLES E DIRETAS
  const loginWithGoogle = () => {
    console.log('🔗 Redirecionando para Google OAuth...')
    window.location.href = `${API_BASE_URL}/auth/google`
  }

  const loginWithGitHub = () => {
    console.log('🔗 Redirecionando para GitHub OAuth...')
    window.location.href = `${API_BASE_URL}/auth/github`
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
    loginWithGoogle,
    loginWithGitHub,
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