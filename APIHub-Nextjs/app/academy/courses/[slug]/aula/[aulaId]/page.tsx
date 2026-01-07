import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, FileText, Lock } from 'lucide-react';
import BotaoConcluir from '@/components/BotaoConcluir';

export const dynamic = 'force-dynamic';

console.log(">>> O ARQUIVO DA AULA FOI CARREGADO PELO SERVIDOR <<<");

// --- INTERFACES ---
interface Bloco {
  id: string;
  tipo: 'texto' | 'video';
  ordem: number;
  titulo: string;
  conteudo?: string;
  modulo_id: string;
  moduloTitulo: string;
}

// --- FUNÇÕES DE BUSCA ---
async function getFullCourseData(slug: string) {
  try {
    const resSlug = await fetch(`https://apihub-br.duckdns.org/cursos-by-slug/${slug}`, { next: { revalidate: 30 } });
    const slugData = await resSlug.json();
    
    // Log para ver o que o slugData traz (Olhe no Terminal do VS Code!)
    console.log("--- DEBUG SLUG DATA ---", slugData);

    if (!slugData.success) return null;

    const resFull = await fetch(`https://apihub-br.duckdns.org/curso-completo/${slugData.data.id}`, { next: { revalidate: 30 } });
    const fullData = await resFull.json();
    
    return fullData.success ? fullData.data : null;
  } catch (error) { 
    console.error("Erro no getFullCourseData:", error);
    return null; 
  }
}

async function getUserProgress(cursoId: string) {
  try {
    const res = await fetch(`https://apihub-br.duckdns.org/curso-progresso/${cursoId}`, { cache: 'no-store' });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) { 
    console.error("Erro no getUserProgress:", error);
    return null; 
  }
}

export default async function AulaPage({ params }: { params: any }) {
  // Em Next.js 15, params deve ser aguardado se for uma Promise
  const { slug, aulaId } = await params;

  // 1. Busca os dados do curso
  const course = await getFullCourseData(slug);
  
  // LOG: Verificando se o curso foi carregado
  console.log("--- DEBUG COURSE LOADED ---", course?.titulo);

  if (!course || !course.curso_modulos) notFound();

  // 2. Monta a linha do tempo organizada
  const linhaDoTempo: Bloco[] = course.curso_modulos
    .sort((a: any, b: any) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0))
    .flatMap((mod: any) =>
      (mod.curso_blocos || [])
        .sort((a: any, b: any) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0))
        .map((bloco: any) => ({
          ...bloco,
          modulo_id: mod.id,
          moduloTitulo: mod.titulo
        }))
    );

  // 3. Identifica a aula atual
  const indiceGlobal = linhaDoTempo.findIndex(b => String(b.id) === String(aulaId));
  
  // LOG: Verificando se encontrou o ID da aula na linha do tempo
  console.log("--- DEBUG INDICE GLOBAL ---", indiceGlobal, "PROCURANDO POR:", aulaId);

  if (indiceGlobal === -1) notFound();

  // 4. Verifica progresso e permissão
  const progresso = await getUserProgress(course.id);
  const aulasConcluidasIds = progresso?.detalhes?.map((d: any) => d.bloco_id) || [];

  const podeAcessar = indiceGlobal === 0 || aulasConcluidasIds.includes(linhaDoTempo[indiceGlobal - 1].id);
  
  if (!podeAcessar) {
    console.log("--- ACESSO NEGADO: REDIRECIONANDO ---");
    redirect(`/academy/courses/${slug}?error=aula-bloqueada`);
  }

  const aulaAtual = linhaDoTempo[indiceGlobal];
  const proximaAula = linhaDoTempo[indiceGlobal + 1];
  const progressoPorcentagem = Math.round(((indiceGlobal + 1) / linhaDoTempo.length) * 100);
  const jaConcluida = aulasConcluidasIds.includes(aulaAtual.id);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Barra de Progresso Superior */}
      <div className="fixed top-0 left-0 w-full h-3 bg-gray-100 z-[100] shadow-inner">
        <div 
          className="h-full bg-blue-600 transition-all duration-1000 ease-out" 
          style={{ width: `${progressoPorcentagem}%` }} 
        />
      </div>

      {/* Navegação */}
      <nav className="border-b bg-white/90 backdrop-blur-md px-6 py-4 sticky top-3 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href={`/academy/courses/${slug}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-500" />
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{progressoPorcentagem}% CONCLUÍDO</span>
            <h2 className="text-sm font-bold text-gray-900 truncate max-w-xs uppercase">{aulaAtual.titulo}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {indiceGlobal > 0 && (
            <Link 
              href={`/academy/courses/${slug}/aula/${linhaDoTempo[indiceGlobal - 1].id}`} 
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft size={24} />
            </Link>
          )}
          {proximaAula && jaConcluida && (
            <Link 
              href={`/academy/courses/${slug}/aula/${proximaAula.id}`} 
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <ChevronRight size={24} />
            </Link>
          )}
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-4xl mx-auto w-full py-12 px-6">
        <div className="mb-12">
          {aulaAtual.tipo === 'video' ? (
            <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
              <iframe 
                src={aulaAtual.conteudo} 
                className="w-full h-full" 
                allowFullScreen 
              />
            </div>
          ) : (
            <div className="py-20 bg-gradient-to-br from-blue-50/50 to-white rounded-[2.5rem] border-2 border-dashed border-blue-100 flex flex-col items-center text-center px-6">
              <FileText size={56} className="text-blue-500/40 mb-4" />
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Leitura Obrigatória</p>
              <p className="text-gray-500 mt-2">Acompanhe o material de apoio abaixo.</p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Módulo: {aulaAtual.moduloTitulo}</p>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight tracking-tight">{aulaAtual.titulo}</h1>
        </div>

        <article 
          className="prose prose-blue prose-lg max-w-none prose-p:text-gray-600" 
          dangerouslySetInnerHTML={{ __html: aulaAtual.conteudo || '' }} 
        />

        {/* Rodapé de Conclusão */}
        <div className="mt-24 pt-10 border-t border-gray-100 flex flex-col items-center">
          {proximaAula ? (
             jaConcluida ? (
               <Link 
                 href={`/academy/courses/${slug}/aula/${proximaAula.id}`}
                 className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
               >
                 AVANÇAR PARA PRÓXIMA
               </Link>
             ) : (
               <BotaoConcluir
                 cursoId={course.titulo} // Nome do curso como string conforme seu backend pede
                 moduloId={aulaAtual.moduloTitulo} 
                 blocoId={aulaAtual.titulo}
                 proximaAulaUrl={`/academy/courses/${slug}/aula/${proximaAula.id}`}
               />
             )
          ) : (
            <div className="text-center">
              <div className="text-green-600 font-black text-2xl mb-4">🏆 VOCÊ FINALIZOU ESTE CURSO!</div>
              <Link href="/academy" className="text-blue-600 font-bold hover:underline">Voltar para a biblioteca</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}