'use client';

import React, { useState } from 'react';
import { PlayCircle, Loader2, Code, Globe, ShieldCheck } from 'lucide-react';

// 1. A INTERFACE QUE RESOLVE O SEU ERRO DE TIPAGEM
interface CourseContentProps {
  courseId: string;
}

// Interface para os detalhes técnicos que vêm da sua rota /api/:id
interface ApiDetail {
  id: string;
  name: string;
  endpoint_url?: string;
  method?: string;
  auth_type?: string;
  description: string;
}

export default function CourseContent({ courseId }: CourseContentProps) {
  const [data, setData] = useState<ApiDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  async function fetchApiDetails() {
    setLoading(true);
    try {
      // Chamando sua rota real no backend
      const response = await fetch(`https://apihub-br.duckdns.org/api/${courseId}`);
      if (!response.ok) throw new Error('Falha ao carregar dados');
      
      const result = await response.json();
      setData(result);
      setHasLoaded(true);
    } catch (error) {
      console.error("Erro:", error);
      alert("Não foi possível carregar os detalhes técnicos.");
    } finally {
      setLoading(false);
    }
  }

  // ESTADO INICIAL: Botão para carregar
  if (!hasLoaded) {
    return (
      <div className="text-center py-6">
        <button
          onClick={fetchApiDetails}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
          {loading ? 'Consultando Servidor...' : 'Visualizar Endpoints e Auth'}
        </button>
      </div>
    );
  }

  // ESTADO CARREGADO: Mostra os detalhes técnicos da API
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <Code className="w-6 h-6 text-blue-600" /> Especificações Técnicas
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <Globe className="w-3 h-3" /> Endpoint Base
          </span>
          <p className="mt-1 text-gray-800 font-mono text-sm break-all">
            {data?.endpoint_url || 'https://api.exemplo.com/v1'}
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Autenticação
          </span>
          <p className="mt-1 text-gray-800 font-medium text-sm">
            {data?.auth_type || 'API Key / Bearer Token'}
          </p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-gray-400 uppercase">Exemplo de Resposta (JSON)</span>
          <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded">200 OK</span>
        </div>
        <pre className="text-blue-300 font-mono text-xs overflow-x-auto p-2 leading-relaxed">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}