import Link from 'next/link';
import { ListChecks, ArrowLeft, GraduationCap, Clock } from 'lucide-react';
import React from 'react';
import { notFound } from 'next/navigation';
import CourseContent from '@/components/CourseContent'; // Certifique-se que o caminho está correto

// --- Busca de Dados Otimizada ---
async function getCourseData(slug: string) {
  try {
    // 1. Busca os dados básicos para descobrir o ID do curso
    const res = await fetch(`https://apihub-br.duckdns.org/cursos-by-slug/${slug}`, {
      next: { revalidate: 60 } 
    });

    if (!res.ok) return null;
    const response = await res.json();
    const basicData = response.success ? response.data : null;

    if (!basicData || !basicData.id) return basicData;

    // 2. Busca a estrutura completa (módulos + blocos) usando o ID
    const resFull = await fetch(`https://apihub-br.duckdns.org/curso-completo/${basicData.id}`, {
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

  return (
    <div className="min-h-screen pt-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Botão Voltar */}
        <Link href="/academy" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={16} /> Voltar para o Catálogo
        </Link>

        {/* --- CABEÇALHO DO CURSO (HERO) --- */}
        <section className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm mb-10">
          <div className="flex flex-col lg:flex-row gap-10 items-center">
            <div className="flex-1">
              <div className="flex gap-2 mb-6">
                <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                  {course.nivel || 'Iniciante'}
                </span>
                <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-500 border border-gray-100 flex items-center gap-1">
                  <Clock size={12} /> {course.duracao_estimada || 0}h estimadas
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
                {course.titulo}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-8 font-medium max-w-2xl">
                {course.descricao}
              </p>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold shadow-lg">
                  JR
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Instrutor</p>
                  <p className="text-sm font-bold text-gray-900">José Robério</p>
                </div>
              </div>
            </div>
            
            {course.thumbnail_url && (
              <div className="lg:w-1/3 w-full">
                <img 
                  src={course.thumbnail_url} 
                  alt={course.titulo} 
                  className="w-full h-auto object-cover rounded-[2.5rem] shadow-2xl border-4 border-white"
                />
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* --- GRADE CURRICULAR (COMPONENT CLIENT-SIDE) --- */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <GraduationCap className="text-blue-600" size={32} /> 
              Grade Curricular
            </h2>

            {/* Chamada do componente que você já tem, passando o objeto completo */}
            <CourseContent initialData={course} />
          </div>

          {/* --- BARRA LATERAL --- */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
              <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2 uppercase text-[10px] tracking-widest">
                <ListChecks size={18} className="text-blue-600" /> O que você vai aprender
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm text-gray-600 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                  Domínio técnico de {course.titulo}
                </li>
                <li className="flex gap-3 text-sm text-gray-600 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                  Projetos práticos e reais
                </li>
                <li className="flex gap-3 text-sm text-gray-600 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                  Mentoria e melhores práticas
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-[2.5rem] p-8 text-white shadow-xl">
               <h3 className="font-black text-xl mb-4 leading-tight">Inicie sua jornada</h3>
               <p className="text-blue-200 text-sm mb-8 font-medium leading-relaxed">
                 Aprenda com José Robério e domine o ecossistema de APIs do zero ao profissional.
               </p>
               <button className="w-full bg-blue-500 text-white font-black py-4 rounded-2xl hover:bg-blue-400 transition-all shadow-lg active:scale-95 uppercase text-xs tracking-widest">
                  Matricular-se Agora
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}