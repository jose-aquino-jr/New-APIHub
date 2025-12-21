import Link from 'next/link';
import { Download, User, ListChecks, ArrowLeft } from 'lucide-react';
import React from 'react';
import MotionWrapper from '@/components/MotionWrapper';
import { notFound } from 'next/navigation';
import CourseContent from '@/components/CourseContent';

// Interface ajustada para o que o seu Banco de Dados costuma retornar
interface Course {
  id: string;
  slug: string;
  name: string; 
  description: string;
  category: string;
  instructor: string;
  instructor_bio: string;
  prerequisites: string | string[]; // Aceita string do banco ou array tratado
  material_download_url?: string;
}

interface PageProps {
  params: { slug: string };
}

// Função de Busca no Servidor
async function getCourseData(slug: string): Promise<Course | null> {
  try {
    const res = await fetch(`https://apihub-br.duckdns.org/curso-by-slug/${slug}`, {
      next: { revalidate: 3600 } // Cache de 1 hora para performance
    });

    if (!res.ok) return null;
    const data = await res.json();

    // Lógica de tratamento: Se o banco retornar uma string separada por vírgulas, transformamos em Array
    if (data && typeof data.prerequisites === 'string') {
      data.prerequisites = data.prerequisites.split(',').map((item: string) => item.trim());
    }

    return data;
  } catch (error) {
    console.error("Erro ao carregar curso:", error);
    return null;
  }
}

export default async function CourseDetailPage({ params }: PageProps) {
  const course = await getCourseData(params.slug);

  if (!course) notFound();

  return (
    <div className="min-h-screen pt-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Link de Voltar */}
        <Link href="/academy/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={16} /> Voltar para o Dashboard
        </Link>

        {/* Hero do Curso - Padding Aumentado e Bordas Arredondadas */}
        <MotionWrapper initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm mb-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                  {course.category || 'API Academy'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                {course.name}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-3xl font-medium">
                {course.description}
              </p>

              <div className="flex flex-wrap gap-8 text-sm font-bold text-gray-400 uppercase tracking-tighter">
                <span className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" /> Especialista: <span className="text-gray-700">{course.instructor}</span>
                </span>
              </div>
            </div>
          </div>
        </MotionWrapper>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* PRÉ-REQUISITOS */}
            <MotionWrapper initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <ListChecks className="w-6 h-6 text-purple-600"/> O que você precisa saber
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Array.isArray(course.prerequisites) ? course.prerequisites : []).map((req, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <span className="w-2 h-2 mt-2 rounded-full bg-purple-500 shrink-0" />
                    <span className="text-sm font-medium">{req}</span>
                  </li>
                )) || <li className="text-gray-500">Nenhum pré-requisito listado.</li>}
              </ul>
            </MotionWrapper>

            {/* CONTEÚDO DINÂMICO (Aulas) */}
            <MotionWrapper initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
               <h2 className="text-xl font-bold text-gray-800 mb-6">Ementa do Curso</h2>
               <CourseContent courseId={course.id} />
            </MotionWrapper>
          </div>

          {/* BARRA LATERAL */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-6">Instrutor</h2>
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-2xl font-black shadow-lg">
                  {course.instructor?.[0]}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{course.instructor}</h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{course.instructor_bio}</p>
                </div>
              </div>
            </div>

            {course.material_download_url && (
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2rem] p-8 text-white shadow-xl">
                <h3 className="font-bold flex items-center gap-2 mb-4 text-purple-400">
                  <Download className="w-6 h-6" /> Materiais de Apoio
                </h3>
                <p className="text-gray-400 text-xs mb-6 leading-relaxed">Baixe slides, códigos fonte e documentação técnica exclusiva deste curso.</p>
                <Link href={course.material_download_url} target="_blank" className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-900/20">
                  Acessar Documentação
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}