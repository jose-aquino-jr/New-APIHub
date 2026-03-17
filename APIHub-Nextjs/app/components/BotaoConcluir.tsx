'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface Props {
  cursoId: string;
  moduloId: string;
  blocoId: string;
  proximaAulaUrl: string;
}

export default function BotaoConcluir({ cursoId, moduloId, blocoId, proximaAulaUrl }: Props) {
  const [loading, setLoading] = useState(false);

  const handleConcluir = async () => {
    console.log('🚀 Iniciando conclusão da aula:', { cursoId, moduloId, blocoId });
    setLoading(true);

    const token = localStorage.getItem('authToken') ||
      document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    if (!token) {
      alert('Sessão não encontrada. Por favor, faça login novamente.');
      setLoading(false);
      return;
    }

    try {
      // Endpoint correto: POST /curso-progresso-detalhe (seção 7.4)
      const res = await fetch('https://apihub-br.duckdns.org/curso-progresso/detalhe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          curso_id: cursoId,
          modulo_id: moduloId,
          bloco_id: blocoId,
          progresso_percentual: 100
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        console.log('✅ Progresso salvo com sucesso!');

        // Atualiza localStorage
        const progressoLocal = JSON.parse(localStorage.getItem('apihub_progresso') || '{}');
        const urlParts = window.location.pathname.split('/');
        const slug = urlParts[3];
        const proximaAulaId = proximaAulaUrl.split('/').pop();

        if (slug && proximaAulaId) {
          progressoLocal[slug] = proximaAulaId;
          localStorage.setItem('apihub_progresso', JSON.stringify(progressoLocal));
        }

        console.log('➔ Redirecionando para:', proximaAulaUrl);
        window.location.href = proximaAulaUrl;

      } else {
        console.error('❌ Erro retornado pela API:', data);
        alert(`Erro: ${data.message || 'Não foi possível salvar o progresso.'}`);
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Erro na comunicação com o servidor:', error);
      alert('Erro de conexão. Verifique se o servidor está online.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleConcluir}
      disabled={loading}
      className="group flex items-center gap-4 bg-blue-600 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all disabled:opacity-70 active:scale-95 shadow-xl shadow-blue-100"
    >
      {loading ? (
        <Loader2 className="animate-spin" size={20} />
      ) : (
        <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
      )}
      {loading ? 'SALVANDO...' : 'CONCLUIR E PRÓXIMA AULA'}
    </button>
  );
}