import Link from 'next/link';
import { ListChecks, ArrowLeft, GraduationCap, Clock } from 'lucide-react';
import React from 'react';
import { notFound } from 'next/navigation';
import CourseContent from '@/components/CourseContent';
import BotaoContinuar from '@/components/BotaoContinuar';
import { cursorTo } from 'readline';

// --- CONFIGURAÇÃO ---
const API_BASE = 'https://apihub-br.duckdns.org';

async function getCourseData(slug: string) {
  try {
    // 1. Busca os dados básicos para descobrir o ID do curso
    const res = await fetch(`${API_BASE}/cursos/slug/${slug}`, {
      next: { revalidate: 60 } 
    });

    if (!res.ok) return null;
    const response = await res.json();
    const basicData = response.success ? response.data : null;

    if (!basicData || !basicData.id) return basicData;

    // 2. Busca a estrutura completa (módulos + blocos) usando o ID
    // Conforme Seção 6.2 da Doc: /cursos/{id}/details
    const resFull = await fetch(`${API_BASE}/cursos/${basicData.id}/details`, {
      next: { revalidate: 60 }
    });

    if (!resFull.ok) return basicData;

    const fullResponse = await resFull.json();
    return fullResponse.success ? fullResponse.data : basicData;

  } catch (error) {
    console.error("Erro ao buscar curso:", error);
    return null;
  }
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseData(slug);

  if (!course) notFound();

  // Tratamento resiliente para encontrar a primeira aula
  const modulos = course.modulos || course.curso_modulos || [];
  const primeiroModulo = modulos[0];
  const blocos = primeiroModulo?.blocos || primeiroModulo?.curso_blocos || [];
  const primeiraAulaId = blocos[0]?.id || '';

  return (
    <div className="min-h-screen pt-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Botão Voltar */}
        <Link href="/academy" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 mb-8 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Voltar para o Catálogo
        </Link>

        {/* --- CABEÇALHO DO CURSO (HERO) --- */}
        <section className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm mb-10 overflow-hidden relative">
          <div className="flex flex-col lg:flex-row gap-10 items-center relative z-10">
            <div className="flex-1">
              <div className="flex gap-2 mb-6">
                <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                  {course.nivel || 'Iniciante'}
                </span>
                <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-500 border border-gray-100 flex items-center gap-1">
                  <Clock size={12} /> {course.duracao_estimada || 0}h estimadas
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-black text-gray-900 mb-6 tracking-tighter leading-[1.1]">
                {course.titulo}
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed mb-8 font-medium max-w-2xl">
                {course.descricao}
              </p>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">
                  JR
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Instrutor</p>
                  <p className="text-sm font-bold text-gray-900">José Robério</p>
                </div>
              </div>
            </div>
            
            {course.thumbnail_url && (
              <div className="lg:w-1/3 w-full">
                <img 
                  src={course.thumbnail_url} 
                  alt={course.titulo} 
                  className="w-full h-auto object-cover rounded-[2.5rem] shadow-2xl border-8 border-white transform lg:rotate-2 hover:rotate-0 transition-transform duration-500"
                />
              </div>
            )}
          </div>
          {/* Decoração de fundo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* --- GRADE CURRICULAR --- */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
              <GraduationCap className="text-blue-600" size={36} /> 
              Grade Curricular
            </h2>

            <CourseContent initialData={course} />
          </div>

          {/* --- BARRA LATERAL --- */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
              <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2 uppercase text-[10px] tracking-widest">
                <ListChecks size={18} className="text-blue-600" /> O que você vai aprender
              </h3>
              <ul className="space-y-4">
                {['Domínio técnico especializado', 'Projetos práticos reais', 'Mentoria e melhores práticas'].map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600 font-bold">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
               <div className="relative z-10">
                 <h3 className="font-black text-2xl mb-2 leading-tight tracking-tight">Pronto para começar?</h3>
                 <p className="text-gray-400 text-sm mb-8 font-medium">Retome seus estudos exatamente de onde você parou.</p>
                 <BotaoContinuar 
                   slug={slug} 
                   primeiraAulaId={primeiraAulaId} 
                   cursoId={course.id}
                 />
               </div>
               {/* Efeito visual de fundo no card */}
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}