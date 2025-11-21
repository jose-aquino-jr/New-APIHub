'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { 
  Zap, 
  Sparkles, 
  ArrowRight,
  Code2,
  Globe,
  Users,
  CheckCircle2
} from 'lucide-react'

export default function Home() {
  console.log("Test var:", process.env.NEXT_PUBLIC_TEST)
  const [stats, setStats] = useState({ apis: 0, categories: 0, users: 0 })

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({ apis: 127, categories: 15, users: 2843 })
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section - Texto Centralizado */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}} />
        <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}} />

        <div className="relative z-10 text-center max-w-4xl mx-auto"> {/* ✅ max-w-4xl para centralizar melhor */}
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
          
          {/* Subtítulo - CENTRALIZADO */}
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed text-center" // ✅ text-center
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
            
            <button className="btn-secondary group flex items-center gap-3">
              <Zap className="w-5 h-5" />
              <span>Ver Documentação</span>
            </button>
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
      </section>
      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o APIHub?
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Uma plataforma completa para suas integrações de API
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '📚',
                title: 'Catálogo Organizado',
                description: 'APIs categorizadas e fáceis de encontrar',
                features: ['Busca inteligente', 'Filtros por categoria', 'Avaliações da comunidade']
              },
              {
                icon: '⚡', 
                title: 'Implementação Rápida',
                description: 'Documentação clara e exemplos práticos',
                features: ['Exemplos em múltiplas linguagens', 'Sandbox para testes', 'Deploy rápido']
              },
              {
                icon: '🔧',
                title: 'Fácil Integração',
                description: 'Teste e use APIs em minutos',
                features: ['Documentação interativa', 'Suporte da comunidade', 'Zero configuração']
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card hover:scale-105 cursor-pointer group"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* APIs em Destaque */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              APIs Populares
            </h2>
            <p className="text-gray-600">
              Algumas das APIs mais usadas da plataforma
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: 'OpenWeatherMap',
                category: 'Clima',
                description: 'Previsão do tempo para qualquer localização',
              },
              {
                name: 'ExchangeRate-API', 
                category: 'Financeiro',
                description: 'Conversão entre 150+ moedas',
              },
              {
                name: 'NewsAPI',
                category: 'Notícias',
                description: 'Acesso a milhares de fontes de notícias',
              },
              {
                name: 'JSONPlaceholder',
                category: 'Desenvolvimento', 
                description: 'API fake para testes e prototipagem',
              }
            ].map((api, index) => (
              <motion.div
                key={api.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card hover:scale-105 cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="badge badge-blue">
                    {api.category}
                  </span>
                  <span className="text-orange-600 text-sm font-semibold">GRATUITA</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {api.name}
                </h3>
                <p className="text-gray-600 text-sm">{api.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-8"
          >
            <Link 
              href="/apis" 
              className="btn-secondary inline-flex items-center gap-2"
            >
              <span>Ver Todas as APIs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-blue-100 mb-6">
              Junte-se a outros desenvolvedores e acelere seus projetos
            </p>
            <Link 
              href="/apis" 
              className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Explorar APIs</span>
            </Link>
            <p className="text-blue-200 text-sm mt-4">
              Não precisa de cartão de crédito • Totalmente gratuito
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )

}
