// app/apis/[slug]/page.tsx - SSR
import { notFound } from 'next/navigation'
import { getApiBySlug, getRelatedApis, getCategoryFromTags } from '@/lib/utils'
import { APIDetailClient } from '@/components/APIDetailClient'
import { APIDetailSkeleton } from '@/components/APIDetailSkeleton'
import { Suspense } from 'react'

// Forçar SSR
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidar a cada hora

interface PageProps {
  params: {
    slug: string
  }
}

async function getAPI(slug: string) {
  const api = await getApiBySlug(slug)
  if (!api) return null
  
  const related = await getRelatedApis(api, 4)
  return { api, related }
}

export default async function APIDetailPage({ params }: PageProps) {
  const data = await getAPI(params.slug)
  
  if (!data) {
    notFound()
  }
  
  const category = getCategoryFromTags(data.api.tags)
  
  return (
    <Suspense fallback={<APIDetailSkeleton />}>
      <APIDetailClient 
        initialApi={data.api}
        initialRelated={data.related}
        initialCategory={category}
      />
    </Suspense>
  )
}