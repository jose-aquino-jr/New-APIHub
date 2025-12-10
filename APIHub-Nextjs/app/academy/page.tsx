'use client'

import { motion } from 'framer-motion'
import { Clock, Zap, BookOpen, Sparkles, Mail } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

export default function AcademyHome() {
  const { user } = useAuth()

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto"
      >
        {/* Ícone animado */}
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 10, 0],
            scale: [1, 1.1, 1.2, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <BookOpen className="w-16 h-16 text-white" />
            </div>
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, repeatType: "reverse" }
              }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-10 h-10 text-yellow-400" />
            </motion.div>
          </div>
        </motion.div>

        {/* Título "EM BREVE" */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h1 className="text-7xl md:text-8xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            EM BREVE
          </h1>
          
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-6 py-3 rounded-2xl border border-blue-200/50">
            <Clock className="w-6 h-6 text-blue-600 animate-pulse" />
            <span className="text-xl font-semibold text-gray-700">
              Estamos preparando algo incrível!
            </span>
          </div>
        </motion.div>

        {/* Mensagem */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            APIHub Academy está chegando! 🚀
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6">
            Estamos desenvolvendo uma plataforma completa de cursos sobre APIs, 
            com certificados, projetos práticos e muito mais para turbinar sua carreira.
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100 max-w-lg mx-auto">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-center">
                <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">+15</div>
                <div className="text-sm text-gray-600">Cursos</div>
              </div>
              <div className="text-center">
                <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">+10</div>
                <div className="text-sm text-gray-600">Aulas</div>
              </div>
              <div className="text-center">
                <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">Sim</div>
                <div className="text-sm text-gray-600">Certificados</div>
              </div>
            </div>
            <p className="text-gray-700 text-sm">
              Tudo isso para você se tornar um expert em APIs!
            </p>
          </div>
        </motion.div>


        {/* Botão para voltar */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-10"
        >
          <a
            href="/"
            className="inline-flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium px-6 py-3 rounded-xl border border-gray-300 hover:border-blue-400 transition-colors"
          >
            ← Voltar para página inicial
          </a>
        </motion.div>
      </motion.div>
    </div>
  )
}