'use client';

import React from 'react';
import Link from 'next/link';
import { PlayCircle, FileText, ChevronRight, Clock } from 'lucide-react';

interface CourseContentProps {
  initialData: {
    slug: string;
    curso_modulos?: any[]; // Adicionei a '?' para ser opcional
  };
}

export default function CourseContent({ initialData }: CourseContentProps) {
  // 1. Extração segura dos módulos
  const modulosRaw = initialData?.curso_modulos || [];
  
  // 2. Ordenação garantindo que valores nulos não quebrem o código
  const modulos = [...modulosRaw].sort((a, b) => 
    (Number(a.ordem) || 0) - (Number(b.ordem) || 0)
  );

  if (modulos.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/30">
        <p className="text-gray-400 font-medium italic">
          Nenhum conteúdo disponível para este curso ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {modulos.map((modulo: any, index: number) => (
        <div 
          key={modulo.id || index} 
          className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all"
        >
          {/* Cabeçalho do Módulo */}
          <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
            <div className="flex-1">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                Módulo {modulo.ordem || index + 1}
              </span>
              <h3 className="text-xl font-bold text-gray-900 leading-tight">
                {modulo.titulo}
              </h3>
            </div>
            <div className="hidden sm:block">
              <span className="text-[11px] font-bold text-gray-400 bg-white border border-gray-200 px-3 py-1 rounded-full uppercase">
                {modulo.curso_blocos?.length || 0} Aulas
              </span>
            </div>
          </div>

          {/* Lista de Aulas */}
          <div className="divide-y divide-gray-50">
            {modulo.curso_blocos && modulo.curso_blocos.length > 0 ? (
              [...modulo.curso_blocos]
                .sort((a: any, b: any) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0))
                .map((aula: any) => (
                  <Link
                    key={aula.id}
                    // IMPORTANTE: Forçamos o ID para String para bater com a rota [aulaId]
                    href={`/academy/courses/${initialData.slug}/aula/${String(aula.id)}`}
                    className="p-5 flex items-center justify-between hover:bg-blue-50/40 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all group-hover:scale-105">
                        {aula.tipo === 'video' ? <PlayCircle size={20} /> : <FileText size={20} />}
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                          {aula.titulo}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {aula.tipo === 'video' ? 'Vídeo Aula' : 'Leitura'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        Acessar
                      </span>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </Link>
                ))
            ) : (
              <div className="p-6 text-center text-sm text-gray-400 italic">
                Aulas em breve para este módulo.
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}