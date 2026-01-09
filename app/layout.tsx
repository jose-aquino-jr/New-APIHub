import './globals.css'
import { Inter } from 'next/font/google'
import { Header } from './components/Header'
import { AuthProvider } from './components/AuthProvider'
import Image from 'next/image'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap'
})

export const metadata = {
  title: {
    default: 'APIHub - Plataforma Gratuita de APIs',
    template: '%s | APIHub'
  },
  description: 'Descubra e integre APIs gratuitas em uma plataforma moderna desenvolvida para desenvolvedores.',
}

function Footer() {
  return (
    <footer className="relative bg-white border-t border-gray-200/60 backdrop-blur-sm">
      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-8">
            
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center">
                  <Image 
                    src="/Logo.png" 
                    alt="APIHub Logo"
                    width={40}
                    height={40}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">APIHub</span>
                  <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full mt-1 inline-block">
                    COMUNIDADE DEV
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 max-w-xs">
                Plataforma gratuita para desenvolvedores descobrirem e integrarem APIs de forma simples.
              </p>
              <div className="flex gap-2">
                {['🚀', '⚡', '🔧'].map((emoji, index) => (
                  <div 
                    key={index} 
                    className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-lg">Navegação</h4>
              <ul className="space-y-3">
                {[
                  { name: 'Início', href: '/' },
                  { name: 'Catálogo', href: '/apis' },
                  { name: 'Documentação', href: '/docs' },
                ].map((item) => (
                  <li key={item.name}>
                    <a 
                      href={item.href}
                      className="text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center gap-2 group"
                    >
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-lg">Categorias</h4>
              <ul className="space-y-3">
                {[
                  '🤖 IA & Machine Learning',
                  '💳 Pagamentos & Financeiro', 
                  '🌤️ Clima & Geografia',
                ].map((category) => (
                  <li key={category}>
                    <a 
                      href={`/apis?category=${category.split(' ')[0]}`}
                      className="text-gray-600 hover:text-blue-600 transition-colors text-sm hover:underline"
                    >
                      {category}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-lg">Contato</h4>
              <div className="space-y-4">
                <div>
                  <a 
                    href="mailto:apihub.contato@gmail.com"
                    className="text-gray-600 hover:text-blue-600 transition-colors text-sm block mb-1"
                  >
                    apihub.contato@gmail.com
                  </a>
                  <p className="text-gray-500 text-xs">Suporte da comunidade</p>
                </div>
                
                <div>
                  <p className="text-gray-600 text-sm mb-1">Status do Sistema</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-600 text-xs font-medium">Todos os sistemas operando</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200/60 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-gray-600 text-sm flex items-center gap-2">
                <span>Feito com</span>
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">♥</span>
                </div>
                <span>para a comunidade dev</span>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-600 flex-wrap justify-center">
                <a href="/privacy" className="hover:text-blue-600 transition-colors">
                  Privacidade
                </a>
                <div className="text-gray-500">© 2025 APIHub</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50" />
          
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
          </div>
          
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl animate-float md:w-96 md:h-96 md:top-1/4 md:left-1/4">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full opacity-60" />
          </div>
          
          <div className="absolute top-40 right-10 w-56 h-56 bg-purple-200/20 rounded-full blur-3xl animate-float md:w-80 md:h-80 md:top-1/3 md:right-1/4" style={{animationDelay: '2s'}}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-60" />
          </div>
          
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-200/20 rounded-full blur-3xl animate-float md:w-64 md:h-64 md:bottom-1/4" style={{animationDelay: '4s'}}>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 to-blue-200 rounded-full opacity-60" />
          </div>
        </div>

        <AuthProvider>
          <Header />
          <main className="relative">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
