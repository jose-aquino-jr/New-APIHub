'use client'

import { Header } from '@/components/Header'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Home, Award, Settings, BarChart, Lock } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user } = useAuth()
  const router = useRouter()

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600 mb-4">
            Você precisa estar logado para acessar a Academy
          </p>
          <Link
            href="/login"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    )
  }

  const navItems = [
    { name: 'Início', href: '/academy', icon: Home },
    { name: 'Cursos', href: '/academy/courses', icon: BookOpen },
    { name: 'Meu Progresso', href: '/academy/dashboard', icon: BarChart },
    { name: 'Certificados', href: '/academy/certificates', icon: Award },
  ]

  // Verifique se é admin (você pode adaptar essa lógica)
  const isAdmin = user.email === 'admin@apihub.com.br' || user.id === 'seu-id-admin'

  return (
    <>
      <Header />
      <div className="pt-32 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Cabeçalho da Academy */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  APIHub Academy
                </h1>
                <p className="text-gray-600">
                  Aprenda APIs na prática com nossos cursos especializados
                </p>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Bem-vindo</div>
                  <div className="font-semibold">{user.name}</div>
                </div>
                {isAdmin && (
                  <Link
                    href="/academy/admin"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg"
                  >
                    <Settings className="w-4 h-4" />
                    Admin
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="md:w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-100'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}