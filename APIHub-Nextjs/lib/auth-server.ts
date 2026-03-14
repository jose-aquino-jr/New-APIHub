// app/lib/auth-server.ts
import { cookies } from 'next/headers'
import type { User } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apihub-br.duckdns.org'

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('authToken')?.value
    
    if (!token) {
      return null
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/session`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // Cache por 60 segundos para evitar muitas requisições
      next: { revalidate: 60 }
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    
    if (!data.success || !data.data?.user) {
      return null
    }
    
    return data.data.user as User
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    // Em Server Components, redirecionar é diferente
    // Isso será tratado pelo componente que usa esta função
    return null
  }
  
  return user
}