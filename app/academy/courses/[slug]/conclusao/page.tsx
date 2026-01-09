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
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
      
      try {
        const resSlug = await fetch(`https://apihub-br.duckdns.org/cursos-by-slug/${resolvedParams.slug}`);
        const slugData = await resSlug.json();
        if (slugData.success) {
          const resFull = await fetch(`https://apihub-br.duckdns.org/curso-completo/${slugData.data.id}`);
          const fullData = await resFull.json();
          if (fullData.success) setCourse(fullData.data);
        }
      } catch (e) {
        console.error("Erro ao carregar dados", e);
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

  if (!course) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl font-black text-blue-600 animate-pulse uppercase tracking-widest">
        Carregando conquista...
      </div>
    </div>
  );

  const totalAulas = course.curso_modulos?.reduce(
    (acc: number, mod: any) => acc + (mod.curso_blocos?.length || 0), 0
  );

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      
      {/* Background Decorativo - Gradientes Suaves */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-100/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl text-center">
        
        {/* ÍCONE DE TROFÉU COM EFEITO DE FLUTUAÇÃO */}
        <div className="mb-10 relative inline-block animate-float">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse" />
          <div className="relative bg-gradient-to-br from-blue-600 to-cyan-500 p-7 rounded-full shadow-2xl">
            <Trophy size={60} className="text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-green-500 p-2.5 rounded-full border-4 border-white shadow-lg">
            <CheckCircle size={20} className="text-white" />
          </div>
        </div>

        {/* CABEÇALHO */}
        <div className="space-y-4 mb-10">
          <p className="text-blue-600 font-black uppercase tracking-[0.4em] text-[10px]">
            Conquista Desbloqueada
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight">
            Parabéns! Você concluiu <br /> 
            <span className="text-gradient">{course.titulo}</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed">
            Você percorreu toda a jornada e finalizou as <strong>{totalAulas} aulas</strong> com excelência.
          </p>
        </div>

        {/* CARD DE RESUMO ORGANIZADO (2 COLUNAS) */}
        <div className="bg-gray-50/50 rounded-[2.5rem] p-8 mb-12 border border-gray-100 grid grid-cols-2 gap-4 max-w-sm mx-auto shadow-sm">
          <div className="flex flex-col items-center">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Status</p>
            <p className="text-gray-900 font-black text-base uppercase">Concluído</p>
          </div>
          <div className="flex flex-col items-center border-l border-gray-200">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Aulas</p>
            <p className="text-gray-900 font-black text-base">{totalAulas}</p>
          </div>
        </div>

        {/* BOTÕES DE NAVEGAÇÃO */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link 
            href="/academy" 
            className="flex items-center justify-center gap-3 bg-gray-900 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all shadow-xl hover:-translate-y-1 active:scale-95"
          >
            <Home size={18} /> Home
          </Link>
          <Link 
            href={`/academy/courses/${slug}`} 
            className="flex items-center justify-center gap-3 bg-white text-gray-900 border-2 border-gray-100 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95"
          >
            <BookOpen size={18} /> Revisar Aulas
          </Link>
        </div>

        {/* ÁREA DE CONTATO / CÓPIA DE EMAIL */}
        <div className="pt-8 border-t border-gray-100">
           <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-4">
             Solicite seu certificado de conclusão
           </p>
           <button 
            onClick={handleCopyEmail}
            className={`flex items-center justify-center gap-3 mx-auto font-black text-xs uppercase tracking-widest transition-all duration-300 group py-4 px-6 rounded-2xl ${
              copied ? 'text-green-600 bg-green-50 shadow-inner' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50/50'
            }`}
          >
            {copied ? <Check size={18} className="animate-bounce" /> : <Mail size={18} />}
            <span>{copied ? 'E-mail copiado!' : 'Copiar e-mail de contato'}</span>
            {!copied && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </div>

      </div>
    </div>
  );
}