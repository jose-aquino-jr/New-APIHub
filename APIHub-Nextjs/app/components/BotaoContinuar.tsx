'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Loader2 } from 'lucide-react';

interface Props {
  slug: string;
  cursoId: string;
  primeiraAulaId: string;
}

export default function BotaoContinuar({ slug, cursoId, primeiraAulaId }: Props) {
  const [aulaDestino, setAulaDestino] = useState(primeiraAulaId);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function sincronizarProgresso() {
      // 1. Resposta instantânea via localStorage (offline-first)
      const local = localStorage.getItem('apihub_progresso');
      if (local) {
        try {
          const dados = JSON.parse(local);
          if (dados[slug]) setAulaDestino(dados[slug]);
        } catch (e) {
          console.error('Erro no parse do progresso local', e);
        }
      }

      // 2. Sincroniza com o servidor — GET /curso-progresso/{id} (seção 7.2)
      const token = localStorage.getItem('authToken');
      if (token && cursoId) {
        try {
          const res = await fetch(`https://apihub-br.duckdns.org/curso-progresso/${cursoId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();

          if (data.success && data.data?.ultima_aula_id) {
            setAulaDestino(data.data.ultima_aula_id);

            // Mantém localStorage em sincronia com o servidor
            const novoProgresso = local ? JSON.parse(local) : {};
            novoProgresso[slug] = data.data.ultima_aula_id;
            localStorage.setItem('apihub_progresso', JSON.stringify(novoProgresso));
          }
        } catch (error) {
          console.error('Erro ao sincronizar com servidor:', error);
        }
      }

      setCarregando(false);
    }

    sincronizarProgresso();
  }, [slug, cursoId, primeiraAulaId]);

  if (carregando) return (
    <div className="h-[56px] w-full bg-gray-50 flex items-center justify-center rounded-2xl border border-gray-100">
      <Loader2 className="animate-spin text-blue-500" size={20} />
    </div>
  );

  return (
    <Link
      href={`/academy/courses/${slug}/aula/${aulaDestino}`}
      className="group w-full bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 active:scale-95 uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3"
    >
      <Play size={14} className="fill-current group-hover:scale-110 transition-transform" />
      {aulaDestino === primeiraAulaId ? 'Iniciar Jornada' : 'Continuar de onde parou'}
    </Link>
  );
}