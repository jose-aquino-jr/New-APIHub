// app/recuperar-senha/page.tsx
'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'

export default function RecuperarSenha() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    if (!email) {
      setError('Digite seu email')
      setIsLoading(false)
      return
    }

    try {
      // Simulação - Em produção, conecte com seu backend
      console.log('Solicitando recuperação para:', email)
      
      // Aguardar um pouco para simular requisição
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setSuccess('Se o email existir, enviaremos instruções para redefinir sua senha!')
      setEmail('')
      
      // Redirecionar após alguns segundos
      setTimeout(() => {
        router.push('/login')
      }, 3000)
      
    } catch (err: any) {
      setError('Erro ao processar solicitação. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100"
      >
        {/* Botão voltar */}
        <Link 
          href="/login" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para login
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Recuperar <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Senha</span>
          </h1>
          <p className="text-gray-600">
            Digite seu email para receber instruções de recuperação
          </p>
        </div>

        {/* Mensagens */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-600 text-sm text-center">{success}</p>
            <p className="text-green-500 text-xs text-center mt-2">Redirecionando para login...</p>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email cadastrado *
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
                disabled={isLoading || !!success}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Enviaremos um link para redefinir sua senha
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !!success}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Enviando...
              </div>
            ) : (
              'Enviar instruções'
            )}
          </button>
        </form>

        {/* Lembrete */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-600 text-center text-sm">
            Lembrou sua senha?{' '}
            <Link 
              href="/login" 
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}