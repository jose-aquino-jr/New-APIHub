// components/AuthProvider.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface User {
  id: string
  email: string
  bio: string
  preferredLanguages: string[] | string  
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
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apihub-br.duckdns.org'

// Salva o token no localStorage E num cookie para que o middleware
// (que roda no servidor) consiga lê-lo. O cookie expira em 1 hora,
// igual ao tempo de expiração do token da API.
const saveToken = (token: string) => {
  localStorage.setItem('authToken', token)
  document.cookie = `authToken=${token}; path=/; max-age=3600; SameSite=Lax`
}

// Remove o token de ambos os lugares simultaneamente
const clearToken = () => {
  localStorage.removeItem('authToken')
  document.cookie = 'authToken=; path=/; max-age=0'
}

const decodeJWT = (token: string) => {
  try {
    if (!token || token.split('.').length !== 3) return null
    
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const pad = base64.length % 4
    const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64
    
    const jsonPayload = decodeURIComponent(
      atob(paddedBase64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.warn('Não foi possível decodificar como JWT:', error)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [favoriteObjects, setFavoriteObjects] = useState<Favorite[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkHashForTokens = () => {
      const hash = window.location.hash
      console.log('🔍 Hash da URL:', hash.substring(0, 100) + (hash.length > 100 ? '...' : ''))
      if (hash && (hash.includes('access_token') || hash.includes('provider_token'))) {
        console.log('🔐 Token encontrado no hash da URL')
        processTokensFromHash(hash)
      }
    }
    
    checkHashForTokens()
    const handleLoad = () => setTimeout(checkHashForTokens, 100)
    window.addEventListener('load', handleLoad)
    return () => window.removeEventListener('load', handleLoad)
  }, [])

  const processTokensFromHash = (hash: string) => {
    try {
      console.log('🔄 Processando tokens do hash...')
      
      const hashWithoutHash = hash.substring(1)
      const hashParams = new URLSearchParams(hashWithoutHash)
      
      const access_token = hashParams.get('access_token')
      const provider_token = hashParams.get('provider_token')
      const refresh_token = hashParams.get('refresh_token')
      
      const tokenToUse = access_token || provider_token
      if (!tokenToUse) {
        console.error('❌ Nenhum token válido encontrado no hash')
        return
      }
      
      const payload = decodeJWT(tokenToUse)
      let userData: User
      
      if (payload) {
        userData = {
          id: payload.sub,
          email: payload.email,
          name: payload.user_metadata?.name || 
                payload.user_metadata?.full_name || 
                payload.email?.split('@')[0] || 
                'Usuário',
          avatar_url: payload.user_metadata?.avatar_url || payload.user_metadata?.picture,
          provider: payload.app_metadata?.provider || 'google',
          accept_terms: false,
          bio: '',
          preferredLanguages: []
        }
      } else {
        userData = {
          id: `github_${Date.now()}`,
          email: `github_user_${Date.now()}@example.com`,
          name: 'Usuário GitHub',
          avatar_url: '',
          provider: 'github',
          accept_terms: false,
          bio: '',
          preferredLanguages: []
        }
      }
      
      // Salva no localStorage E no cookie via saveToken
      saveToken(tokenToUse)
      if (refresh_token) localStorage.setItem('refreshToken', refresh_token)
      localStorage.setItem('apihub_user', JSON.stringify(userData))
      localStorage.setItem('oauth_provider', userData.provider || 'unknown')
      
      setToken(tokenToUse)
      setUser(userData)
      
      setTimeout(async () => {
        try { await loadFavoritesFromBackend(userData.id) } 
        catch (error) { console.warn('Não foi possível carregar favoritos:', error) }
      }, 500)
      
      window.history.replaceState(null, '', window.location.pathname)
      
      const redirectTo = localStorage.getItem('redirectAfterLogin') || '/'
      localStorage.removeItem('redirectAfterLogin')
      router.replace(redirectTo)
      
    } catch (error: any) {
      console.error('🔥 Erro ao processar tokens do hash:', error)
      window.history.replaceState(null, '', '/login')
      router.replace('/login?error=hash_processing_error')
    }
  }

  useEffect(() => { checkAuth() }, [])

  useEffect(() => {
    const ids = favoriteObjects.map(fav => fav.api_id)
    setFavorites(ids)
    if (user?.id) {
      localStorage.setItem(`favorites_objects_${user.id}`, JSON.stringify(favoriteObjects))
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(ids))
    }
  }, [favoriteObjects, user])

  const checkAuth = async () => {
    // ─── BYPASS DE DESENVOLVIMENTO ──────────────────────────────────────────
    // Injeta um usuário falso em modo de desenvolvimento para evitar ter que
    // fazer login a cada sessão. Nunca executa em produção pois
    // process.env.NODE_ENV é 'production' no build do Next.js.
    if (process.env.NODE_ENV === 'development') {
      const devUser: User = {
        id: '1c9dd341-f1d8-400f-b4be-83a5562d7947',
        email: 'dev@apihub.com',
        name: 'Dev User',
        bio: '',
        preferredLanguages: [],
        avatar_url: '',
        provider: 'dev',
        accept_terms: true,
      }
      saveToken(process.env.NEXT_PUBLIC_DEV_TOKEN || 'dev-fake-token')
      localStorage.setItem('apihub_user', JSON.stringify(devUser))
      setToken(process.env.NEXT_PUBLIC_DEV_TOKEN || 'dev-fake-token')
      setUser(devUser)
      setLoading(false)
      console.log('[DEV] Bypass de autenticação ativo')
      return
    }
    // ────────────────────────────────────────────────────────────────────────

    try {
      const savedUser = localStorage.getItem('apihub_user')
      const savedToken = localStorage.getItem('authToken')
      
      if (savedUser && savedToken) {
        const userData = JSON.parse(savedUser)
        const isValid = await checkSession()
        
        if (isValid) {
          setUser(userData)
          setToken(savedToken)
          
          const savedFavorites = localStorage.getItem(`favorites_${userData.id}`)
          if (savedFavorites) {
            try { setFavorites(JSON.parse(savedFavorites)) }
            catch (e) { console.warn('Erro ao parsear favoritos:', e) }
          }
          
          const savedFavoriteObjects = localStorage.getItem(`favorites_objects_${userData.id}`)
          if (savedFavoriteObjects) {
            try { setFavoriteObjects(JSON.parse(savedFavoriteObjects)) }
            catch (e) { console.warn('Erro ao parsear favorite objects:', e) }
          }
          
          setTimeout(async () => {
            try { await loadFavoritesFromBackend(userData.id) }
            catch (error) { console.warn('Não foi possível carregar favoritos do backend:', error) }
          }, 1000)
          
          console.log('✅ Autenticação restaurada')
        } else {
          console.log('❌ Token inválido, limpando dados...')
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
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('oauth_provider')
    localStorage.removeItem('last_oauth_error')
    
    // clearToken remove de ambos: localStorage e cookie
    clearToken()
    
    if (user?.id) {
      localStorage.removeItem(`favorites_${user.id}`)
      localStorage.removeItem(`favorites_objects_${user.id}`)
    }
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

      if (response.status === 401) return false
      const data = await response.json()
      return response.ok && data.success
    } catch (error) {
      console.error('❌ Erro ao verificar sessão:', error)
      return false
    }
  }

  const refreshUserData = async () => {
    if (!user) return
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return
      
      const response = await fetch(`${API_BASE_URL}/auth/session`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.user) {
          const updatedUser = { ...user, ...data.data.user }
          setUser(updatedUser)
          localStorage.setItem('apihub_user', JSON.stringify(updatedUser))
        }
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar dados do usuário:', error)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), senha: password })
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        const userData = {
          id: result.data?.user?.id,
          email: result.data?.user?.email || email,
          name: result.data?.user?.name || 'Usuário',
          accept_terms: result.data?.user?.accept_terms || false,
          avatar_url: result.data?.user?.avatar_url,
          provider: result.data?.user?.provider,
          bio: result.data?.user?.bio || '',
          preferredLanguages: result.data?.user?.preferredLanguages || []
        }
        
        const accessToken = result.data?.session?.access_token
        if (accessToken) {
          // saveToken salva no localStorage E no cookie
          saveToken(accessToken)
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
      
      return { error: new Error(result.message || 'Email ou senha incorretos') }
    } catch (error: any) {
      return { error: new Error('Erro de conexão com o servidor. Tente novamente.') }
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
      if (response.ok && data.success) return { error: null }
      
      const errorMessage = data.message || 'Erro no registro'
      if (errorMessage.includes('já existe') || errorMessage.includes('already')) {
        return { error: new Error('Este email já está cadastrado') }
      }
      return { error: new Error(errorMessage) }
    } catch (error: any) {
      return { error: new Error('Erro de conexão com o servidor. Verifique sua internet.') }
    }
  }

  const loadFavoritesFromBackend = async (userId: string) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return
      
      const response = await fetch(`${API_BASE_URL}/user-favorites`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      
      if (response.status === 401) { clearAuthData(); return }
      if (!response.ok) return
      
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
      console.error('❌ Erro ao carregar favoritos do backend:', error)
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
      if (!token) { clearAuthData(); router.push('/login'); return }

      const isCurrentlyFavorite = favoriteObjects.some(fav => fav.api_id === apiId)
      
      if (isCurrentlyFavorite) {
        const response = await fetch(`${API_BASE_URL}/user-favorites/${apiId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
        if (response.status === 401) { clearAuthData(); router.push('/login'); return }
        const data = await response.json()
        if (!response.ok || !data.success) throw new Error(data.message || 'Erro ao remover favorito')
        setFavoriteObjects(prev => prev.filter(fav => fav.api_id !== apiId))
      } else {
        const response = await fetch(`${API_BASE_URL}/user-favorites`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ api_id: apiId })
        })
        if (response.status === 401) { clearAuthData(); router.push('/login'); return }
        const data = await response.json()
        if (!response.ok || !data.success) throw new Error(data.message || 'Erro ao adicionar favorito')
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
      if (error.message.includes('Token') || error.message.includes('401')) {
        clearAuthData()
        router.push('/login')
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
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      }).catch(console.error)
    }
    clearAuthData()
    router.push('/')
  }

  const loginWithGoogle = () => {
    const currentPath = window.location.pathname
    if (currentPath !== '/login') localStorage.setItem('redirectAfterLogin', currentPath)
    window.location.href = `${API_BASE_URL}/auth/google`
  }

  const loginWithGitHub = () => {
    const currentPath = window.location.pathname
    if (currentPath !== '/login') localStorage.setItem('redirectAfterLogin', currentPath)
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
    refreshUserData,
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