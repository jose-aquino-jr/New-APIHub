'use client'

import { motion } from 'framer-motion'
import { Mail, MessageCircle, Github, FileText, ArrowRight } from 'lucide-react'

export default function Privacidade() {
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
            Política de <span className="text-gradient">Privacidade</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Como tratamos seus dados e garantimos sua segurança.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-1 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-8 rounded-2xl shadow-md bg-white"
          >
            {/* 1. Coleta de Dados */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">1. Coleta de Dados</h2>
            <p className="text-gray-700 leading-relaxed mb-10">
              Coletamos informações fornecidas pelos usuários ao se cadastrar, utilizar
              nossos serviços ou interagir com nosso site, incluindo nome, e-mail e
              dados de uso da plataforma. Também podemos coletar dados automaticamente
              por meio de cookies e ferramentas de análise.
            </p>

            {/* 2. Uso dos Dados */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">2. Uso dos Dados</h2>
            <ul className="list-disc ml-6 text-gray-700 leading-relaxed mb-10 space-y-2">
              <li>Fornecer e melhorar nossos serviços;</li>
              <li>Personalizar a experiência do usuário;</li>
              <li>Enviar comunicações sobre atualizações, novidades e promoções (somente se autorizado);</li>
              <li>Garantir segurança e prevenção de fraudes.</li>
            </ul>

            {/* 3. Compartilhamento de Dados */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">3. Compartilhamento de Dados</h2>
            <p className="text-gray-700 leading-relaxed mb-10">
              Não vendemos ou compartilhamos informações pessoais com terceiros para fins
              comerciais. Podemos compartilhar dados com parceiros ou prestadores de
              serviços quando necessário para a operação do site, sempre respeitando a
              legislação vigente.
            </p>

            {/* 4. Armazenamento e Segurança */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">4. Armazenamento e Segurança</h2>
            <p className="text-gray-700 leading-relaxed mb-10">
              Os dados são armazenados de forma segura e protegidos contra acesso não
              autorizado. Mantemos medidas técnicas e administrativas para proteger a
              integridade e a confidencialidade das informações.
            </p>

            {/* 5. Direitos do Usuário */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">5. Direitos do Usuário</h2>
            <p className="text-gray-700 leading-relaxed mb-10">
              O usuário pode solicitar acesso, correção ou exclusão de seus dados pessoais,
              bem como revogar consentimentos concedidos, conforme previsto na legislação
              aplicável (como a LGPD).
            </p>

            {/* 6. Alterações na Política */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">6. Alterações na Política</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Podemos atualizar esta política periodicamente. As alterações serão
              comunicadas aos usuários por meio do site ou e-mail, quando necessário.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}