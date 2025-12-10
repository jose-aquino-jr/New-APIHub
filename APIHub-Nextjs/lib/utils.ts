// lib/utils.ts
import type { API } from '@/types'

// Função para gerar slug a partir do nome
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .replace(/-api$/, '')
}

// Função para extrair categoria das tags
export function getCategoryFromTags(tags: string): string {
  if (!tags) return 'Outros'
  
  const commonCategories = [
    'Clima', 'Financeiro', 'Imagens', 'Dados', 'Tradução', 
    'Geografia', 'Redes Sociais', 'Pagamentos', 'IA', 'Educação',
    'Animais', 'Palavras', 'Livros', 'Produtos', 'Diversão',
    'Nomes', 'Localização', 'Fotos', 'Música', 'Jogos',
    'Desenvolvimento', 'Email', 'Calendário', 'Análises', 'Mobile'
  ]
  
  const tagList = tags.split(',').map(tag => tag.trim())
  const foundCategory = commonCategories.find(category => 
    tagList.some(tag => tag.toLowerCase().includes(category.toLowerCase()))
  )
  
  return foundCategory || 'Outros'
}

// Função para parsear parâmetros
export function parseParameters(parameters: string): Record<string, string> {
  try {
    if (!parameters) return {}
    return JSON.parse(parameters)
  } catch {
    return { parâmetros: parameters }
  }
}

// FUNÇÃO ADICIONADA DE VOLTA: Buscar API pelo slug
export async function getApiBySlug(slug: string): Promise<API | null> {
  try {
    console.log('🔍 [utils] Buscando API por slug:', slug)
    
    // Primeiro tenta com o slug exato
    let response = await fetch(`https://apihub-br.duckdns.org/api-by-slug/${slug}`)
    
    if (response.ok) {
      const api = await response.json()
      console.log('✅ [utils] API encontrada:', api.name)
      return api
    }
    
    console.log(`⚠️ [utils] Slug "${slug}" não encontrado, tentando variações...`)
    
    // Se falhar, tenta sem "-api" no final
    if (slug.endsWith('-api')) {
      const slugWithoutApi = slug.replace(/-api$/, '')
      console.log(`🔄 [utils] Tentando sem "-api": ${slugWithoutApi}`)
      
      response = await fetch(`https://apihub-br.duckdns.org/api-by-slug/${slugWithoutApi}`)
      
      if (response.ok) {
        const api = await response.json()
        console.log('✅ [utils] API encontrada sem "-api":', api.name)
        return api
      }
    }
    
    // Se ainda falhar, busca em todas as APIs localmente
    console.log('🔄 [utils] Buscando em todas as APIs...')
    const allApisResponse = await fetch('https://apihub-br.duckdns.org/apis')
    
    if (!allApisResponse.ok) {
      console.error('❌ [utils] Falha ao buscar todas as APIs')
      return null
    }
    
    const allApis = await allApisResponse.json()
    console.log(`📊 [utils] ${allApis.length} APIs disponíveis`)
    
    // Lógica de busca local
    const normalizedSlug = slug.toLowerCase().trim()
    
    const api = allApis.find((api: API) => {
      const apiName = api.name.toLowerCase().trim()
      
      // 1. Compara slug gerado do nome
      const apiSlug = generateSlug(apiName)
      if (apiSlug === normalizedSlug) return true
      
      // 2. Compara sem "api" no final
      if (normalizedSlug.endsWith('-api')) {
        const slugWithoutApi = normalizedSlug.replace(/-api$/, '')
        const apiSlugWithoutApi = apiSlug.replace(/-api$/, '')
        if (apiSlugWithoutApi === slugWithoutApi) return true
      }
      
      // 3. Compara palavras-chave
      const slugWords = normalizedSlug.replace(/-api$/, '').split('-')
      const nameWords = apiName.split(/\s+/)
      
      return slugWords.every(word => 
        nameWords.some(nameWord => nameWord.includes(word))
      )
    })
    
    if (api) {
      console.log('✅ [utils] API encontrada localmente:', api.name)
      return api
    }
    
    console.log('❌ [utils] API não encontrada após todas as tentativas')
    return null
    
  } catch (error) {
    console.error('❌ [utils] Erro ao buscar API por slug:', error)
    return null
  }
}

// Função para obter APIs relacionadas
export async function getRelatedApis(api: API, limit: number = 4): Promise<API[]> {
  try {
    console.log('🔍 [utils] Buscando APIs relacionadas para:', api.name)
    
    const response = await fetch('https://apihub-br.duckdns.org/apis')
    if (!response.ok) {
      console.error('❌ [utils] Falha ao buscar APIs para relacionadas')
      return []
    }
    
    const allApis = await response.json()
    const category = getCategoryFromTags(api.tags)
    
    console.log(`📊 [utils] Categoria: ${category}, Total APIs: ${allApis.length}`)
    
    // Filtrar APIs da mesma categoria (exceto a atual)
    const related = allApis.filter((a: API) => 
      a.id !== api.id && 
      getCategoryFromTags(a.tags) === category
    ).slice(0, limit)
    
    console.log(`✅ [utils] ${related.length} APIs relacionadas encontradas`)
    return related
    
  } catch (error) {
    console.error('❌ [utils] Erro ao buscar APIs relacionadas:', error)
    return []
  }
}

// Função para formatar data
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Função para capitalizar primeira letra
export function capitalizeFirst(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Função para limpar URL
export function cleanUrl(url: string): string {
  if (!url) return ''
  return url.replace(/\/$/, '')
}
