import { MetadataRoute } from 'next'

type ApiSlug = {
  slug: string
  updated_at?: string
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.apihub.com.br'

  // Estáticas
  const staticPages = ['', '/apis', '/suporte']

  const staticUrls = staticPages.map(page => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
  }))

  // Dinâmicas (APIs)
  let apis: ApiSlug[] = []

  try {
    const response = await fetch('https://apihub-br.duckdns.org/public-apis-slug', {
      next: { revalidate: 3600 }, // 1h
    })
    apis = await response.json()
  } catch (error) {
    console.error('Erro ao buscar as APIs:', error)
  }

  const apiUrls = apis.map(api => ({
    url: `${baseUrl}/apis/${api.slug}`,
    lastModified: api.updated_at ? new Date(api.updated_at) : new Date(),
  }))

  return [...staticUrls, ...apiUrls]
}
