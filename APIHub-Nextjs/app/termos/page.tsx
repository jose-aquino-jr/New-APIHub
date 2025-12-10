'use client'

import { motion } from 'framer-motion'

export default function TermosDeUso() {
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
            Termos de <span className="text-gradient">Uso</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Leia atentamente antes de utilizar nossos serviços.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-1 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-8 rounded-2xl shadow-md bg-white"
          >
            {/* 1. Aceitação dos Termos */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">1. Aceitação dos Termos</h2>
            <p className="text-gray-700 leading-relaxed mb-10">
              Ao acessar ou utilizar nossos serviços, o usuário concorda com estes Termos de Uso.
              Caso não concorde, deve interromper imediatamente a utilização da plataforma.
            </p>

            {/* 2. Uso Permitido */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">2. Uso Permitido</h2>
            <p className="text-gray-700 leading-relaxed mb-10">
              O usuário se compromete a utilizar nossos serviços de forma legal, ética e responsável,
              não praticando ações que possam prejudicar a plataforma, outros usuários ou terceiros.
            </p>

            {/* 3. Propriedade Intelectual */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">3. Propriedade Intelectual</h2>
            <p className="text-gray-700 leading-relaxed mb-10">
              Todos os conteúdos, marcas, códigos e materiais disponibilizados no site são protegidos
              por direitos autorais e propriedade intelectual. É proibida a reprodução, distribuição
              ou uso comercial sem autorização expressa.
            </p>

            {/* 4. Limitação de Responsabilidade */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">4. Limitação de Responsabilidade</h2>
            <p className="text-gray-700 leading-relaxed mb-10">
              Não nos responsabilizamos por danos diretos ou indiretos decorrentes do uso da plataforma,
              interrupções de serviço ou falhas técnicas.
            </p>

            {/* 5. Suspensão ou Encerramento */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">5. Suspensão ou Encerramento</h2>
            <p className="text-gray-700 leading-relaxed mb-10">
              Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos,
              sem aviso prévio.
            </p>

            {/* 6. Alterações nos Termos */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">6. Alterações nos Termos</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Estes Termos podem ser atualizados periodicamente. As alterações entram em vigor
              imediatamente após a publicação no site.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
