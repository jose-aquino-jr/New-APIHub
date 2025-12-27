import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { notFound } from 'next/navigation';

// Função para buscar dados da API
async function getFullCourseData(slug: string) {
  try {
    const resSlug = await fetch(`https://apihub-br.duckdns.org/cursos-by-slug/${slug}`, { next: { revalidate: 30 } });
    const slugData = await resSlug.json();
    if (!slugData.success) return null;

    const resFull = await fetch(`https://apihub-br.duckdns.org/curso-completo/${slugData.data.id}`, { next: { revalidate: 30 } });
    const fullData = await resFull.json();
    return fullData.success ? fullData.data : null;
  } catch (error) {
    return null;
  }
}

export default async function AulaPage({ params }: { params: any }) {
  const { slug, aulaId } = await params;
  const course = await getFullCourseData(slug);

  if (!course || !course.curso_modulos) notFound();

  // --- LÓGICA DE LINHA DO TEMPO GLOBAL ---
  const linhaDoTempo = course.curso_modulos
    .sort((a: any, b: any) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0))
    .flatMap((mod: any) => 
      (mod.curso_blocos || [])
        .sort((a: any, b: any) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0))
        .map((bloco: any) => ({
          ...bloco,
          moduloTitulo: mod.titulo
        }))
    );

  const indiceGlobal = linhaDoTempo.findIndex(
    (a: any) => String(a.id).toLowerCase() === String(aulaId).toLowerCase()
  );

  if (indiceGlobal === -1) notFound();

  const aulaAtual = linhaDoTempo[indiceGlobal];
  const totalAulasGlobal = linhaDoTempo.length;
  const progressoGlobal = Math.round(((indiceGlobal + 1) / totalAulasGlobal) * 100);

  const aulaAnterior = linhaDoTempo[indiceGlobal - 1];
  const proximaAula = linhaDoTempo[indiceGlobal + 1];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      
      {/* 1. BARRA DE PROGRESSO USANDO CLASSES DO GLOBALS.CSS */}
      <div className="fixed top-0 left-0 w-full h-3 bg-gray-100 z-[100] shadow-inner">
        <div 
          className="h-full transition-all duration-1000 ease-out relative overflow-hidden progress-bar-gradient"
          style={{ width: `${progressoGlobal}%` }}
        >
          <div className="progress-shimmer-effect animate-shimmer" />
        </div>
      </div>

      {/* 2. NAVBAR AJUSTADA */}
      <nav className="border-b bg-white/90 backdrop-blur-md px-6 py-4 sticky top-3 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href={`/academy/courses/${slug}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-500" />
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                {progressoGlobal}% CONCLUÍDO
              </span>
              <span className="text-gray-200 text-xs">|</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                AULA {indiceGlobal + 1} DE {totalAulasGlobal}
              </span>
            </div>
            <h2 className="text-sm font-bold text-gray-900 truncate max-w-[180px] md:max-w-xs uppercase">
              {aulaAtual.titulo}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {aulaAnterior && (
            <Link href={`/academy/courses/${slug}/aula/${aulaAnterior.id}`} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
              <ChevronLeft size={24} />
            </Link>
          )}

          {proximaAula ? (
            <Link 
              href={`/academy/courses/${slug}/aula/${proximaAula.id}`}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-[11px] font-black uppercase rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              PRÓXIMA <ChevronRight size={16} />
            </Link>
          ) : (
            <Link 
              href={`/academy/courses/${slug}/conclusao`}
              className="px-6 py-2 bg-green-600 text-white text-[11px] font-black uppercase rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-100"
            >
              FINALIZAR
            </Link>
          )}
        </div>
      </nav>

      {/* 3. CONTEÚDO PRINCIPAL */}
      <main className="flex-1 max-w-4xl mx-auto w-full py-12 px-6">
        
        <div className="mb-12">
          {aulaAtual.tipo === 'video' ? (
            <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white animate-fade-in-up">
              <iframe src={aulaAtual.conteudo} className="w-full h-full" allowFullScreen />
            </div>
          ) : (
            <div className="py-20 bg-gradient-to-br from-blue-50/50 to-white rounded-[2.5rem] border-2 border-dashed border-blue-100 flex flex-col items-center animate-fade-in-up">
              <FileText size={56} className="text-blue-500/40 mb-4 animate-float" />
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Leitura Obrigatória</p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
            Módulo: {aulaAtual.moduloTitulo}
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight tracking-tight">
            {aulaAtual.titulo}
          </h1>
        </div>

        <article 
          className="prose prose-blue prose-lg max-w-none 
                     prose-p:text-gray-600 prose-p:leading-relaxed
                     prose-headings:text-gray-900 prose-headings:font-black
                     prose-strong:text-blue-700 prose-code:text-blue-600"
          dangerouslySetInnerHTML={{ __html: aulaAtual.conteudo }} 
        />

        <div className="mt-24 pt-10 border-t border-gray-100 flex flex-col items-center">
          <div className="flex flex-col items-center gap-1 mb-8">
             <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sua jornada até aqui</div>
             <div className="text-4xl font-black text-gradient">
               {progressoGlobal}%
             </div>
          </div>

          {proximaAula ? (
            <Link 
              href={`/academy/courses/${slug}/aula/${proximaAula.id}`}
              className="group flex items-center gap-4 bg-gray-900 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl hover:-translate-y-1"
            >
              <CheckCircle2 size={20} className="text-blue-400 group-hover:text-white transition-colors" />
              CONCLUIR AULA
            </Link>
          ) : (
            <Link 
              href={`/academy/courses/${slug}/conclusao`}
              className="flex items-center gap-4 bg-green-600 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-green-700 transition-all shadow-xl hover:-translate-y-1"
            >
              <CheckCircle2 size={20} />
              FINALIZAR CURSO
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}