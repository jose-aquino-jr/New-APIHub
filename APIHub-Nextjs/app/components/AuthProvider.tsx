// components/Header.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import Image from 'next/image'
import { Menu, X, Star, Settings, LogOut, User } from 'lucide-react'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, logout, isLoading } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      setIsUserMenuOpen(false)
      setIsMenuOpen(false)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  // Fechar menus quando clicar fora
  useEffect(() => {
    const handleClickOutside = () => {
      setIsUserMenuOpen(false)
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Image 
                src="/Logo.png" 
                alt="APIHub Logo"
                width={64}
                height={64}
                className="w-10 h-10 md:w-16 md:h-16 object-contain"
              />
            </div>
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              APIHub
            </span>
          </Link>

          {/* Navigation - Desktop */}
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

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Auth Section - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : user ? (
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsUserMenuOpen(!isUserMenuOpen)
                  }}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute top-12 right-0 bg-white rounded-xl p-4 min-w-48 shadow-lg border border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">{user.name}</div>
                    <div className="text-xs text-gray-500 mb-4">{user.email}</div>
                    
                    <Link 
                      href="/favoritos" 
                      className="flex items-center gap-2 py-2 text-gray-700 hover:text-blue-600"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Star className="w-4 h-4" />
                      Favoritos
                    </Link>
                    
                    <Link 
                      href="/configuracoes" 
                      className="flex items-center gap-2 py-2 text-gray-700 hover:text-blue-600"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Configurações
                    </Link>
                    
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left py-2 text-red-600 hover:text-red-700 mt-2 border-t border-gray-200 pt-3"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/login" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 md:px-6 md:py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm md:text-base"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              <Link 
                href="/apis" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Catálogo
              </Link>
              <Link 
                href="/suporte" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Suporte
              </Link>
              
              {/* Mobile Auth */}
              {!user ? (
                <Link 
                  href="/login" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Entrar
                </Link>
              ) : (
                <div className="border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-600 mb-2">{user.name}</div>
                  <div className="text-xs text-gray-500 mb-4">{user.email}</div>
                  
                  <Link 
                    href="/favoritos" 
                    className="flex items-center gap-2 py-2 text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Star className="w-4 h-4" />
                    Favoritos
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left py-2 text-red-600 hover:text-red-700 mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
