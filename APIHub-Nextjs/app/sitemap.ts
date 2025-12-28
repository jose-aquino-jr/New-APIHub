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

  // Dinâmicas
  let apis: ApiSlug[] = []

  try {
    const res = await fetch(
      'https://apihub-br.duckdns.org/public-apis-slug',
      { next: { revalidate: 3600 } }
    )

    const json = await res.json()

    if (Array.isArray(json)) {
      apis = json
    }
  } catch (err) {
    console.error('Erro ao gerar sitemap dinâmico:', err)
  }

  const apiUrls = apis.map(api => ({
    url: `${baseUrl}/apis/${api.slug}`,
    lastModified: api.updated_at ? new Date(api.updated_at) : new Date(),
  }))

  return [...staticUrls, ...apiUrls]
}
