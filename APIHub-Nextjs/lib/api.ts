// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://apihub-br.duckdns.org'

export interface API {
  id: string
  name: string
  description: string
  base_url: string
  endpoint_path?: string
  method: string
  authentication_type: string
  tags: string
  language_api?: string
  cors: boolean
  https: boolean
  parameters?: string
  response_format?: string
  usage_example?: string
  pdf_url?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  name: string
}

// Função para buscar todas as APIs
export async function fetchAPIs(): Promise<API[]> {
  try {
    console.log(' [api] Buscando APIs...')
    
    const response = await fetch(`${API_BASE_URL}/apis`)
    
    if (!response.ok) {
      console.error(' [api] Erro ao buscar APIs:', response.status)
      return []
    }
    
    const data = await response.json()
    console.log(` [api] ${data.data?.length || 0} APIs encontradas`)
    
    return data.data || data || []
  } catch (error) {
    console.error(' [api] Erro ao buscar APIs:', error)
    return []
  }
}

// Função para buscar API por slug
export async function fetchAPIBySlug(slug: string): Promise<API | null> {
  try {
    console.log(` [api] Buscando API por slug: ${slug}`)
    
    const response = await fetch(`${API_BASE_URL}/api-by-slug/${slug}`)
    
    if (!response.ok) {
      console.error(' [api] Erro ao buscar API:', response.status)
      return null
    }
    
    const data = await response.json()
    console.log(' [api] API encontrada:', data.data?.name)
    
    return data.data || null
  } catch (error) {
    console.error(' [api] Erro ao buscar API:', error)
    return null
  }
}

// Função para buscar APIs por categoria
export async function fetchAPIsByCategory(category: string): Promise<API[]> {
  try {
    console.log(` [api] Buscando APIs da categoria: ${category}`)
    
    // Primeiro busca todas as APIs
    const allAPIs = await fetchAPIs()
    
    // Filtra pela categoria
    const filteredAPIs = allAPIs.filter(api => {
      const categories = api.tags.toLowerCase().split(',')
      return categories.some(cat => cat.trim().includes(category.toLowerCase()))
    })
    
    console.log(` [api] ${filteredAPIs.length} APIs encontradas na categoria ${category}`)
    
    return filteredAPIs
  } catch (error) {
    console.error('[api] Erro ao buscar APIs por categoria:', error)
    return []
  }
}

// Função para buscar APIs por nome ou descrição
export async function searchAPIs(query: string): Promise<API[]> {
  try {
    console.log(` [api] Buscando APIs com query: ${query}`)
    
    // Busca todas as APIs
    const allAPIs = await fetchAPIs()
    
    // Filtra pela query
    const filteredAPIs = allAPIs.filter(api => {
      const searchString = `${api.name} ${api.description} ${api.tags}`.toLowerCase()
      return searchString.includes(query.toLowerCase())
    })
    
    console.log(` [api] ${filteredAPIs.length} APIs encontradas para "${query}"`)
    
    return filteredAPIs
  } catch (error) {
    console.error(' [api] Erro ao buscar APIs:', error)
    return []
  }
}

function getAuthHeader(): HeadersInit {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('authToken') 
    : null
  
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
  
  return {
    'Content-Type': 'application/json'
  }
}

// Função para buscar APIs favoritas do usuário
export async function fetchUserFavorites(userId: string): Promise<API[]> {
  try {
    console.log(` [api] Buscando favoritos do usuário: ${userId}`)
    
    const response = await fetch(`${API_BASE_URL}/user-favorites?user_id=${userId}`, {
      headers: getAuthHeader()
    })
    
    if (response.status === 401) {
      console.error(' [api] Não autorizado - token inválido ou expirado')
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken')
      }
      return []
    }
    
    if (!response.ok) {
      console.error(' [api] Erro ao buscar favoritos:', response.status)
      return []
    }
    
    const data = await response.json()
    console.log(` [api] ${data.data?.length || 0} favoritos encontrados`)
    
    // Extrair as APIs dos objetos de favorito
    const apis = data.data?.map((fav: any) => fav.apis).filter(Boolean) || []
    return apis
  } catch (error) {
    console.error(' [api] Erro ao buscar favoritos:', error)
    return []
  }
}

// Função para adicionar/remover favorito
export async function toggleFavorite(userId: string, apiId: string, isFavorite: boolean): Promise<boolean> {
  try {
    console.log(` [api] ${isFavorite ? 'Removendo' : 'Adicionando'} favorito...`)
    
    const url = isFavorite 
      ? `${API_BASE_URL}/user-favorites?user_id=${userId}&api_id=${apiId}`
      : `${API_BASE_URL}/user-favorites`
    
    const response = await fetch(url, {
      method: isFavorite ? 'DELETE' : 'POST',
      headers: getAuthHeader(),
      body: !isFavorite ? JSON.stringify({
        user_id: userId,
        api_id: apiId
      }) : undefined
    })
    
    if (response.status === 401) {
      console.error(' [api] Não autorizado - token inválido ou expirado')
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken')
        alert('Sua sessão expirou. Por favor, faça login novamente.')
      }
      return false
    }
    
    if (!response.ok) {
      console.error(' [api] Erro ao alterar favorito:', response.status)
      return false
    }
    
    console.log(` [api] Favorito ${isFavorite ? 'removido' : 'adicionado'}`)
    return true
  } catch (error) {
    console.error(' [api] Erro ao alterar favorito:', error)
    return false
  }
}

// Função para verificar se uma API é favorita
export async function checkFavorite(userId: string, apiId: string): Promise<boolean> {
  try {
    console.log(`🔍 [api] Verificando se API ${apiId} é favorita do usuário ${userId}`)
    
    const response = await fetch(`${API_BASE_URL}/user-favorites/check?user_id=${userId}&api_id=${apiId}`)
    
    if (!response.ok) {
      console.error(' [api] Erro ao verificar favorito:', response.status)
      return false
    }
    
    const data = await response.json()
    console.log(` [api] API ${apiId} ${data.isFavorite ? 'é' : 'não é'} favorita`)
    
    return data.isFavorite || false
  } catch (error) {
    console.error(' [api] Erro ao verificar favorito:', error)
    return false
  }
}

// Função para buscar API por ID
export async function fetchAPIById(apiId: string): Promise<API | null> {
  try {
    console.log(` [api] Buscando API por ID: ${apiId}`)
    
    const response = await fetch(`${API_BASE_URL}/api/${apiId}`)
    
    if (!response.ok) {
      console.error(' [api] Erro ao buscar API:', response.status)
      return null
    }
    
    const data = await response.json()
    console.log(' [api] API encontrada:', data.data?.name)
    
    return data.data || null
  } catch (error) {
    console.error(' [api] Erro ao buscar API:', error)
    return null
  }
}
