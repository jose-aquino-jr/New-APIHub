// app/academy/layout.tsx (Server Component)
import { getCurrentUser } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/Header'
import Link from 'next/link'
import { BookOpen, Home, Award, BarChart } from 'lucide-react'

export default async function AcademyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login?redirect=/academy')
  }

  const navItems = [
    { name: 'Início', href: '/academy', icon: Home },
    { name: 'Cursos', href: '/academy/courses', icon: BookOpen },
    { name: 'Meu Progresso', href: '/academy/dashboard', icon: BarChart },
    { name: 'Certificados', href: '/academy/certificates', icon: Award },
  ]

  return (
    <>
      <Header />
      <div className="pt-32 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

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