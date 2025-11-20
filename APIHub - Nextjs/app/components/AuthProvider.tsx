'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, User } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  loginWithOAuth: (provider: 'google' | 'github') => Promise<void>
  checkOAuthSession: () => Promise<void>
  isLoading: boolean
  favorites: string[]
  toggleFavorite: (apiId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])

  // URL dinâmica para redirect
  const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth/callback`
    }
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000/auth/callback'
  }

  useEffect(() => {
    checkAuth()
    
    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
          setFavorites([])
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      loadFavorites()
    }
  }, [user])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Session check:', session)
      
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Erro ao buscar perfil:', error)
        return
      }

      if (userData) {
        setUser(userData)
        console.log('User profile loaded:', userData)
      }
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error)
    }
  }

  const loadFavorites = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('api_id')
        .eq('user_id', user.id)

      if (error) throw error

      setFavorites(data?.map(fav => fav.api_id) || [])
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        await fetchUserProfile(data.user.id)
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: getRedirectUrl()
        }
      })

      if (error) throw error

      // Criar usuário na tabela public.users
      if (data.user) {
        const { error: userError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              name,
              email,
              password_hash: 'oauth',
            }
          ])

        if (userError) {
          console.error('Erro ao criar usuário:', userError)
          // Não lançar erro aqui para não bloquear o registro
        }

        // Se o email não precisa de confirmação, fazer login automaticamente
        if (data.session) {
          await fetchUserProfile(data.user.id)
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  // 🔐 Login com OAuth (Google/GitHub)
  const loginWithOAuth = async (provider: 'google' | 'github') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: getRedirectUrl(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) throw error

      // O redirecionamento é automático
    } catch (error: any) {
      throw new Error(error.message || `Erro ao conectar com ${provider}`)
    }
  }

  // 🔐 Verificar sessão OAuth
  const checkOAuthSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      }
    } catch (error) {
      console.error('Erro ao verificar sessão OAuth:', error)
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setFavorites([])
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const toggleFavorite = async (apiId: string) => {
    if (!user) return

    try {
      const isFavorited = favorites.includes(apiId)

      if (isFavorited) {
        // Remover dos favoritos
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('api_id', apiId)

        if (!error) {
          setFavorites(prev => prev.filter(id => id !== apiId))
        }
      } else {
        // Adicionar aos favoritos
        const { error } = await supabase
          .from('user_favorites')
          .insert([
            {
              user_id: user.id,
              api_id: apiId,
            }
          ])

        if (!error) {
          setFavorites(prev => [...prev, apiId])
        }
      }
    } catch (error) {
      console.error('Erro ao alternar favorito:', error)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      loginWithOAuth,
      checkOAuthSession,
      isLoading,
      favorites,
      toggleFavorite
    }}>
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