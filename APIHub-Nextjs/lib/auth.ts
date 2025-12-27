// lib/auth.ts
import { User } from '@/types'

const BACKEND_URL = 'https://apihub-br.duckdns.org'

export async function login(email: string, password: string): Promise<{ user: User | null; error: any }> {
  try {
    const response = await fetch(`${BACKEND_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        senha: password
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        user: null,
        error: new Error(data.message || 'Erro no login')
      }
    }

    if (data.success && data.user && data.session) {
      if (typeof window !== 'undefined') {
        // SALVAR O TOKEN REAL DO SUPABASE
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('authToken', data.session.access_token)
        localStorage.setItem('refreshToken', data.session.refresh_token)
      }
      
      return { user: data.user as User, error: null }
    }

    return { user: null, error: new Error(data.message || 'Erro desconhecido') }

  } catch (error) {
    console.error('Erro de conexão:', error)
    return {
      user: null,
      error: new Error('Erro ao conectar com o servidor')
    }
  }
}

export async function register(email: string, password: string, name: string): Promise<{ user: User | null; error: any }> {
  try {
    const response = await fetch(`${BACKEND_URL}/cadastro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        senha: password,
        name: name.trim(),
        aceitou_termos: true
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        user: null,
        error: new Error(data.message || 'Erro no cadastro')
      }
    }

    if (data.success && data.user) {
      if (typeof window !== 'undefined') {
        // Para cadastro, talvez não tenha token ainda (precisa confirmar email)
        localStorage.setItem('user', JSON.stringify(data.user))
        // Não salva token se não estiver presente
        if (data.session?.access_token) {
          localStorage.setItem('authToken', data.session.access_token)
        }
      }
      
      return { user: data.user as User, error: null }
    }

    return { user: null, error: new Error(data.message || 'Erro desconhecido') }

  } catch (error) {
    console.error('Erro de conexão:', error)
    return {
      user: null,
      error: new Error('Erro ao conectar com o servidor')
    }
  }
}

export async function checkAuth(): Promise<User | null> {
  if (typeof window === 'undefined') return null
  
  try {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('authToken')
    
    if (!userData || !token) {
      // Se não tem token, remove dados inconsistentes
      localStorage.removeItem('user')
      localStorage.removeItem('authToken')
      return null
    }

    return JSON.parse(userData) as User
  } catch {
    return null
  }
}

export async function logout(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
  }
}

// Função auxiliar para obter token
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('authToken')
}
