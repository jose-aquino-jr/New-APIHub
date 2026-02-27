// app/apis/page.tsx - SSR
import { Suspense } from 'react'
import { fetchAPIs } from '@/lib/api'
import type { API } from '@/types'
import { APICatalogClient } from '@/components/APICatalogClient'
import { APICatalogSkeleton } from '@/components/APICatalogSkeleton'

// Forçar SSR
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidar a cada hora

async function getAPIs() {
  try {
    const data = await fetchAPIs()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Erro ao carregar APIs:', error)
    return []
  }
}

export default async function APICatalogPage() {
  const apis = await getAPIs()
  
  return (
    <Suspense fallback={<APICatalogSkeleton />}>
      <APICatalogClient initialApis={apis} />
    </Suspense>
  )
}