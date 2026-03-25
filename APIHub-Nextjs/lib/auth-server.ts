// app/lib/auth-server.ts
import { cookies } from 'next/headers'
import type { User } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apihub-br.duckdns.org'

export async function getCurrentUser(): Promise<User | null> {
  // ─── BYPASS DE DESENVOLVIMENTO ──────────────────────────────────────────
  // Retorna um usuário falso em desenvolvimento para evitar depender
  // do cookie e do backend durante o desenvolvimento local.
  // Nunca executa em produção pois NODE_ENV é 'production' no build.
  if (process.env.NODE_ENV === 'development') {
    return {
      id: '1c9dd341-f1d8-400f-b4be-83a5562d7947',
      name: 'Dev User',
      email: 'dev@apihub.com',
      bio: '',
      preferredLanguages: [],
      avatar_url: '',
      accept_terms: true,
       created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    } as User
  }
  // ────────────────────────────────────────────────────────────────────────

  try {
    const cookieStore = cookies()
    const token = cookieStore.get('authToken')?.value
    
    if (!token) return null
    
    const response = await fetch(`${API_BASE_URL}/auth/session`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // cache: no-store garante que sempre busca a sessão atual,
      // evitando servir resposta cacheada de um token já inválido
      cache: 'no-store'
    })
    
    if (!response.ok) return null
    
    const data = await response.json()
    
    if (!data.success || !data.data?.user) return null
    
    return data.data.user as User
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) return null
  return user
}