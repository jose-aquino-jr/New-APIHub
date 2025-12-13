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
  const apis: ApiSlug[] = await fetch(
    'https://apihub-br.duckdns.org/public-apis-slugs',
    { next: { revalidate: 3600 } } // 1h
  ).then(res => res.json())

  const apiUrls = apis.map(api => ({
    url: `${baseUrl}/apis/${api.slug}`,
    lastModified: api.updated_at ? new Date(api.updated_at) : new Date(),
  }))

  return [...staticUrls, ...apiUrls]
}
