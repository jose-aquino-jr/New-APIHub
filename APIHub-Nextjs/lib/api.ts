// lib/api.ts 
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://apihub-br.duckdns.org'

// Função para buscar todas as APIs
export async function fetchAPIs(): Promise<any[]> {
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
export async function fetchAPIBySlug(slug: string): Promise<any | null> {
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
export async function fetchAPIsByCategory(category: string): Promise<any[]> {
  try {
    console.log(` [api] Buscando APIs da categoria: ${category}`)
    
    const allAPIs = await fetchAPIs()
    
    const filteredAPIs = allAPIs.filter((api: any) => {
      const categories = api.tags?.toLowerCase().split(',') || []
      return categories.some((cat: string) => cat.trim().includes(category.toLowerCase()))
    })
    
    console.log(` [api] ${filteredAPIs.length} APIs encontradas na categoria ${category}`)
    
    return filteredAPIs
  } catch (error) {
    console.error(' [api] Erro ao buscar APIs por categoria:', error)
    return []
  }
}

// Função para buscar APIs por nome ou descrição
export async function searchAPIs(query: string): Promise<any[]> {
  try {
    console.log(` [api] Buscando APIs com query: ${query}`)
    
    const allAPIs = await fetchAPIs()
    
    const filteredAPIs = allAPIs.filter((api: any) => {
      const searchString = `${api.name || ''} ${api.description || ''} ${api.tags || ''}`.toLowerCase()
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
export async function fetchUserFavorites(userId: string): Promise<any[]> {
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
    console.log(` [api] Verificando se API ${apiId} é favorita do usuário ${userId}`)
    
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
export async function fetchAPIById(apiId: string): Promise<any | null> {
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
