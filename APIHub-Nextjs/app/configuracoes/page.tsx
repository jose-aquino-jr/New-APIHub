'use client'

import { motion } from 'framer-motion'
import { Bell, Shield, Globe, Moon, Mail } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

export default function Configuracoes() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600">Faça login para acessar as configurações</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="container-custom py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-gradient">Configurações</span>
          </h1>
          <p className="text-gray-600">Gerencie suas preferências na plataforma</p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* Perfil */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card mb-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Perfil</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  defaultValue={user.name}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={user.email}
                  className="input"
                  disabled
                />
              </div>
              <button className="btn-primary">
                Salvar Alterações
              </button>
            </div>
          </motion.div>

          {/* Preferências */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card mb-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Preferências</h2>
            <div className="space-y-4">
              {[
                {
                  icon: Bell,
                  title: "Notificações",
                  description: "Receber atualizações de APIs favoritas"
                },
                {
                  icon: Mail,
                  title: "Newsletter", 
                  description: "Receber novidades por email"
                },
              ].map((item, index) => (
                <div key={item.title} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{item.title}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Privacidade */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Privacidade e Segurança</h2>
                <p className="text-gray-600 text-sm">Gerencie seus dados e segurança</p>
              </div>
            </div>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all">
                <div className="font-medium text-gray-800">Exportar dados</div>
                <div className="text-sm text-gray-600">Baixe uma cópia dos seus dados</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all text-red-600">
                <div className="font-medium">Excluir conta</div>
                <div className="text-sm">Remover permanentemente sua conta</div>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}