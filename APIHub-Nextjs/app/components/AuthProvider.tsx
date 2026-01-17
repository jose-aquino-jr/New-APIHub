// components/AuthProvider.tsx - VERSÃO COMPLETA CORRIGIDA
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

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
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Configuração da API base
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apihub-br.duckdns.org'

// Função para extrair tokens do hash
const extractTokensFromHash = (hash: string) => {
  try {
    // Remover # do início
    const hashWithoutHash = hash.replace(/^#/, '')
    
    // Tentar diferentes padrões de parsing
    let params: Record<string, string | null> = {}
    
    // Padrão 1: URLSearchParams (access_token=...&refresh_token=...)
    if (hashWithoutHash.includes('=')) {
      const urlParams = new URLSearchParams(hashWithoutHash)
      params = {
        access_token: urlParams.get('access_token'),
        refresh_token: urlParams.get('refresh_token'),
        expires_at: urlParams.get('expires_at'),
        token_type: urlParams.get('token_type'),
        provider_token: urlParams.get('provider_token'),
        provider_refresh_token: urlParams.get('provider_refresh_token')
      }
    }
    
    // Log para debug
    console.log('🔍 Tokens extraídos do hash:', {
      hasAccessToken: !!params.access_token,
      hasProviderToken: !!params.provider_token,
      params: Object.keys(params).filter(key => params[key])
    })
    
    return params
    
  } catch (error) {
    console.error('❌ Erro ao extrair tokens do hash:', error)
    return {}
  }
}

// Função para decodificar JWT
const decodeJWT = (token: string) => {
  try {
    // Verificar se é um token JWT válido
    if (!token || token.split('.').length !== 3) {
      console.error('❌ Token não é um JWT válido')
      return null
    }
    
    const base64Url = token.split('.')[1]
    if (!base64Url) {
      console.error('❌ Parte do payload não encontrada no token')
      return null
    }
    
    // Corrigir padding para base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const padLength = 4 - (base64.length % 4)
    const paddedBase64 = padLength < 4 ? base64 + '='.repeat(padLength) : base64
    
    try {
      // Decodificar base64
      const jsonPayload = atob(paddedBase64)
      const payload = JSON.parse(jsonPayload)
      return payload
    } catch (parseError) {
      console.error('❌ Erro ao parsear payload do JWT:', parseError)
      
      // Tentar alternativa com decodeURIComponent
      try {
        const jsonPayload = decodeURIComponent(
          atob(paddedBase64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        )
        return JSON.parse(jsonPayload)
      } catch (altError) {
        console.error('❌ Erro na alternativa de parse:', altError)
        return null
      }
    }
  } catch (error) {
    console.error('❌ Erro ao decodificar JWT:', error)
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

  // Verificar se há tokens no HASH da URL (OAuth callback)
  useEffect(() => {
    const checkHashForTokens = () => {
      // Obter hash da URL (parte após #)
      const hash = window.location.hash
      
      console.log('🔍 Verificando hash da URL:', hash.substring(0, 100) + (hash.length > 100 ? '...' : ''))
      
      if (hash && (hash.includes('access_token') || hash.includes('provider_token'))) {
        console.log('🔐 Token encontrado no hash da URL')
        processTokensFromHash(hash)
      }
    }
    
    // Executar imediatamente
    checkHashForTokens()
    
    // Adicionar listener para quando a página carregar completamente
    window.addEventListener('load', checkHashForTokens)
    
    return () => {
      window.removeEventListener('load', checkHashForTokens)
    }
  }, [])

  const processTokensFromHash = (hash: string) => {
    try {
      console.log('🔄 Processando tokens do hash...')
      
      // Extrair tokens do hash
      const tokens = extractTokensFromHash(hash)
      
      console.log('📦 Tokens extraídos detalhado:', tokens)
      
      // Priorizar provider_token (GitHub), senão access_token (Google)
      const accessToken = tokens.provider_token || tokens.access_token
      
      if (!accessToken) {
        console.error('❌ Nenhum token válido encontrado no hash')
        console.log('Tokens disponíveis:', JSON.stringify(tokens, null, 2))
        throw new Error('Nenhum token válido encontrado')
      }
      
      // Decodificar JWT para obter dados do usuário
      const payload = decodeJWT(accessToken)
      
      if (!payload) {
        console.error('❌ Payload decodificado:', payload)
        throw new Error('Não foi possível decodificar o token JWT')
      }
      
      console.log('📋 Payload do token:', {
        sub: payload.sub,
        email: payload.email,
        name: payload.user_metadata?.name || payload.user_metadata?.full_name || payload.name,
        app_metadata: payload.app_metadata
      })
      
      // Determinar provedor
      let provider = payload.app_metadata?.provider
      if (!provider) {
        if (tokens.provider_token) {
          provider = 'github' // Se tem provider_token, é GitHub
        } else if (payload.email?.includes('@gmail.com') || payload.iss?.includes('google')) {
          provider = 'google'
        } else {
          provider = 'email' // fallback
        }
      }
      
      console.log('🎯 Provedor identificado:', provider)
      
      // Extrair nome do usuário
      let userName = payload.user_metadata?.name || 
                    payload.user_metadata?.full_name || 
                    payload.name
      
      // Para GitHub, usar user_name se disponível
      if (provider === 'github' && payload.user_metadata?.user_name) {
        userName = payload.user_metadata.user_name
      }
      
      // Se ainda não tem nome, usar email
      if (!userName && payload.email) {
        userName = payload.email.split('@')[0]
      }
      
      const userData = {
        id: payload.sub || `temp_${Date.now()}`,
        email: payload.email || 'usuário@email.com',
        name: userName || 'Usuário',
        avatar_url: payload.user_metadata?.avatar_url || 
                   payload.user_metadata?.picture ||
                   payload.avatar_url,
        provider: provider,
        accept_terms: false
      }
      
      console.log('✅ Usuário extraído do token:', {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        provider: userData.provider
      })
      
      // Salvar no localStorage
      localStorage.setItem('authToken', accessToken)
      if (tokens.refresh_token) {
        localStorage.setItem('refreshToken', tokens.refresh_token)
      }
      localStorage.setItem('apihub_user', JSON.stringify(userData))
      
      // Atualizar estado
      setToken(accessToken)
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
      
      // Redirecionar para home após pequeno delay
      setTimeout(() => {
        const redirectTo = localStorage.getItem('redirectAfterLogin') || '/'
        localStorage.removeItem('redirectAfterLogin')
        console.log('📍 Redirecionando para:', redirectTo)
        router.replace(redirectTo)
      }, 100)
      
    } catch (error: any) {
      console.error('🔥 Erro ao processar tokens do hash:', error)
      console.error('🔍 Hash original:', hash)
      console.error('🔍 URL completa:', window.location.href)
      
      // Salvar erro para debug
      localStorage.setItem('oauth_error', JSON.stringify({
        error: error.message,
        hash: hash,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }))
      
      // Limpar URL e redirecionar com erro
      window.history.replaceState(null, '', '/login')
      router.replace(`/login?error=hash_processing_error&message=${encodeURIComponent(error.message)}`)
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
    localStorage.removeItem('oauth_error')
    
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
      console.log('📨 Resposta do login:', { status: response.status, success: result.success })
      
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