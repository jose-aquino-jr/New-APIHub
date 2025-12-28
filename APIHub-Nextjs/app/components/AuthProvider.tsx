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

interface AuthContextType {
  user: User | null
  loading: boolean
  favorites: string[]
  login: (email: string, password: string) => Promise<{ error: Error | null }>
  register: (email: string, password: string, name: string, acceptTerms: boolean) => Promise<{ error: Error | null }>
  logout: () => void
  toggleFavorite: (apiId: string) => Promise<void>
  isAuthenticated: boolean
  loadFavorites: () => Promise<void>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const router = useRouter()

  // Função para verificar e atualizar autenticação
  const checkAuth = async () => {
    try {
      const savedUser = localStorage.getItem('apihub_user')
      const token = localStorage.getItem('authToken')
      
      console.log('🔍 AuthProvider: Verificando autenticação...', { 
        savedUser: !!savedUser, 
        token: !!token 
      })
      
      if (!savedUser || !token) {
        console.log('🔍 AuthProvider: Sem dados de autenticação')
        setUser(null)
        setLoading(false)
        return
      }
      
      const userData = JSON.parse(savedUser)
      
      // Verificar se o token é válido no backend
      try {
        const response = await fetch('https://apihub-br.duckdns.org/auth/session', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const sessionData = await response.json()
          
          if (sessionData.success && sessionData.data?.user) {
            console.log('AuthProvider: Sessão válida:', sessionData.data.user.email)
            
            // Atualizar dados do usuário
            const updatedUser = {
              id: sessionData.data.user.id,
              email: sessionData.data.user.email,
              name: sessionData.data.user.name || userData.name,
              accept_terms: sessionData.data.user.accept_terms,
              avatar_url: sessionData.data.user.avatar_url,
              provider: sessionData.data.user.provider
            }
            
            setUser(updatedUser)
            
            // Atualizar localStorage
            localStorage.setItem('apihub_user', JSON.stringify(updatedUser))
            
            // Carregar favoritos
            await loadFavoritesFromBackend(updatedUser.id)
          } else {
            console.warn('AuthProvider: Sessão inválida (success false)')
            handleInvalidSession()
          }
        } else if (response.status === 401) {
          console.warn('AuthProvider: Token expirado (401)')
          handleInvalidSession()
        } else {
          console.warn('AuthProvider: Erro na verificação:', response.status)
          // Em caso de erro de rede, manter usuário logado com dados locais
          setUser(userData)
          console.log('AuthProvider: Usando dados locais por erro de rede')
        }
      } catch (networkError) {
        console.error('AuthProvider: Erro de rede:', networkError)
        // Em caso de erro de rede, manter usuário logado com dados locais
        setUser(userData)
        console.log('AuthProvider: Usando dados locais por erro de rede')
      }
      
    } catch (error) {
      console.error('AuthProvider: Erro geral:', error)
      handleInvalidSession()
    } finally {
      setLoading(false)
    }
  }

  const handleInvalidSession = () => {
    console.log('🧹 AuthProvider: Limpando sessão inválida')
    setUser(null)
    setFavorites([])
    localStorage.removeItem('apihub_user')
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    
    // Limpar todos os favoritos do localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('favorites_')) {
        localStorage.removeItem(key)
      }
    })
  }

  // Função para recarregar dados do usuário
  const refreshUserData = async () => {
    const token = localStorage.getItem('authToken')
    if (!token) return
    
    try {
      const response = await fetch('https://apihub-br.duckdns.org/auth/session', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const sessionData = await response.json()
        if (sessionData.success && sessionData.data?.user) {
          const updatedUser = {
            id: sessionData.data.user.id,
            email: sessionData.data.user.email,
            name: sessionData.data.user.name || user?.name || '',
            accept_terms: sessionData.data.user.accept_terms,
            avatar_url: sessionData.data.user.avatar_url,
            provider: sessionData.data.user.provider
          }
          
          setUser(updatedUser)
          localStorage.setItem('apihub_user', JSON.stringify(updatedUser))
          
          // Recarregar favoritos
          if (updatedUser.id) {
            await loadFavoritesFromBackend(updatedUser.id)
          }
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error)
    }
  }

  useEffect(() => {
    // Verificar autenticação inicial
    checkAuth()
    
    // Ouvir eventos de storage (quando outra aba/popup salva dados)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'apihub_user' || event.key === 'authToken') {
        console.log('AuthProvider: Storage alterado, verificando auth...')
        checkAuth()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Ouvir mensagens de popup OAuth
    const handleMessage = (event: MessageEvent) => {
      console.log('AuthProvider: Mensagem recebida:', event.data)
      
      // Aceitar mensagens do backend
      if (event.origin === 'https://apihub-br.duckdns.org') {
        if (event.data.type === 'oauth-success') {
          console.log('AuthProvider: Login OAuth detectado!')
          
          // Salvar dados
          localStorage.setItem('apihub_user', JSON.stringify(event.data.user))
          localStorage.setItem('authToken', event.data.user.access_token)
          localStorage.setItem('refreshToken', event.data.user.refresh_token)
          
          // Atualizar estado
          setUser(event.data.user)
          
          // Carregar favoritos
          if (event.data.user.id) {
            loadFavoritesFromBackend(event.data.user.id)
          }
          
          // Recarregar página para atualizar toda a aplicação
          setTimeout(() => {
            window.location.reload()
          }, 500)
        }
      }
    }
    
    window.addEventListener('message', handleMessage)
    
    // Verificar a cada 30 segundos se a sessão ainda é válida
    const interval = setInterval(checkAuth, 30000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('message', handleMessage)
      clearInterval(interval)
    }
  }, [])

  // Função de login (email/senha)
  const login = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      console.log('AuthProvider: Tentando login:', email)
      
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
      
      const result = await response.json()
      console.log('AuthProvider: Resposta do login:', result)
      
      if (response.ok && result.success) {
        const userData = {
          id: result.data?.user?.id,
          email: result.data?.user?.email || email,
          name: result.data?.user?.name || 'Usuário',
          accept_terms: result.data?.user?.accept_terms
        }
        
        // Salvar token e dados do usuário
        if (result.data?.session?.access_token) {
          localStorage.setItem('authToken', result.data.session.access_token)
        }
        if (result.data?.session?.refresh_token) {
          localStorage.setItem('refreshToken', result.data.session.refresh_token)
        }
        
        localStorage.setItem('apihub_user', JSON.stringify(userData))
        setUser(userData)
        
        // Carregar favoritos
        if (userData.id) {
          await loadFavoritesFromBackend(userData.id)
        }
        
        return { error: null }
      }
      
      return { 
        error: new Error(result.message || 'Email ou senha incorretos') 
      }
    } catch (error: any) {
      console.error('AuthProvider: Erro de conexão no login:', error)
      return { 
        error: new Error('Erro de conexão com o servidor. Tente novamente.') 
      }
    }
  }

  // Função de registro
  const register = async (email: string, password: string, name: string, acceptTerms: boolean) => {
    try {
      console.log('AuthProvider: Tentando registrar usuário:', { email, name })
      
      const response = await fetch('https://apihub-br.duckdns.org/cadastro', {
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
      console.log('AuthProvider: Resposta do registro:', data)
      
      if (response.ok && data.success) {
        return { error: null }
      }
      
      const errorMessage = data.message || 'Erro no registro'
      console.error('AuthProvider: Erro no registro:', errorMessage)
      
      if (errorMessage.includes('já existe') || errorMessage.includes('already')) {
        return { error: new Error('Este email já está cadastrado') }
      }
      
      return { error: new Error(errorMessage) }
      
    } catch (error: any) {
      console.error('AuthProvider: Erro de conexão no registro:', error)
      return { 
        error: new Error('Erro de conexão com o servidor. Verifique sua internet.') 
      }
    }
  }

  // Carregar favoritos do backend
  const loadFavoritesFromBackend = async (userId: string) => {
    try {
      const token = localStorage.getItem('authToken')
      
      const response = await fetch(
        `https://apihub-br.duckdns.org/user-favorites?user_id=${userId}`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const favoriteIds = data.data?.map((fav: any) => fav.api_id) || []
          
          setFavorites(favoriteIds)
          localStorage.setItem(`favorites_${userId}`, JSON.stringify(favoriteIds))
          
          console.log(`AuthProvider: ${favoriteIds.length} favoritos carregados`)
        }
      } else if (response.status === 401) {
        console.warn('AuthProvider: Não autorizado ao carregar favoritos')
      }
    } catch (error) {
      console.error('AuthProvider: Erro ao carregar favoritos:', error)
    }
  }

  const loadFavorites = async () => {
    if (!user?.id) return
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
          
          console.log(' AuthProvider: Favorito removido:', apiId)
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
          
          console.log('AuthProvider: Favorito adicionado:', apiId)
        }
      }
    } catch (error: any) {
      console.error('AuthProvider: Erro ao alternar favorito:', error)
      alert('Erro ao favoritar/desfavoritar API')
    }
  }

  const logout = () => {
    console.log(' AuthProvider: Efetuando logout')
    
    setUser(null)
    setFavorites([])
    
    // Limpar localStorage
    localStorage.removeItem('apihub_user')
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    
    // Limpar todos os favoritos do localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('favorites_')) {
        localStorage.removeItem(key)
      }
    })
    
    // Redirecionar para home
    router.push('/')
    
    // Recarregar para limpar estado da aplicação
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  const value = {
    user,
    loading,
    favorites,
    login,
    register,
    logout,
    toggleFavorite,
    isAuthenticated: !!user,
    loadFavorites,
    refreshUserData
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
