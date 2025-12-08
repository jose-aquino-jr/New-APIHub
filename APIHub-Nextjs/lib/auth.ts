// lib/auth.ts
import { supabase } from './supabase'
import { User } from '@/types'

// Função de login corrigida
export async function login(email: string, password: string): Promise<{ user: User | null; error: any }> {
  try {
    // Use o sistema de autenticação do Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      console.error('Login error:', error)
      return { user: null, error }
    }

    if (!data.user) {
      return { user: null, error: new Error('Usuário não encontrado') }
    }

    // Buscar informações adicionais do usuário na tabela 'users'
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      return { user: null, error: userError }
    }

    // Salvar usuário no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('authToken', data.session?.access_token || '')
    }

    return { user: userData, error: null }
  } catch (error) {
    console.error('Login exception:', error)
    return { user: null, error }
  }
}

// Função de registro corrigida
export async function register(email: string, password: string, name: string): Promise<{ user: User | null; error: any }> {
  try {
    // Validações básicas
    if (password.length < 6) {
      return { user: null, error: new Error('A senha deve ter pelo menos 6 caracteres') }
    }

    if (!email.includes('@')) {
      return { user: null, error: new Error('Email inválido') }
    }

    // Registrar usuário usando o sistema de auth do Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name: name,
        },
      },
    })

    if (authError) {
      console.error('Auth registration error:', authError)
      return { user: null, error: authError }
    }

    if (!authData.user) {
      return { user: null, error: new Error('Erro ao criar usuário') }
    }

    // Criar registro na tabela 'users'
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: email.trim().toLowerCase(),
          name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('User table insert error:', error)
      // Se der erro na tabela users, tenta deletar o usuário de auth
      await supabase.auth.admin.deleteUser(authData.user.id)
      return { user: null, error }
    }

    return { user: data, error: null }
  } catch (error) {
    console.error('Register exception:', error)
    return { user: null, error }
  }
}

// Login com OAuth
export async function loginWithOAuth(provider: 'google' | 'github') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) throw error
  return data
}

// Função de logout
export async function logout(): Promise<void> {
  // Limpar sessão no Supabase
  await supabase.auth.signOut()
  
  // Limpar dados locais
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
    sessionStorage.clear()
  }
}

// Buscar usuário atual
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Verificar se há sessão ativa
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return null
    }

    // Buscar informações do usuário
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (error) return null
    return data
  } catch {
    return null
  }
}

// Verificar sessão
export async function checkAuth(): Promise<User | null> {
  try {
    const user = await getCurrentUser()
    
    if (user && typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user))
    }
    
    return user
  } catch {
    return null
  }
}

// Verificar OAuth callback
export async function checkOAuthSession() {
  if (typeof window === 'undefined') return null
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      // Verificar se usuário existe na tabela users
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!existingUser) {
        // Criar usuário na tabela se não existir
        const { data: newUser } = await supabase
          .from('users')
          .insert([
            {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata.name || session.user.email?.split('@')[0],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single()

        if (newUser && typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(newUser))
        }
        return newUser
      }

      if (existingUser && typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(existingUser))
      }
      return existingUser
    }
  } catch (error) {
    console.error('OAuth session check error:', error)
  }
  
  return null
}
