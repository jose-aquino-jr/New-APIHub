'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, Loader2, Github, Chrome } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [socialLoading, setSocialLoading] = useState<'google' | 'github' | null>(null)

  const { login, loginWithGoogle, loginWithGitHub } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Verificar se há erro na URL
  const urlError = searchParams.get('error')

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
      const { error: loginError } = await login(email, password)
      if (loginError) {
        setError(loginError.message)
      } else {
        const redirectTo = searchParams.get('redirect') || '/'
        router.push(redirectTo)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    try {
      setSocialLoading('google')
      setError('')
      loginWithGoogle()
      // A redireção acontece automaticamente dentro da função loginWithGoogle
    } catch (error) {
      console.error('Erro ao iniciar login com Google:', error)
      setError('Erro ao iniciar login com Google')
      setSocialLoading(null)
    }
  }

  const handleGithubLogin = () => {
    try {
      setSocialLoading('github')
      setError('')
      loginWithGitHub()
      // A redireção acontece automaticamente dentro da função loginWithGitHub
    } catch (error) {
      console.error('Erro ao iniciar login com GitHub:', error)
      setError('Erro ao iniciar login com GitHub')
      setSocialLoading(null)
    }
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

        {/* Mensagens de erro */}
        {(error || urlError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm text-center">
              {error || 
                (urlError === 'oauth_failed' && 'Erro na autenticação com OAuth') ||
                (urlError === 'server_error' && 'Erro no servidor') ||
                (urlError === 'no_token' && 'Token não recebido') ||
                (urlError === 'invalid_token' && 'Token inválido') ||
                (urlError === 'session_failed' && 'Falha ao criar sessão') ||
                (urlError === 'no_code' && 'Código de autorização não recebido') ||
                (urlError === 'callback_crash' && 'Erro no processo de callback') ||
                'Erro de autenticação'}
            </p>
          </div>
        )}

        {/* Botões de login social */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={!!socialLoading}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {socialLoading === 'google' ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              ) : (
                <Chrome className="w-5 h-5 text-gray-700" />
              )}
              <span className="text-gray-700">
                {socialLoading === 'google' ? 'Conectando...' : 'Google'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleGithubLogin}
              disabled={!!socialLoading}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {socialLoading === 'github' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Github className="w-5 h-5" />
              )}
              <span>
                {socialLoading === 'github' ? 'Conectando...' : 'GitHub'}
              </span>
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
                disabled={isLoading}
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
                disabled={isLoading}
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
            disabled={isLoading || !!socialLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Entrando...
              </>
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