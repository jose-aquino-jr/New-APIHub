// components/AuthProvider.tsx
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@/types'
import { checkAuth, login, register, logout } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ error: any }>
  register: (email: string, password: string, name: string) => Promise<{ error: any }>
  logout: () => Promise<void>
  isLoading: boolean
  favorites: string[]
  toggleFavorite: (apiId: string) => Promise<void>
  loginWithOAuth: (provider: 'google' | 'github') => Promise<void>
  checkOAuthSession: () => Promise<boolean>
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
      const { data, error } = await supabase
        .from('user_favorites')
        .select('api_id')
        .eq('user_id', user.id)

      if (error) {
        console.error('Erro ao carregar favoritos:', error)
        return
      }

      const favoriteIds = data?.map(fav => fav.api_id) || []
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
        // Remover dos favoritos
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('api_id', apiId)

        if (error) throw error

        setFavorites(prev => prev.filter(id => id !== apiId))
      } else {
        // Adicionar aos favoritos
        const { error } = await supabase
          .from('user_favorites')
          .insert([
            {
              user_id: user.id,
              api_id: apiId,
              created_at: new Date().toISOString(),
            }
          ])

        if (error) throw error

        setFavorites(prev => [...prev, apiId])
      }
    } catch (error) {
      console.error('Erro ao alternar favorito:', error)
      alert('Erro ao favoritar/desfavoritar API')
    }
  }

  const loginWithOAuth = async (provider: 'google' | 'github') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
    } catch (error) {
      console.error('Erro no login OAuth:', error)
      throw error
    }
  }

  const checkOAuthSession = async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) throw error
      
      if (session?.user) {
        // Buscar dados do usuário no banco
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .single()

        if (userError && userError.code !== 'PGRST116') {
          console.error('Erro ao buscar usuário:', userError)
          return false
        }

        // Se usuário não existe, criar
        let user = userData
        if (!userData && session.user.email) {
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([
              {
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.email.split('@')[0],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            ])
            .select()
            .single()

          if (createError) {
            console.error('Erro ao criar usuário:', createError)
            return false
          }
          user = newUser
        }

        if (user) {
          setUser(user)
          localStorage.setItem('user', JSON.stringify(user))
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Erro ao verificar sessão OAuth:', error)
      return false
    }
  }

  const handleLogin = async (email: string, password: string) => {
    const { user: loggedUser, error } = await login(email, password)
    if (!error && loggedUser) {
      setUser(loggedUser)
      localStorage.setItem('user', JSON.stringify(loggedUser))
    }
    return { error }
  }

  const handleRegister = async (email: string, password: string, name: string) => {
    const { user: newUser, error } = await register(email, password, name)
    if (!error && newUser) {
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
    }
    return { error }
  }

  const handleLogout = async () => {
    await logout()
    setUser(null)
    setFavorites([])
  }

  const value = {
    user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    isLoading,
    favorites,
    toggleFavorite,
    loginWithOAuth,
    checkOAuthSession
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Exportação nomeada do hook useAuth
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
