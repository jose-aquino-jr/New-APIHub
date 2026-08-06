// app/apis/[slug]/page.tsx (06-08-26)
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { fetchAPIs } from '@/lib/api'
import { generateSlug } from '@/lib/slug'
import { APIDetailClient } from '@/components/APIDetailClient'
import { APIDetailSkeleton } from '@/components/APIDetailSkeleton'

export const revalidate = 3600
// remove o dynamic = 'force-static'

export async function generateStaticParams() {
  const apis = await fetchAPIs()
  return apis.map((api: any) => ({
    slug: api.slug
  }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getAPI(slug: string) {
  const allApis = await fetchAPIs()   // busca as 43 UMA única vez
  const api = allApis.find((a: any) => generateSlug(a.name) === slug)
  if (!api) return null

  const category = api.tags?.split(',')[0]?.trim() || ''
  const related = allApis
    .filter((a: any) => a.id !== api.id && a.tags?.includes(category))
    .slice(0, 4)
  
  return { api, related, category }
}

export default async function APIDetailPage({ params }: PageProps) {
  const { slug } = await params
  const data = await getAPI(slug)
  
  if (!data) notFound()
  
  return (
    <Suspense fallback={<APIDetailSkeleton />}>
      <APIDetailClient 
        initialApi={data.api}
        initialRelated={data.related}
        initialCategory={data.category}
      />
    </Suspense>
  )
}

