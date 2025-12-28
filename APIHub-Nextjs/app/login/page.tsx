'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isOAuthLoading, setIsOAuthLoading] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

  // Ouvir mensagens do popup OAuth
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('Mensagem recebida no login page:', event.data)
      
      // Verificar origem (aceitar backend também)
      const allowedOrigins = [
        'https://apihub-br.duckdns.org',
        'http://localhost:8000',
        'http://localhost:3000'
      ]
      
      if (!allowedOrigins.includes(event.origin)) {
        console.log('Origem não permitida:', event.origin)
        return
      }
      
      if (event.data.type === 'oauth-success') {
        console.log('Login OAuth bem-sucedido!', event.data.user)
        setIsOAuthLoading(false)
        
        // Salvar dados do usuário
        localStorage.setItem('apihub_user', JSON.stringify(event.data.user))
        localStorage.setItem('authToken', event.data.user.access_token)
        localStorage.setItem('refreshToken', event.data.user.refresh_token)
        
        // Recarregar a página para o AuthProvider capturar
        window.location.href = '/'
      }
      
      if (event.data.type === 'oauth-error') {
        console.error('Erro no OAuth:', event.data.error)
        setIsOAuthLoading(false)
        setError('Falha na autenticação com Google/GitHub')
      }
    }
    
    window.addEventListener('message', handleMessage)
    
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!email || !password) {
      setError('Preencha todos os campos')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await login(email, password)
      if (error) {
        setError(error.message)
      } else {
        router.push('/')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsOAuthLoading(true)
      setError('')
      
      // Abrir em popup
      const width = 600
      const height = 700
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2
      
      console.log('Abrindo popup para Google OAuth...')
      
      window.open(
        'https://apihub-br.duckdns.org/auth/google',
        'oauth-popup',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      )
      
      // Verificar se popup foi bloqueado
      setTimeout(() => {
        if (isOAuthLoading) {
          const popup = window.open('', 'oauth-popup')
          if (!popup || popup.closed || typeof popup.closed === 'undefined') {
            setError('Popup bloqueado! Por favor, permita popups para este site.')
            setIsOAuthLoading(false)
          }
        }
      }, 1000)
      
    } catch (error) {
      console.error('Erro Google:', error)
      setIsOAuthLoading(false)
      setError('Erro ao iniciar login com Google')
    }
  }

  const handleGithubLogin = async () => {
    try {
      setIsOAuthLoading(true)
      setError('')
      
      // Abrir em popup
      const width = 600
      const height = 700
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2
      
      console.log('🔗 Abrindo popup para GitHub OAuth...')
      
      window.open(
        'https://apihub-br.duckdns.org/auth/github',
        'oauth-popup',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      )
      
      // Verificar se popup foi bloqueado
      setTimeout(() => {
        if (isOAuthLoading) {
          const popup = window.open('', 'oauth-popup')
          if (!popup || popup.closed || typeof popup.closed === 'undefined') {
            setError('Popup bloqueado! Por favor, permita popups para este site.')
            setIsOAuthLoading(false)
          }
        }
      }, 1000)
      
    } catch (error) {
      console.error('Erro GitHub:', error)
      setIsOAuthLoading(false)
      setError('Erro ao iniciar login com GitHub')
    }
  }

  // Função para abrir na mesma aba (fallback)
  const handleGoogleDirect = () => {
    window.location.href = 'https://apihub-br.duckdns.org/auth/google'
  }

  const handleGithubDirect = () => {
    window.location.href = 'https://apihub-br.duckdns.org/auth/github'
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Entrar no <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">APIHub</span>
          </h1>
          <p className="text-gray-600">Acesse sua conta para continuar</p>
        </div>

        {/* Loading overlay para OAuth */}
        {isOAuthLoading && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-8 max-w-sm w-full mx-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-center text-gray-700 font-medium">Aguardando autenticação...</p>
              <p className="text-center text-gray-500 text-sm mt-2">
                Complete o login na janela popup
              </p>
              <button
                onClick={() => setIsOAuthLoading(false)}
                className="mt-6 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Mensagens de erro */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm text-center">{error}</p>
            {error.includes('popup') && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Tente uma das opções:</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleGoogleDirect}
                    className="flex-1 text-sm py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    Google (mesma aba)
                  </button>
                  <button
                    onClick={handleGithubDirect}
                    className="flex-1 text-sm py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    GitHub (mesma aba)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botões de login social */}
        <div className="mb-6">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isOAuthLoading || isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Ícone Google inline */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700">Google</span>
            </button>

            <button
              type="button"
              onClick={handleGithubLogin}
              disabled={isOAuthLoading || isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Ícone GitHub inline */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              <span className="text-gray-700">GitHub</span>
            </button>
          </div>

          {/* Divisor */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou com email</span>
            </div>
          </div>
        </div>

        {/* Formulário de login */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="seu@email.com"
                required
                disabled={isLoading || isOAuthLoading}
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Senha *
              </label>
              <Link 
                href="/recuperar-senha" 
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Sua senha"
                required
                disabled={isLoading || isOAuthLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Botão de Login */}
          <button
            type="submit"
            disabled={isLoading || isOAuthLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Entrando...
              </div>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Link para cadastro */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-600 text-center text-sm">
            Não tem uma conta?{' '}
            <Link 
              href="/cadastro" 
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
