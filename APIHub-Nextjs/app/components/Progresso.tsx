'use client';

import { useEffect } from 'react';

interface Props {
  slug: string;
  cursoId: string; // Adicionado para bater com a Doc 7.2
  aulaId: string;
}

export default function GerenciadorProgresso({ slug, cursoId, aulaId }: Props) {
  useEffect(() => {
    // 1. Atualização Instantânea no LocalStorage (Offline-first)
    const atualizarLocal = () => {
      const progressoLocal = localStorage.getItem('apihub_progresso');
      const dados = progressoLocal ? JSON.parse(progressoLocal) : {};
      dados[slug] = aulaId;
      localStorage.setItem('apihub_progresso', JSON.stringify(dados));
    };

    // 2. Sincronização com o Servidor (Opcional, mas recomendado pela Doc)
    const sincronizarComServidor = async () => {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token || !cursoId) return;

      try {
        // Endpoint sugerido para "Último Acesso" (Ver pág 27 da Doc)
        await fetch('https://apihub-br.duckdns.org/curso-progresso/checkpoint', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            curso_id: cursoId,
            ultima_aula_id: aulaId
          })
        });
      } catch (e) {
        console.error("Erro silencioso ao sincronizar checkpoint:", e);
      }
    };

    atualizarLocal();
    
    // Opcional: Só sincroniza com servidor se o token existir
    sincronizarComServidor();

  }, [slug, aulaId, cursoId]);

  return null;
}