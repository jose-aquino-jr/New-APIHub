// app/page.tsx - SSR
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Zap, 
  Sparkles, 
  ArrowRight,
  Code2,
  Globe,
  Users,
  CheckCircle2
} from 'lucide-react'

// Componente cliente para animações
import { ClientHero } from '@/components/ClientHero'

// Dados estáticos (podem vir de API em produção)
const STATS = {
  apis: 40,
  categories: 15,
  users: 1
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section - Texto Centralizado */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-20 md:pt-24">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}} />
        <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}} />

        <ClientHero stats={STATS} />
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o APIHub?
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Uma plataforma completa para suas integrações de API
            </p>
          </div>

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
              <div
                key={feature.title}
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APIs em Destaque */}
      <section className="py-16 px-4 bg-gray-50 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              APIs Populares
            </h2>
            <p className="text-gray-600">
              Algumas das APIs mais usadas da plataforma
            </p>
          </div>

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
              <div
                key={api.name}
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
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link 
              href="/apis" 
              className="btn-secondary inline-flex items-center gap-2"
            >
              <span>Ver Todas as APIs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white mt-16">
        <div className="max-w-2xl mx-auto text-center">
          <div>
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
          </div>
        </div>
      </section>
    </div>
  )
}