'use client'

import { motion } from 'framer-motion'
import { Mail, MessageCircle, Github, FileText, ArrowRight } from 'lucide-react'

export default function Suporte() {
  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="container-custom py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Central de <span className="text-gradient">Suporte</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Estamos aqui para ajudar você com qualquer dúvida ou problema
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Contato */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Entre em Contato</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Email</h3>
                  <p className="text-gray-600">apihub.contato@gmail.com</p>
                  <p className="text-sm text-gray-500">Resposta em até 24h</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Comunidade</h3>
                  <p className="text-gray-600">Em breve</p>
                  <p className="text-sm text-gray-500">Ajuda da comunidade</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Github className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">GitHub</h3>
                  <p className="text-gray-600">Reportar issues</p>
                  <p className="text-sm text-gray-500">Problemas técnicos</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Perguntas Frequentes</h2>
            
            <div className="space-y-4">
              {[
                {
                  question: "Como adicionar uma API ao catálogo?",
                  answer: "Entre em contato conosco com os detalhes da API para revisão."
                },
                {
                  question: "As APIs são realmente gratuitas?",
                  answer: "Sim! Todas as APIs listadas possuem planos gratuitos."
                },
                {
                  question: "Preciso criar conta para usar as APIs?",
                  answer: "Só é necessário para favoritar APIs. O catálogo é aberto."
                },
                {
                  question: "Como reportar um problema com uma API?",
                  answer: "Use a página da API específica ou entre em contato conosco."
                }
              ].map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                  <h3 className="font-semibold text-gray-800 mb-2">{faq.question}</h3>
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Documentação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card text-center"
        >
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Documentação Completa</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Acesse nossa documentação detalhada com guias de integração e exemplos
          </p>
          <a
  href="/documentacao-oficial-apihub.pdf"
  target="_blank"
  rel="noopener noreferrer"
  className="btn-primary inline-flex items-center gap-2"
>
  <span>Ver Documentação</span>
  <ArrowRight className="w-4 h-4" />
</a>

        </motion.div>
      </div>
    </div>
  )

}

