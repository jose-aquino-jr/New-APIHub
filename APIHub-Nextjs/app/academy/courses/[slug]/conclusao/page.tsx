'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Home, BookOpen, Mail, ArrowRight, CheckCircle, Check } from 'lucide-react';

export default function ConclusaoPage({ params }: { params: any }) {
  const [course, setCourse] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      // No Next.js 15, params deve ser aguardado
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
      
      try {
        // Busca o curso pelo slug para pegar o ID (Pág 19 da doc)
        const resSlug = await fetch(`https://apihub-br.duckdns.org/cursos/slug/${resolvedParams.slug}`);
        const slugData = await resSlug.json();
        
        if (slugData.success && slugData.data?.id) {
          // Busca os detalhes completos incluindo módulos (Pág 20 da doc)
          const resFull = await fetch(`https://apihub-br.duckdns.org/cursos/${slugData.data.id}/details`);
          const fullData = await resFull.json();
          
          if (fullData.success) {
            setCourse(fullData.data);
          }
        }
      } catch (e) {
        console.error("Erro ao carregar dados de conclusão", e);
      }
    }
    loadData();
  }, [params]);

  const handleCopyEmail = async () => {
    const email = "apihub.contato@gmail.com"; 
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Cálculo robusto de total de aulas (blocos)
  const modulos = course?.modulos || course?.curso_modulos || [];
  const totalAulas = modulos.reduce((acc: number, mod: any) => {
    const blocos = mod.blocos || mod.curso_blocos || [];
    return acc + (Array.isArray(blocos) ? blocos.length : 0);
  }, 0);

  if (!course) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin mb-4" />
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">
        Gerando sua conquista...
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      
      {/* Background Decorativo - Gradientes Suaves */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-50 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl text-center">
        
        {/* ÍCONE DE TROFÉU COM EFEITO DE BRILHO */}
        <div className="mb-10 relative inline-block">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse" />
          <div className="relative bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
            <Trophy size={64} className="text-yellow-400" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-3 rounded-2xl border-4 border-white shadow-xl">
            <Check size={24} className="text-white font-bold" />
          </div>
        </div>

        {/* TEXTOS PRINCIPAIS */}
        <div className="space-y-6 mb-12">
          <div className="inline-block px-4 py-1.5 bg-blue-50 rounded-full">
             <p className="text-blue-600 font-black uppercase tracking-[0.3em] text-[9px]">
               Certificado Disponível
             </p>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight tracking-tighter">
            Missão <br /> 
            <span className="text-blue-600">Cumprida!</span>
          </h1>
          <p className="text-gray-500 text-xl max-w-md mx-auto leading-relaxed font-medium">
            Você finalizou o treinamento <strong>{course.titulo || course.name}</strong> com sucesso.
          </p>
        </div>

        {/* CARD DE ESTATÍSTICAS */}
        <div className="bg-white rounded-[2.5rem] p-10 mb-12 border border-gray-100 grid grid-cols-2 gap-8 max-w-sm mx-auto shadow-xl shadow-blue-500/5">
          <div className="text-center">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Aulas</p>
            <p className="text-gray-900 font-black text-3xl tracking-tighter">{totalAulas}</p>
          </div>
          <div className="text-center border-l border-gray-100">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Status</p>
            <p className="text-emerald-500 font-black text-xs uppercase tracking-widest bg-emerald-50 py-1 px-3 rounded-lg inline-block">
              100%
            </p>
          </div>
        </div>

        {/* AÇÕES PRINCIPAIS */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link 
            href="/academy" 
            className="flex items-center justify-center gap-3 bg-blue-600 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <Home size={18} /> Voltar ao Início
          </Link>
          <Link 
            href={`/academy/courses/${slug}`} 
            className="flex items-center justify-center gap-3 bg-white text-gray-900 border-2 border-gray-100 px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95"
          >
            <BookOpen size={18} /> Ver Conteúdo
          </Link>
        </div>

        {/* RODAPÉ E CONTATO */}
        <div className="pt-10 border-t border-gray-100 max-w-xs mx-auto">
           <button 
            onClick={handleCopyEmail}
            className={`w-full flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 py-5 rounded-2xl ${
              copied ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 bg-gray-50 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            {copied ? <CheckCircle size={16} /> : <Mail size={16} />}
            <span>{copied ? 'E-mail para certificado copiado!' : 'Solicitar Certificado'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}