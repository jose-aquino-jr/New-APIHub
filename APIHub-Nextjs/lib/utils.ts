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
    // Remove "api" do final para compatibilidade com backend
    .replace(/-api$/, '');
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

// Função para obter APIs relacionadas - ATUALIZADA
export async function getRelatedApis(api: API, limit: number = 4): Promise<API[]> {
  try {
    console.log('🔍 [utils] Buscando APIs relacionadas para:', api.name)
    
    // Agora usa a função do lib/api.ts
    const { fetchAPIs } = await import('./api')
    const allApis = await fetchAPIs()
    
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
  return url.replace(/\/$/, '') // Remove barra final
}