
'use client'

import { Trophy, Medal, Star, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'

type APIItem = {
  id: string
  name: string
  tag: string
  rating: number
  votes: number
}

const rankingData: APIItem[] = [
  {
    id: '1',
    name: 'OpenWeather API',
    tag: 'Clima',
    rating: 4.9,
    votes: 120
  },
  {
    id: '2',
    name: 'Stripe API',
    tag: 'Pagamentos',
    rating: 4.8,
    votes: 98
  },
  {
    id: '3',
    name: 'Spotify API',
    tag: 'Música',
    rating: 4.7,
    votes: 87
  },
  {
    id: '4',
    name: 'GitHub API',
    tag: 'Dev',
    rating: 4.6,
    votes: 150
  }
]

export default function RankingPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="container-custom px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 bg-yellow-100 rounded-2xl mb-4">
            <Trophy className="text-yellow-600 w-8 h-8" />
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900">
            Ranking da Comunidade
          </h1>

          <p className="text-gray-600 mt-2 text-lg">
            As APIs mais bem avaliadas pela comunidade
          </p>
        </motion.div>

        {/* Lista */}
        <div className="max-w-4xl mx-auto space-y-4">
          {rankingData.map((api, index) => (
            <motion.div
              key={api.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border flex items-center gap-4 hover:shadow-md"
            >

              {/* Posição */}
              <div className="w-12 h-12 flex items-center justify-center font-bold text-xl">
                {index === 0 ? (
                  <Medal className="text-yellow-500 w-8 h-8" />
                ) : index === 1 ? (
                  <Medal className="text-gray-400 w-8 h-8" />
                ) : index === 2 ? (
                  <Medal className="text-amber-600 w-8 h-8" />
                ) : (
                  <span className="text-gray-400">#{index + 1}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-gray-900 text-lg">
                    {api.name}
                  </h2>

                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                    {api.tag}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="ml-1 text-sm font-bold text-gray-700">
                      {api.rating.toFixed(1)}
                    </span>
                  </div>

                  <span className="text-xs text-gray-400">
                    {api.votes} votos
                  </span>
                </div>
              </div>

              {/* Ação */}
              <button
                aria-label={`Ver mais sobre ${api.name}`}
                className="p-2 hover:bg-orange-50 text-orange-500 rounded-full"
              >
                <ArrowUpRight className="w-6 h-6" />
              </button>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  )
}