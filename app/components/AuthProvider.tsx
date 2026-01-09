// components/AuthProvider.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  accept_terms?: boolean
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const savedUser = localStorage.getItem('apihub_user')
      const token = localStorage.getItem('authToken')
      
      if (savedUser && token) {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        
        // Carregar favoritos
        const savedFavorites = localStorage.getItem(`favorites_${userData.id}`)
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites))
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
    } finally {
      setLoading(false)
    }
  }

  // components/AuthProvider.tsx
const login = async (email: string, password: string) => {
  try {
    console.log('🔐 Tentando login:', email)
    
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
    console.log('🔐 Resposta COMPLETA do login:', result)
    
    if (response.ok && result.success) {
      // AGORA os dados estão em result.data
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
      await loadFavoritesFromBackend(userData.id)
      
      return { error: null }
    }
    
    return { 
      error: new Error(result.message || 'Email ou senha incorretos') 
    }
  } catch (error: any) {
    console.error('❌ Erro de conexão no login:', error)
    return { 
      error: new Error('Erro de conexão com o servidor. Tente novamente.') 
    }
  }
}

  // components/AuthProvider.tsx - função register CORRIGIDA
const register = async (email: string, password: string, name: string, acceptTerms: boolean) => {
  try {
    console.log('📝 Tentando registrar usuário:', { email, name, acceptTerms })
    
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
    console.log('📝 Resposta COMPLETA do registro:', data)
    
    if (response.ok && data.success) {
      // NÃO salvar nada no localStorage aqui
      // Só retornar sucesso
      return { error: null }
    }
    
    const errorMessage = data.message || 'Erro no registro'
    console.error('❌ Erro no registro:', errorMessage)
    
    // Mapear erros comuns
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
      const response = await fetch(
        `https://apihub-br.duckdns.org/user-favorites?user_id=${userId}`
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const favoriteIds = data.data?.map((fav: any) => fav.api_id) || []
          
          setFavorites(favoriteIds)
          localStorage.setItem(`favorites_${userId}`, JSON.stringify(favoriteIds))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error)
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
    localStorage.removeItem('refreshToken')
    
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
    register,
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