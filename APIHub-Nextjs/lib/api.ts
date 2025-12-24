// lib/api.ts - Adicione esta função no início
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

// Atualize TODAS as funções que precisam de autenticação:

// Função para buscar APIs favoritas do usuário
export async function fetchUserFavorites(userId: string): Promise<API[]> {
  try {
    console.log(`🔍 [api] Buscando favoritos do usuário: ${userId}`)
    
    const response = await fetch(`${API_BASE_URL}/favoritos/${userId}`, {
      headers: getAuthHeader() // ← ADICIONE ISSO
    })
    
    if (response.status === 401) {
      console.error('❌ [api] Não autorizado - token inválido ou expirado')
      // Opcional: logout automático
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken')
      }
      return []
    }
    
    if (!response.ok) {
      console.error('❌ [api] Erro ao buscar favoritos:', response.status)
      return []
    }
    
    const favorites = await response.json()
    console.log(`✅ [api] ${favorites.length} favoritos encontrados`)
    
    // Extrair as APIs dos objetos de favorito
    const apis = favorites.map((fav: any) => fav.api).filter(Boolean)
    return apis
  } catch (error) {
    console.error('❌ [api] Erro ao buscar favoritos:', error)
    return []
  }
}

// Função para adicionar/remover favorito
export async function toggleFavorite(userId: string, apiId: string, isFavorite: boolean): Promise<boolean> {
  try {
    console.log(`⭐ [api] ${isFavorite ? 'Removendo' : 'Adicionando'} favorito...`)
    
    const url = `${API_BASE_URL}/favoritos`
    const method = isFavorite ? 'DELETE' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: getAuthHeader(), // ← ADICIONE ISSO
      body: JSON.stringify({
        user_id: userId,
        api_id: apiId
      })
    })
    
    if (response.status === 401) {
      console.error('❌ [api] Não autorizado - token inválido ou expirado')
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken')
        alert('Sua sessão expirou. Por favor, faça login novamente.')
      }
      return false
    }
    
    if (!response.ok) {
      console.error('❌ [api] Erro ao alterar favorito:', response.status)
      return false
    }
    
    console.log(`✅ [api] Favorito ${isFavorite ? 'removido' : 'adicionado'}`)
    return true
  } catch (error) {
    console.error('❌ [api] Erro ao alterar favorito:', error)
    return false
  }
}
