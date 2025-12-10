// lib/api.ts
import type { API } from '@/types'

const API_BASE_URL = 'https://apihub-br.duckdns.org'

// Função para buscar todas as APIs
export async function fetchAPIs(): Promise<API[]> {
  try {
    console.log('🔍 [api] Buscando todas as APIs...')
    
    const response = await fetch(`${API_BASE_URL}/apis`)
    
    if (!response.ok) {
      console.error('❌ [api] Erro ao buscar APIs:', response.status)
      return []
    }
    
    const apis = await response.json()
    console.log(`✅ [api] ${apis.length} APIs carregadas`)
    
    return apis
  } catch (error) {
    console.error('❌ [api] Erro de rede:', error)
    return []
  }
}

// Função para buscar API por ID
export async function fetchAPIById(id: string): Promise<API | null> {
  try {
    console.log(`🔍 [api] Buscando API por ID: ${id}`)
    
    const response = await fetch(`${API_BASE_URL}/api/${id}`)
    
    if (!response.ok) {
      console.error('❌ [api] API não encontrada:', response.status)
      return null
    }
    
    const api = await response.json()
    console.log(`✅ [api] API encontrada: ${api.name}`)
    
    return api
  } catch (error) {
    console.error('❌ [api] Erro ao buscar API por ID:', error)
    return null
  }
}

// Função para buscar API por slug
export async function fetchAPIBySlug(slug: string): Promise<API | null> {
  try {
    console.log(`🔍 [api] Buscando API por slug: ${slug}`)
    
    const response = await fetch(`${API_BASE_URL}/api-by-slug/${slug}`)
    
    if (!response.ok) {
      console.error('❌ [api] API não encontrada por slug:', response.status)
      return null
    }
    
    const api = await response.json()
    console.log(`✅ [api] API encontrada por slug: ${api.name}`)
    
    return api
  } catch (error) {
    console.error('❌ [api] Erro ao buscar API por slug:', error)
    return null
  }
}

// Função para buscar APIs favoritas do usuário
export async function fetchUserFavorites(userId: string): Promise<API[]> {
  try {
    console.log(`🔍 [api] Buscando favoritos do usuário: ${userId}`)
    
    const response = await fetch(`${API_BASE_URL}/favoritos/${userId}`)
    
    if (!response.ok) {
      console.error('❌ [api] Erro ao buscar favoritos:', response.status)
      return []
    }
    
    const favorites = await response.json()
    console.log(`✅ [api] ${favorites.length} favoritos encontrados`)
    
    // Extrair as APIs dos objetos de favorito
    const apis = favorites.map((fav: any) => fav.apis).filter(Boolean)
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        api_id: apiId
      })
    })
    
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

// Função para buscar estatísticas de uma API
export async function fetchAPIStatistics(apiId: string): Promise<any> {
  try {
    console.log(`📊 [api] Buscando estatísticas da API: ${apiId}`)
    
    // Esta função depende de ter uma rota no backend
    // Se não tiver, pode retornar dados mock ou vazio
    return {
      uptime: '99.9%',
      avgResponseTime: '120ms',
      totalTests: 1500,
      lastTested: new Date().toISOString()
    }
  } catch (error) {
    console.error('❌ [api] Erro ao buscar estatísticas:', error)
    return null
  }
}

// Função para buscar categorias únicas
export async function fetchCategories(): Promise<string[]> {
  try {
    const apis = await fetchAPIs()
    
    // Extrair categorias das tags
    const categories = Array.from(
      new Set(
        apis.map(api => {
          if (!api.tags) return 'Outros'
          
          const commonCategories = [
            'Clima', 'Financeiro', 'Imagens', 'Dados', 'Tradução', 
            'Geografia', 'Redes Sociais', 'Pagamentos', 'IA', 'Educação',
            'Animais', 'Palavras', 'Livros', 'Produtos', 'Diversão',
            'Nomes', 'Localização', 'Fotos', 'Música', 'Jogos',
            'Desenvolvimento', 'Email', 'Calendário', 'Análises', 'Mobile'
          ]
          
          const tagList = api.tags.split(',').map(tag => tag.trim())
          const foundCategory = commonCategories.find(category => 
            tagList.some(tag => tag.toLowerCase().includes(category.toLowerCase()))
          )
          
          return foundCategory || 'Outros'
        })
      )
    )
    
    return categories.sort()
  } catch (error) {
    console.error('❌ [api] Erro ao buscar categorias:', error)
    return ['Outros']
  }
}

// Função para filtrar APIs
export async function filterAPIs(filters: {
  category?: string
  search?: string
  freeOnly?: boolean
}): Promise<API[]> {
  try {
    const apis = await fetchAPIs()
    
    let filtered = apis
    
    // Filtrar por categoria
    if (filters.category && filters.category !== 'Todos') {
      filtered = filtered.filter(api => {
        if (!api.tags) return filters.category === 'Outros'
        
        const commonCategories = [
          'Clima', 'Financeiro', 'Imagens', 'Dados', 'Tradução', 
          'Geografia', 'Redes Sociais', 'Pagamentos', 'IA', 'Educação',
          'Animais', 'Palavras', 'Livros', 'Produtos', 'Diversão',
          'Nomes', 'Localização', 'Fotos', 'Música', 'Jogos',
          'Desenvolvimento', 'Email', 'Calendário', 'Análises', 'Mobile'
        ]
        
        const tagList = api.tags.split(',').map(tag => tag.trim())
        const foundCategory = commonCategories.find(category => 
          tagList.some(tag => tag.toLowerCase().includes(category.toLowerCase()))
        )
        
        const apiCategory = foundCategory || 'Outros'
        return apiCategory === filters.category
      })
    }
    
    // Filtrar por busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(api =>
        api.name.toLowerCase().includes(searchLower) ||
        api.description.toLowerCase().includes(searchLower) ||
        api.tags.toLowerCase().includes(searchLower)
      )
    }
    
    // Filtrar por grátis apenas (baseado na presença de "free" ou "gratis" nas tags)
    if (filters.freeOnly) {
      filtered = filtered.filter(api =>
        api.tags.toLowerCase().includes('free') ||
        api.tags.toLowerCase().includes('gratis') ||
        api.tags.toLowerCase().includes('gratuito')
      )
    }
    
    return filtered
  } catch (error) {
    console.error('❌ [api] Erro ao filtrar APIs:', error)
    return []
  }
}