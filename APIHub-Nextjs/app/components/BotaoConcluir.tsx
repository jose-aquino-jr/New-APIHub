'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface Props {
  cursoId: string;      // slug do curso
  moduloId: string;     // título do módulo
  blocoId: string;      // título do bloco/aula
  proximaAulaUrl: string;
}

export default function BotaoConcluir({ cursoId, moduloId, blocoId, proximaAulaUrl }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log('BotaoConcluir carregado');
  }, []);

  const handleConcluir = async () => {
    console.log('Botão clicado:', { cursoId, moduloId, blocoId });
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('https://apihub-br.duckdns.org/curso-progresso-detalhe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          curso_nome: cursoId,
          modulo_nome: moduloId,
          bloco_nome: blocoId,
          concluido: true
        }),
      });

      const data = await res.json();
      console.log('📦 Resposta do servidor:', data);

      if (res.ok && data.success) {
        console.log('✅ Concluído com sucesso, redirecionando...');
        router.refresh();
        router.push(proximaAulaUrl);
      } else {
        alert(` Erro ao salvar progresso: ${data.message || 'Sem mensagem do servidor'}`);
      }
    } catch (error) {
      console.error(' Erro ao concluir aula:', error);
      alert(' Ocorreu um erro ao salvar. Veja o console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleConcluir}
      disabled={loading}
      className="group flex items-center gap-4 bg-gray-900 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50"
    >
      {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
      {loading ? 'SALVANDO...' : 'CONCLUIR E AVANÇAR'}
    </button>
  );
}
