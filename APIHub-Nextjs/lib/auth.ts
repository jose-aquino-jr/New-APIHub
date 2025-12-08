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

    if (data.success && data.user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('authToken', 'authenticated')
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
        name: name.trim()
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
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('authToken', 'authenticated')
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
    if (!userData) return null

    return JSON.parse(userData) as User
  } catch {
    return null
  }
}

export async function logout(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
  }
}