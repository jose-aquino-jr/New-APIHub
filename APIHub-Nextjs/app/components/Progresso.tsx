'use client';

import { useEffect } from 'react';

interface Props {
  slug: string;
  cursoId: string;
  aulaId: string;
  totalAulas: number;
  indiceAtual: number;
}

export default function GerenciadorProgresso({ slug, cursoId, aulaId, totalAulas, indiceAtual }: Props) {
  useEffect(() => {
    // 1. Atualização instantânea no localStorage (offline-first)
    const atualizarLocal = () => {
      const dados = JSON.parse(localStorage.getItem('apihub_progresso') || '{}');
      dados[slug] = aulaId;
      localStorage.setItem('apihub_progresso', JSON.stringify(dados));
    };

    // 2. Sincronização com o servidor via POST /curso-progresso (seção 7.3)
    const sincronizarComServidor = async () => {
      const token = localStorage.getItem('authToken');
      if (!token || !cursoId) return;

      const progresso_percentual = Math.round(((indiceAtual + 1) / totalAulas) * 100);

      try {
        await fetch('https://apihub-br.duckdns.org/curso-progresso', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            curso_id: cursoId,
            status: progresso_percentual >= 100 ? 'concluido' : 'em_andamento',
            progresso_percentual
          })
        });
      } catch (e) {
        console.error('Erro ao sincronizar progresso:', e);
      }
    };

    atualizarLocal();
    sincronizarComServidor();

  }, [slug, aulaId, cursoId, totalAulas, indiceAtual]);

  return null;
}