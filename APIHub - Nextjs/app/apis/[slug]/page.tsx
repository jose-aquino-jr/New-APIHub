'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Star, Shield, Globe, Zap, Copy, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCategoryFromTags, parseParameters, getApiBySlug, generateSlug } from '@/lib/utils'
import { useAuth } from '@/components/AuthProvider'
import type { API } from '@/types'

interface PageProps {
  params: {
    slug: string
  }
}

export default function APIDetail({ params }: PageProps) {
  const [api, setApi] = useState<API | null>(null)
  const [relatedApis, setRelatedApis] = useState<API[]>([])
  const [copied, setCopied] = useState(false)
  const { user, favorites, toggleFavorite } = useAuth()

  useEffect(() => {
    loadAPI()
  }, [params.slug])

  const loadAPI = async () => {
    try {
      console.log('🔍 Buscando API com slug:', params.slug)
      
      const foundApi = await getApiBySlug(params.slug)
      console.log('📦 API encontrada:', foundApi)

      if (!foundApi) {
        console.log('❌ API não encontrada para slug:', params.slug)
        notFound()
      }

      setApi(foundApi)

      // Carregar APIs relacionadas
      if (foundApi) {
        const category = getCategoryFromTags(foundApi.tags)
        const { data: related } = await supabase
          .from('apis')
          .select('*')
          .neq('id', foundApi.id)
          .like('tags', `%${category}%`)
          .limit(4)

        setRelatedApis(related || [])
      }
    } catch (error) {
      console.error('Erro ao carregar API:', error)
      notFound()
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!api) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando API...</p>
        </div>
      </div>
    )
  }

  const fullUrl = `${api.base_url}${api.endpoint_path || ''}`
  const parameters = parseParameters(api.parameters)

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="container-custom py-8">
        {/* Header da API */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <span className={`badge ${getCategoryColor(getCategoryFromTags(api.tags))}`}>
                  {getCategoryFromTags(api.tags)}
                </span>
                <span className="text-orange-600 font-semibold">GRATUITA</span>
                
                {user && (
                  <button 
                    onClick={() => toggleFavorite(api.id)}
                    className={`p-2 rounded-lg transition-all ${
                      favorites.includes(api.id)
                        ? 'bg-orange-50 text-orange-500' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${favorites.includes(api.id) ? 'fill-current' : ''}`} />
                  </button>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {api.name}
              </h1>
              
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {api.description}
              </p>

              <div className="flex flex-wrap gap-4 mb-6">
                {api.https && (
                  <span className="flex items-center gap-2 text-sm text-green-600">
                    <Shield className="w-4 h-4" />
                    HTTPS
                  </span>
                )}
                {api.cors && (
                  <span className="flex items-center gap-2 text-sm text-blue-600">
                    <Globe className="w-4 h-4" />
                    CORS
                  </span>
                )}
                <span className="flex items-center gap-2 text-sm text-orange-600">
                  <Zap className="w-4 h-4" />
                  {api.authentication_type}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* URL Base */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">URL Base</h2>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-sm overflow-x-auto">
                  {api.base_url}
                </code>
                <button
                  onClick={() => copyToClipboard(api.base_url)}
                  className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            {/* Endpoint */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Endpoint</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm font-medium">
                    {api.method}
                  </span>
                  <code className="flex-1 bg-gray-100 p-3 rounded-lg font-mono text-sm overflow-x-auto">
                    {fullUrl}
                  </code>
                  <button
                    onClick={() => copyToClipboard(fullUrl)}
                    className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Parâmetros */}
            {Object.keys(parameters).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Parâmetros</h2>
                <div className="space-y-2">
                  {Object.entries(parameters).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-gray-200">
                      <code className="text-sm font-medium text-blue-600">{key}</code>
                      <span className="text-sm text-gray-600">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Exemplo de Uso */}
            {api.usage_example && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Exemplo de Uso</h2>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  {api.usage_example}
                </pre>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* APIs Relacionadas */}
            {relatedApis.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card"
              >
                <h3 className="font-semibold text-gray-800 mb-4">APIs Relacionadas</h3>
                <div className="space-y-3">
                  {relatedApis.map((relatedApi) => (
                    <Link
                      key={relatedApi.id}
                      href={`/apis/${generateSlug(relatedApi.name)}`}
                      className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    >
                      <div className="font-medium text-gray-800 group-hover:text-blue-600 mb-1">
                        {relatedApi.name}
                      </div>
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {relatedApi.description}
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Função auxiliar para cores de categoria
function getCategoryColor(category: string) {
  switch (category) {
    case 'Clima': return 'badge-blue'
    case 'Financeiro': return 'badge-green'
    case 'Notícias': return 'badge-purple'
    case 'IA': return 'badge-orange'
    default: return 'badge-blue'
  }
}