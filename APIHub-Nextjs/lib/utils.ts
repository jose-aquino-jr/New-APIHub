import { supabase } from './supabase'
import type { API } from './supabase'

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
}

// Função para extrair categoria das tags
export function getCategoryFromTags(tags: string): string {
  if (!tags) return 'Outros'
  
  const commonCategories = [
    'Clima', 'Financeiro', 'Imagens', 'Dados', 'Tradução', 
    'Geografia', 'Redes Sociais', 'Pagamentos', 'IA', 'Educação'
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

// Função para buscar API pelo slug
export async function getApiBySlug(slug: string): Promise<API | null> {
  try {
    const { data: apis, error } = await supabase
      .from('apis')
      .select('*')

    if (error) throw error

    const api = apis?.find((a: API) => generateSlug(a.name) === slug)
    return api || null
  } catch (error) {
    console.error('Erro ao buscar API por slug:', error)
    return null
  }
}

// Função para obter APIs relacionadas
export async function getRelatedApis(api: API, limit: number = 4): Promise<API[]> {
  const { data: relatedApis, error } = await supabase
    .from('apis')
    .select('*')
    .neq('id', api.id)
    .like('tags', `%${getCategoryFromTags(api.tags)}%`)
    .limit(limit)

  if (error) {
    console.error('Erro ao buscar APIs relacionadas:', error)
    return []
  }

  return relatedApis || []
}