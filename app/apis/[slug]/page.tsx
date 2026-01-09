'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Star,
  Shield,
  Globe,
  Zap,
  Flag,
  Share2,
  Copy,
  Check,
  FileText,
  Download,
} from 'lucide-react'
import {
  getCategoryFromTags,
  parseParameters,
  getApiBySlug,
  generateSlug,
  getRelatedApis,
} from '@/lib/utils'
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
  const { user } = useAuth()

  const [showReportMenu, setShowReportMenu] = useState(false)
  const [showRateMenu, setShowRateMenu] = useState(false)

  useEffect(() => {
    loadAPI()
  }, [params.slug])

  const loadAPI = async () => {
    try {
      const foundApi = await getApiBySlug(params.slug)
      if (!foundApi) notFound()

      setApi(foundApi)

      const related = await getRelatedApis(foundApi, 4)
      setRelatedApis(related)
    } catch {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const fullUrl = `${api.base_url}${api.endpoint_path || ''}`
  const parameters = api.parameters ? parseParameters(api.parameters) : {}

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="container-custom py-6 px-4">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-8"
        >
          <div className="flex flex-col gap-4">

            {/* LINHA SUPERIOR */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`badge ${getCategoryColor(getCategoryFromTags(api.tags))}`}>
                  {getCategoryFromTags(api.tags)}
                </span>
                <span className="text-orange-600 font-semibold">GRATUITA</span>
              </div>

              {/* AÇÕES */}
              <div className="flex items-center gap-3 relative">
                {/* DENUNCIAR */}
                <button
                  onClick={() => {
                    setShowReportMenu(!showReportMenu)
                    setShowRateMenu(false)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-lg"
                >
                  <Flag size={16} />
                  Denunciar
                </button>

                {showReportMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute right-0 top-full mt-3 w-64 bg-white border rounded-2xl shadow-2xl z-50"
                  >
                    {[
                      '⚠️ API Inútil / Fora do ar',
                      '🚫 Conteúdo Ofensivo',
                      '❌ Dados Falsos',
                      '🛡️ Violação de Termos',
                      '📝 Outros',
                    ].map((label) => (
                      <button
                        key={label}
                        onClick={() => {
                          alert(`Denúncia enviada: ${label}`)
                          setShowReportMenu(false)
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-red-50 text-sm font-semibold"
                      >
                        {label}
                      </button>
                    ))}
                  </motion.div>
                )}

                {/* AVALIAR */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowRateMenu(!showRateMenu)
                      setShowReportMenu(false)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-xl font-bold text-sm shadow-lg"
                  >
                    <Star size={16} className="fill-amber-950" />
                    Avaliar
                  </button>

                  {showRateMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="absolute right-0 top-full mt-3 w-48 bg-white border rounded-2xl shadow-2xl z-50"
                    >
                      {[5, 4, 3, 2, 1].map((star) => (
                        <button
                          key={star}
                          onClick={() => {
                            alert(`Avaliação: ${star} estrelas`)
                            setShowRateMenu(false)
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-amber-50 flex gap-1"
                        >
                          {[...Array(star)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className="fill-amber-400 text-amber-400"
                            />
                          ))}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* COMPARTILHAR */}
                <button
                aria-label ="Compartilhar API"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    alert('Link copiado!')
                  }}
                  className="p-2.5 bg-white border rounded-xl hover:bg-gray-50 shadow-sm"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* TÍTULO + ESTRELAS */}
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{api.name}</h1>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="ml-1 text-sm font-semibold text-yellow-600">
                  5.0
                </span>
              </div>
            </div>

            <p className="text-gray-600 text-lg">{api.description}</p>

            {/* INFO */}
            <div className="flex gap-4 text-sm">
              {api.https && (
                <span className="flex items-center gap-1 text-green-600">
                  <Shield size={14} /> HTTPS
                </span>
              )}
              {api.cors && (
                <span className="flex items-center gap-1 text-blue-600">
                  <Globe size={14} /> CORS
                </span>
              )}
              <span className="flex items-center gap-1 text-orange-600">
                <Zap size={14} /> {api.authentication_type}
              </span>
            </div>
          </div>
        </motion.div>

        {/* RANKING */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Posição no Ranking
              </h2>
              <p className="text-sm text-gray-600">
                Classificação baseada em avaliações e popularidade
              </p>
            </div>

            <div className="text-right">
              <span className="text-3xl font-bold text-blue-600">
                #{api.ranking_position ?? 3}
              </span>
              <p className="text-sm text-gray-500">
                de {api.total_ranked ?? 128} APIs
              </p>
            </div>
          </div>
        </motion.div>

        {/* CONTEÚDO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* URL BASE */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-3">URL Base</h2>
              <div className="flex gap-2">
                <code className="flex-1 bg-gray-900 text-white p-3 rounded-lg text-sm">
                  {api.base_url}
                </code>
                <button
                  onClick={() => copyToClipboard(api.base_url)}
                  className="p-3 bg-gray-700 text-white rounded-lg"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* ENDPOINT */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-3">Endpoint</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded">
                  {api.method}
                </span>
                <code className="flex-1 bg-gray-100 p-3 rounded-lg text-sm">
                  {fullUrl}
                </code>
                <button
                  onClick={() => copyToClipboard(fullUrl)}
                  className="p-3 bg-gray-200 rounded-lg"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* PARÂMETROS */}
            {Object.keys(parameters).length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold mb-3">Parâmetros</h2>
                {Object.entries(parameters).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between py-2 border-b"
                  >
                    <code className="text-blue-600">{key}</code>
                    <span className="text-gray-600">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            {relatedApis.length > 0 && (
              <div className="card">
                <h3 className="font-semibold mb-3">APIs Relacionadas</h3>
                {relatedApis.map((r) => (
                  <Link
                    key={r.id}
                    href={`/apis/${generateSlug(r.name)}`}
                    className="block p-3 border rounded-lg hover:bg-blue-50"
                  >
                    <div className="font-medium">{r.name}</div>
                    <div className="text-sm text-gray-600">
                      {r.description}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* Cores de categoria */
function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    Palavras: 'badge-blue',
    IA: 'badge-purple',
    Financeiro: 'badge-green',
    default: 'badge-blue',
  }
  return colors[category] || colors.default
}