'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Zap, BookOpen, Sparkles, GraduationCap } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import confetti from 'canvas-confetti'

export default function AcademyHome() {
  const { user } = useAuth()

  useEffect(() => {
    const duration = 7 * 1000; 
    const animationEnd = Date.now() + duration;
    
    const defaults = { 
      startVelocity: 35, 
      spread: 360, 
      ticks: 80, 
      zIndex: 0,
      scalar: 1.1 
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 75 * (timeLeft / duration);
      const brandColors = ['#2563eb', '#9333ea', '#db2777', '#facc15'];

      confetti({ 
        ...defaults, 
        particleCount, 
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: brandColors 
      });
      confetti({ 
        ...defaults, 
        particleCount, 
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: brandColors
      });
    }, 300); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto"
      >
        
        {/* Ícone com Animação de Flutuação e Rotação */}
        <div className="mb-8">
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="relative inline-block"
          >
            <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <BookOpen className="w-16 h-16 text-white" />
            </div>
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-10 h-10 text-yellow-400" />
            </motion.div>
          </motion.div>
        </div>

        {/* Título com Surgimento Gradual */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 leading-tight">
            O ACADEMY CHEGOU!!!
          </h1>
          
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-6 py-3 rounded-2xl border border-blue-200/50">
            <GraduationCap className="w-6 h-6 text-blue-600 animate-pulse" />
            <span className="text-xl font-semibold text-gray-700">
              Já está pronta nossa nova plataforma de cursos sobre APIs!
            </span>
          </div>
        </motion.div>

        {/* Mensagem e Cards de Status */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            APIHub Academy está no ar! 🚀
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6">
            Explore nossa plataforma completa de cursos sobre APIs, 
            com certificados, projetos práticos e suporte exclusivo.
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100 max-w-lg mx-auto shadow-sm">
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
            <p className="text-gray-700 text-sm italic">
              Tudo o que você precisa para dominar o mercado de APIs!
            </p>
          </div>
        </motion.div>

        {/* Botão de Voltar com Hover Animado */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10"
        >
          <motion.a
            whileHover={{ x: -5 }}
            href="/academy/courses"
            className="inline-flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium px-6 py-3 rounded-xl border border-gray-300 hover:border-blue-400 transition-colors shadow-sm bg-white"
          >
            Venha conhecer nossos cursos →
          </motion.a>
        </motion.div>
      </motion.div>
    </div>
  )
}