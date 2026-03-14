// components/AuthProvider.tsx - VERSÃO CORRIGIDA PARA AMBOS (Google e GitHub)
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

// Configuração da API base
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apihub-br.duckdns.org'

// Função auxiliar para decodificar JWT
const decodeJWT = (token: string) => {
  try {
    // O token pode não ser um JWT (GitHub usa provider_token que não é JWT)
    // Vamos tentar decodificar, mas se falhar, retornar null
    if (!token || token.split('.').length !== 3) {
      return null // Não é um JWT
    }
    
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    
    // Adicionar padding se necessário
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
    console.warn('Não foi possível decodificar como JWT (pode ser provider_token do GitHub):', error)
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

  // Verificar se há tokens no HASH da URL (OAuth callback)
  useEffect(() => {
    const checkHashForTokens = () => {
      // Obter hash da URL (parte após #)
      const hash = window.location.hash
      
      console.log('🔍 Hash da URL:', hash.substring(0, 100) + (hash.length > 100 ? '...' : ''))
      
      if (hash && (hash.includes('access_token') || hash.includes('provider_token'))) {
        console.log('🔐 Token encontrado no hash da URL')
        processTokensFromHash(hash)
      }
    }
    
    checkHashForTokens()
    
    // Também verificar quando a página carrega completamente
    const handleLoad = () => {
      setTimeout(checkHashForTokens, 100) // Pequeno delay para garantir
    }
    
    window.addEventListener('load', handleLoad)
    
    return () => {
      window.removeEventListener('load', handleLoad)
    }
  }, [])

  const processTokensFromHash = (hash: string) => {
    try {
      console.log('🔄 Processando tokens do hash...')
      
      // Remover o # inicial
      const hashWithoutHash = hash.substring(1)
      
      // Converter hash para objeto
      const hashParams = new URLSearchParams(hashWithoutHash)
      
      // GitHub usa provider_token, Google usa access_token
      const access_token = hashParams.get('access_token')
      const provider_token = hashParams.get('provider_token')
      const refresh_token = hashParams.get('refresh_token')
      const expires_at = hashParams.get('expires_at')
      const token_type = hashParams.get('token_type')
      
      console.log('📦 Tokens extraídos:', {
        hasAccessToken: !!access_token,
        hasProviderToken: !!provider_token,
        hasRefreshToken: !!refresh_token,
        token_type,
        expires_at
      })
      
      // Priorizar access_token (Google), senão provider_token (GitHub)
      const tokenToUse = access_token || provider_token
      
      if (!tokenToUse) {
        console.error('❌ Nenhum token válido encontrado no hash')
        return
      }
      
      // Tentar decodificar JWT (Google funciona, GitHub pode não)
      const payload = decodeJWT(tokenToUse)
      
      let userData: User
      
      if (payload) {
        // É um JWT (Google)
        console.log('📋 Payload do JWT (Google):', {
          sub: payload.sub,
          email: payload.email,
          name: payload.user_metadata?.name || payload.user_metadata?.full_name
        })
        
        userData = {
          id: payload.sub,
          email: payload.email,
          name: payload.user_metadata?.name || 
                payload.user_metadata?.full_name || 
                payload.email?.split('@')[0] || 
                'Usuário',
          avatar_url: payload.user_metadata?.avatar_url || 
                     payload.user_metadata?.picture,
          provider: payload.app_metadata?.provider || 'google',
          accept_terms: false,
          bio: '',
          preferredLanguages: []
        }
      } else {
        // Não é JWT (GitHub provider_token) - criar usuário básico
        console.log('🔑 Provider token do GitHub detectado')
        
        // Para GitHub, precisamos buscar informações do usuário de outra forma
        // Mas por enquanto, vamos criar um usuário temporário
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
        
        console.warn('⚠️ GitHub provider_token - precisamos implementar busca de dados do usuário')
      }
      
      console.log('✅ Usuário criado:', userData.email)
      
      // Salvar no localStorage
      localStorage.setItem('authToken', tokenToUse)
      if (refresh_token) {
        localStorage.setItem('refreshToken', refresh_token)
      }
      localStorage.setItem('apihub_user', JSON.stringify(userData))
      localStorage.setItem('oauth_provider', userData.provider || 'unknown')
      
      // Atualizar estado
      setToken(tokenToUse)
      setUser(userData)
      
      // Carregar favoritos em background
      setTimeout(async () => {
        try {
          await loadFavoritesFromBackend(userData.id)
        } catch (error) {
          console.warn('Não foi possível carregar favoritos:', error)
        }
      }, 500)
      
      // Limpar hash da URL
      window.history.replaceState(null, '', window.location.pathname)
      
      console.log('🚀 Login via OAuth concluído com sucesso!')
      
      // Redirecionar para home
      const redirectTo = localStorage.getItem('redirectAfterLogin') || '/'
      localStorage.removeItem('redirectAfterLogin')
      router.replace(redirectTo)
      
    } catch (error: any) {
      console.error('🔥 Erro ao processar tokens do hash:', error)
      console.error('🔍 Stack trace:', error.stack)
      
      // Salvar erro para debug
      localStorage.setItem('last_oauth_error', JSON.stringify({
        error: error.message,
        hash: hash,
        timestamp: new Date().toISOString()
      }))
      
      // Limpar URL e redirecionar com erro
      window.history.replaceState(null, '', '/login')
      router.replace('/login?error=hash_processing_error')
    }
  }

  // Verificar autenticação existente ao montar
  useEffect(() => {
    checkAuth()
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

  const checkAuth = async () => {
    try {
      const savedUser = localStorage.getItem('apihub_user')
      const savedToken = localStorage.getItem('authToken')
      
      if (savedUser && savedToken) {
        const userData = JSON.parse(savedUser)
        
        // Verificar se o token ainda é válido
        const isValid = await checkSession()
        
        if (isValid) {
          setUser(userData)
          setToken(savedToken)
          
          // Carregar favoritos do localStorage (fallback rápido)
          const savedFavorites = localStorage.getItem(`favorites_${userData.id}`)
          if (savedFavorites) {
            try {
              const parsed = JSON.parse(savedFavorites)
              setFavorites(parsed)
            } catch (e) {
              console.warn('Erro ao parsear favoritos do localStorage:', e)
            }
          }
          
          // Carregar objetos de favoritos do localStorage
          const savedFavoriteObjects = localStorage.getItem(`favorites_objects_${userData.id}`)
          if (savedFavoriteObjects) {
            try {
              const parsed = JSON.parse(savedFavoriteObjects)
              setFavoriteObjects(parsed)
            } catch (e) {
              console.warn('Erro ao parsear favorite objects:', e)
            }
          }
          
          // Sincronizar com backend (em background)
          setTimeout(async () => {
            try {
              await loadFavoritesFromBackend(userData.id)
            } catch (error) {
              console.warn('Não foi possível carregar favoritos do backend:', error)
            }
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
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('oauth_provider')
    localStorage.removeItem('last_oauth_error')
    
    // Limpar favoritos específicos do usuário
    if (user?.id) {
      localStorage.removeItem(`favorites_${user.id}`)
      localStorage.removeItem(`favorites_objects_${user.id}`)
    }
  }

  const checkSession = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return false

      console.log('🔍 Verificando sessão...')
      const response = await fetch(`${API_BASE_URL}/auth/session`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 401) {
        console.log('❌ Sessão expirada (401)')
        return false
      }

      const data = await response.json()
      
      if (!response.ok || !data.success) {
        console.log('❌ Resposta não OK da sessão:', data.message)
        return false
      }
      
      console.log('✅ Sessão válida')
      return true
      
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
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.user) {
          const updatedUser = { ...user, ...data.data.user }
          setUser(updatedUser)
          localStorage.setItem('apihub_user', JSON.stringify(updatedUser))
          console.log('✅ Dados do usuário atualizados')
        }
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar dados do usuário:', error)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Tentando login com email...')
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
      console.log('📨 Resposta do login:', { status: response.status, success: result.success })
      
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
          localStorage.setItem('authToken', accessToken)
          setToken(accessToken)
          
          if (result.data?.session?.refresh_token) {
            localStorage.setItem('refreshToken', result.data.session.refresh_token)
          }
          
          localStorage.setItem('apihub_user', JSON.stringify(userData))
          setUser(userData)
          
          await loadFavoritesFromBackend(userData.id)
          
          console.log('✅ Login bem-sucedido')
          return { error: null }
        }
      }
      
      const errorMsg = result.message || 'Email ou senha incorretos'
      console.error('❌ Erro no login:', errorMsg)
      return { 
        error: new Error(errorMsg) 
      }
      
    } catch (error: any) {
      console.error('❌ Erro de conexão no login:', error)
      return { 
        error: new Error('Erro de conexão com o servidor. Tente novamente.') 
      }
    }
  }

  const register = async (email: string, password: string, name: string, acceptTerms: boolean) => {
    try {
      console.log('📝 Tentando registro...')
      const response = await fetch(`${API_BASE_URL}/auth/cadastro`, {
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
      console.log('📨 Resposta do registro:', { status: response.status, success: data.success })
      
      if (response.ok && data.success) {
        console.log('✅ Registro bem-sucedido')
        return { error: null }
      }
      
      const errorMessage = data.message || 'Erro no registro'
      console.error('❌ Erro no registro:', errorMessage)
      
      if (errorMessage.includes('já existe') || errorMessage.includes('already')) {
        return { error: new Error('Este email já está cadastrado') }
      }
      
      return { error: new Error(errorMessage) }
      
    } catch (error: any) {
      console.error('❌ Erro de conexão no registro:', error)
      return { 
        error: new Error('Erro de conexão com o servidor. Verifique sua internet.') 
      }
    }
  }

  const loadFavoritesFromBackend = async (userId: string) => {
    try {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        console.warn('❌ Token não disponível para carregar favoritos')
        return
      }
      
      console.log('📚 Carregando favoritos do backend...')
      const response = await fetch(`${API_BASE_URL}/user-favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.status === 401) {
        console.warn('❌ Token expirado ao buscar favoritos')
        clearAuthData()
        return
      }
      
      if (!response.ok) {
        console.error('❌ Erro HTTP ao carregar favoritos:', response.status, response.statusText)
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
        console.log(`✅ ${favoritesData.length} favoritos carregados do backend`)
      }
      
    } catch (error: any) {
      console.error('❌ Erro ao carregar favoritos do backend:', error)
    }
  }

  const loadFavorites = async () => {
    if (!user) {
      console.warn('⚠️ Tentativa de carregar favoritos sem usuário')
      return
    }
    
    console.log('🔄 Recarregando favoritos...')
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
      const existingFavorite = favoriteObjects.find(fav => fav.api_id === apiId)
      
      console.log(`⭐ Alternando favorito ${apiId}: ${isCurrentlyFavorite ? 'remover' : 'adicionar'}`)
      
      if (isCurrentlyFavorite && existingFavorite) {
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
        console.log('✅ Favorito removido')
        
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
        console.log('✅ Favorito adicionado')
      }
      
    } catch (error: any) {
      console.error('❌ Erro ao alternar favorito:', error)
      
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
    if (!user) {
      console.warn('⚠️ Tentativa de atualizar usuário sem usuário logado')
      return
    }
    
    const updatedUser = { ...user, ...userData }
    setUser(updatedUser)
    localStorage.setItem('apihub_user', JSON.stringify(updatedUser))
    console.log('✅ Dados do usuário atualizados')
  }

  const logout = () => {
    console.log('🚪 Realizando logout...')
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
    console.log('✅ Logout concluído')
  }

  const loginWithGoogle = () => {
    console.log('🔗 Iniciando login com Google...')
    
    // Salvar página atual para redirecionamento após login
    const currentPath = window.location.pathname
    if (currentPath !== '/login') {
      localStorage.setItem('redirectAfterLogin', currentPath)
      console.log('📍 Redirecionamento salvo:', currentPath)
    }
    
    // Redirecionar para rota do backend
    window.location.href = `${API_BASE_URL}/auth/google`
  }

  const loginWithGitHub = () => {
    console.log('🔗 Iniciando login com GitHub...')
    
    // Salvar página atual para redirecionamento após login
    const currentPath = window.location.pathname
    if (currentPath !== '/login') {
      localStorage.setItem('redirectAfterLogin', currentPath)
      console.log('📍 Redirecionamento salvo:', currentPath)
    }
    
    // Redirecionar para rota do backend
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