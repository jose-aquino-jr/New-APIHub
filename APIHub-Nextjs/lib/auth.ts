// lib/auth.js
import { supabase } from './supabase'

// Função de login
export async function login(email, password) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password_hash', password)
      .single()

    if (error) return { error }
    return { user: data, error: null }
  } catch (error) {
    return { error }
  }
}

// Função de registro
export async function register(email, password, name) {
  try {
    // Verificar se usuário já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return { error: new Error('Usuário já existe') }
    }

    // Criar novo usuário
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          name,
          password_hash: password,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) return { error }
    return { user: data, error: null }
  } catch (error) {
    return { error }
  }
}

// Função de logout
export async function logout() {
  // Limpar dados locais
  localStorage.removeItem('user')
  localStorage.removeItem('authToken')
}

// Buscar usuário atual
export async function getCurrentUser(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data
}

// Verificar sessão
export async function checkAuth() {
  if (typeof window === 'undefined') return null
  
  const userData = localStorage.getItem('user')
  if (!userData) return null
  
  try {
    const user = JSON.parse(userData)
    // Verificar se usuário ainda existe no banco
    const currentUser = await getCurrentUser(user.id)
    return currentUser
  } catch {
    return null
  }
}
