// app/page.tsx (Server Component)
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

// Dados podem vir de uma API em produção
async function getStats() {
  // Simulação - em produção, busque de uma API
  return {
    apis: 40,
    categories: 15,
    users: 3
  }
}

async function getFeaturedApis() {
  // Simulação - em produção, busque de uma API
  return [
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
  ]
}

const FEATURES = [
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
]

export default async function Home() {
  const [stats, featuredApis] = await Promise.all([
    getStats(),
    getFeaturedApis()
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-20 md:pt-24">
        {/* Background elements (mantidos iguais) */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}} />
        <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}} />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 mb-8 shadow-sm border border-gray-200">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              Plataforma <span className="text-blue-600 font-semibold">Gratuita</span> para Devs
            </span>
          </div>

          {/* Título Principal */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-gray-900">Domine o Poder</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              das APIs
            </span>
          </h1>
          
          {/* Subtítulo */}
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Descubra e integre APIs gratuitas em uma plataforma 
            <span className="font-semibold text-gray-800"> feita para desenvolvedores de verdade</span>
          </p>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link 
              href="/apis" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2 group"
            >
              <span>Explorar Catálogo</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="/documentacao-oficial-apihub.pdf" 
              className="bg-white text-gray-700 px-8 py-3 rounded-xl font-semibold border border-gray-200 hover:border-gray-300 hover:shadow transition-all inline-flex items-center gap-2 group"
            >
              <Zap className="w-5 h-5" />
              <span>Ver Documentação</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {[
              { value: stats.apis, label: 'APIs Disponíveis', icon: Code2, color: 'blue' },
              { value: stats.categories, label: 'Categorias', icon: Globe, color: 'purple' },
              { value: stats.users, label: 'Desenvolvedores', icon: Users, color: 'green' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center">
                <div className={`w-12 h-12 bg-${stat.color}-50 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}+</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
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
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all hover:scale-105 cursor-pointer group"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-500">
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
            {featuredApis.map((api) => (
              <div
                key={api.name}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all hover:scale-105 cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
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
              className="bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold border border-gray-200 hover:border-gray-300 hover:shadow transition-all inline-flex items-center gap-2"
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