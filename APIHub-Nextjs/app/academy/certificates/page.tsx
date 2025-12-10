'use client'

import { motion } from 'framer-motion'
import { Download, Share2, Eye, Printer, FileText } from 'lucide-react'

const certificates = [
  {
    id: 'CERT-2024-001',
    courseName: 'Introdução às APIs REST',
    issueDate: '2024-01-20',
    expirationDate: null,
    grade: '98%',
    downloadUrl: '/certificates/api-rest-cert.pdf',
    shareUrl: '#'
  }
  // Adicione mais certificados
]

export default function CertificatesPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Meus Certificados</h2>
        <p className="text-gray-600">
          Baixe e compartilhe suas conquistas de aprendizado
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Nenhum certificado ainda
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Complete seus primeiros cursos para ganhar certificados que comprovam seu conhecimento em APIs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-100 rounded-2xl p-6 hover:border-blue-300 transition-colors"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{cert.courseName}</h3>
                <div className="text-sm text-gray-600">Certificado de Conclusão</div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Código:</span>
                  <span className="font-mono font-semibold">{cert.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Emitido em:</span>
                  <span className="font-medium">{new Date(cert.issueDate).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nota:</span>
                  <span className="font-bold text-green-600">{cert.grade}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <a
                  href={cert.downloadUrl}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-xl text-center font-medium hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Baixar PDF
                </a>
                <button className="p-2 border border-gray-300 rounded-xl hover:bg-white">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}