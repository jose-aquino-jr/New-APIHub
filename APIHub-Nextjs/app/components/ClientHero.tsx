'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Zap, Sparkles, ArrowRight, Code2, Globe, Users } from 'lucide-react'

interface ClientHeroProps {
  stats: {
    apis: number
    categories: number
    users: number
  }
}

export function ClientHero({ stats }: ClientHeroProps) {
  return (
    <div className="relative z-10 text-center max-w-4xl mx-auto">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 mb-8 shadow-sm border border-gray-200"
      >
        <Sparkles className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">
          Plataforma <span className="text-blue-600 font-semibold">Gratuita</span> para Devs
        </span>
      </motion.div>

      {/* Título Principal */}
      <motion.h1 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-6xl font-bold mb-6"
      >
        <span className="text-gray-900">Domine o Poder</span>
        <br />
        <span className="text-gradient">das APIs</span>
      </motion.h1>
      
      {/* Subtítulo */}
      <motion.p 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed text-center"
      >
        Descubra e integre APIs gratuitas em uma plataforma 
        <span className="font-semibold text-gray-800"> feita para desenvolvedores de verdade</span>
      </motion.p>

      {/* Botões */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
      >
        <Link 
          href="/apis" 
          className="btn-primary group flex items-center gap-3"
        >
          <span>Explorar Catálogo</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        
        <Link href="/documentacao-oficial-apihub.pdf" className="btn-secondary group flex items-center gap-3">
          <Zap className="w-5 h-5" />
          <span>Ver Documentação</span>
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto"
      >
        {[
          { value: stats.apis, label: 'APIs Disponíveis', icon: Code2, color: 'blue' },
          { value: stats.categories, label: 'Categorias', icon: Globe, color: 'purple' },
          { value: stats.users, label: 'Desenvolvedores', icon: Users, color: 'green' },
        ].map((stat, index) => (
          <div key={stat.label} className="card text-center">
            <div className={`w-12 h-12 bg-${stat.color}-50 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}+</div>
            <div className="text-gray-600 text-sm">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}