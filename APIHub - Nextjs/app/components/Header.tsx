'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import Image from 'next/image'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <header className="fixed top-0 w-full z-50 glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Image 
                src="/logo.png" 
                alt="APIHub Logo"
                width={64}
                height={64}
                className="w-16 h-16 object-contain"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              APIHub
            </span>
          </Link>

          {/* Navigation - CENTRALIZADA */}
          <nav className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Início
            </Link>
            <Link href="/apis" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Catálogo
            </Link>
            <Link href="/suporte" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Suporte
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute top-16 right-4 glass rounded-xl p-4 min-w-48 shadow-2xl border border-white/20">
                    <div className="text-sm text-gray-600 mb-2">{user.name}</div>
                    <div className="text-xs text-gray-500 mb-4">{user.email}</div>
                    <Link href="/favoritos" className="block py-2 text-gray-700 hover:text-blue-600">
                      ⭐ Favoritos
                    </Link>
                    <Link href="/configuracoes" className="block py-2 text-gray-700 hover:text-blue-600">
                      ⚙️ Configurações
                    </Link>
                    <button 
                      onClick={logout}
                      className="w-full text-left py-2 text-red-600 hover:text-red-700 mt-2 border-t border-gray-200 pt-3"
                    >
                      🚪 Sair
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link 
                href="/login" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}