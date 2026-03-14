// app/lib/api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apihub-br.duckdns.org'

export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('authToken')
    : null // Em server components, use cookies
  
  const headers = new Headers(options.headers || {})
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  
  headers.set('Content-Type', 'application/json')
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })
  
  // Se receber 401, token pode ter expirado
  if (response.status === 401 && typeof window !== 'undefined') {
    // Limpar dados de autenticação
    localStorage.removeItem('authToken')
    localStorage.removeItem('apihub_user')
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    
    // Redirecionar para login se não for uma requisição de API
    if (!endpoint.startsWith('/api/')) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}&error=session_expired`
    }
  }
  
  return response
}

// Versão para Server Components
export async function fetchWithAuthServer(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers || {})
  headers.set('Authorization', `Bearer ${token}`)
  headers.set('Content-Type', 'application/json')
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    next: { revalidate: 60 } // Cache por 60 segundos
  })
}