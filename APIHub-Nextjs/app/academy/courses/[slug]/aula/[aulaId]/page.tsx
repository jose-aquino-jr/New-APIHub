import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers'; 
import { ArrowLeft, ChevronLeft, ChevronRight, FileText, PlayCircle } from 'lucide-react';
import BotaoConcluir from '@/components/BotaoConcluir';

export const dynamic = 'force-dynamic';

const API_BASE = 'https://apihub-br.duckdns.org';

// --- FUNÇÕES DE BUSCA ---

async function getFullCourseData(slug: string) {
  try {
    const resSlug = await fetch(`${API_BASE}/cursos/slug/${slug}`, { next: { revalidate: 30 } });
    const slugData = await resSlug.json();
    if (!slugData.success || !slugData.data) return null;

    const resFull = await fetch(`${API_BASE}/cursos/${slugData.data.id}/details`, { next: { revalidate: 30 } });
    const fullData = await resFull.json();
    return fullData.success ? fullData.data : null;
  } catch (error) { return null; }
}

async function getUserProgress(cursoId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    // Se não houver token, não tenta buscar progresso para não dar erro 401
    if (!token) return null;

    const res = await fetch(`${API_BASE}/progresso/${cursoId}`, { 
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store' 
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) { return null; }
}

export default async function AulaPage({ params }: { params: Promise<{ slug: string, aulaId: string }> }) {
  const { slug, aulaId } = await params;
  const isDev = process.env.NODE_ENV === 'development';

  // 1. Carregar dados
  const course = await getFullCourseData(slug);
  if (!course) notFound();

  const progresso = await getUserProgress(course.id);

  // 2. Organizar Linha do Tempo (Mapeamento Flexível para blocos/curso_blocos)
  const modulos = course.modulos || course.curso_modulos || [];
  const linhaDoTempo = modulos
    .sort((a: any, b: any) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0))
    .flatMap((mod: any) => {
      const blocosRaw = mod.blocos || mod.curso_blocos || [];
      return blocosRaw
        .sort((a: any, b: any) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0))
        .map((bloco: any) => ({
          ...bloco,
          modulo_id: mod.id,
          moduloTitulo: mod.titulo
        }));
    });

  // 3. Localizar aula atual
  const indiceGlobal = linhaDoTempo.findIndex((b: any) => String(b.id) === String(aulaId));
  if (indiceGlobal === -1) notFound();

  const aulaAtual = linhaDoTempo[indiceGlobal];
  const proximaAula = linhaDoTempo[indiceGlobal + 1];

  // 4. Validação de Acesso com Bypass de Dev
  const aulasConcluidasIds = progresso?.detalhes?.map((c: any) => String(c.bloco_id)) || [];
  const jaConcluida = aulasConcluidasIds.includes(String(aulaAtual.id));
  const podeAcessarAnterior = indiceGlobal === 0 || aulasConcluidasIds.includes(String(linhaDoTempo[indiceGlobal - 1]?.id));

  // Bloqueia se: Não for Dev E não tiver acesso E não estiver concluída
  if (!isDev && !podeAcessarAnterior && !jaConcluida) {
    redirect(`/academy/courses/${slug}?error=aula-bloqueada`);
  }

  const progressoPorcentagem = Math.round(((indiceGlobal + 1) / linhaDoTempo.length) * 100);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Barra de Progresso Superior */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-100 z-[100]">
        <div className="h-full bg-blue-600 transition-all duration-700" style={{ width: `${progressoPorcentagem}%` }} />
      </div>

      <nav className="border-b bg-white/90 backdrop-blur-md px-6 py-4 sticky top-1 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/academy/courses/${slug}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-500" />
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
              {progressoPorcentagem}% do curso
            </span>
            <h2 className="text-sm font-bold text-gray-900 truncate max-w-[200px] uppercase">
              {aulaAtual.titulo}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {indiceGlobal > 0 && (
            <Link href={`/academy/courses/${slug}/aula/${linhaDoTempo[indiceGlobal - 1].id}`} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
              <ChevronLeft size={28} />
            </Link>
          )}
          {proximaAula && (jaConcluida || podeAcessarAnterior || isDev) && (
            <Link href={`/academy/courses/${slug}/aula/${proximaAula.id}`} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
              <ChevronRight size={28} />
            </Link>
          )}
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full py-12 px-6">
        {/* PLAYER DE VÍDEO OU PLACEHOLDER */}
        <div className="mb-12">
          {aulaAtual.tipo === 'video' && aulaAtual.conteudo ? (
            <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-gray-50">
              <iframe 
                src={aulaAtual.conteudo.includes('youtube.com') ? aulaAtual.conteudo : `https://www.youtube.com/embed/${aulaAtual.conteudo}`}
                className="w-full h-full" 
                allowFullScreen 
              />
            </div>
          ) : (
            <div className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2.5rem] border-2 border-dashed border-blue-100 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-4">
                {aulaAtual.tipo === 'video' ? <PlayCircle size={40} className="text-blue-500" /> : <FileText size={40} className="text-blue-500" />}
              </div>
              <p className="text-sm font-black text-blue-600 uppercase tracking-widest">
                {aulaAtual.tipo === 'video' ? 'Vídeo Aula' : 'Material de Leitura'}
              </p>
            </div>
          )}
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Módulo: {aulaAtual.moduloTitulo}
            </p>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight tracking-tight">
              {aulaAtual.titulo}
            </h1>
          </div>

          {/* CONTEÚDO DA AULA */}
          <article 
            className="prose prose-slate prose-lg max-w-none 
              prose-headings:font-black prose-headings:tracking-tight
              prose-p:text-gray-600 prose-p:leading-relaxed
              prose-strong:text-blue-600
              mb-20"
            dangerouslySetInnerHTML={{ __html: aulaAtual.conteudo || '' }} 
          />

          {/* AÇÕES DE CONCLUSÃO */}
          <div className="mt-20 pt-10 border-t border-gray-100 flex flex-col items-center">
            {proximaAula ? (
               jaConcluida || isDev ? (
                 <Link 
                   href={`/academy/courses/${slug}/aula/${proximaAula.id}`}
                   className="bg-gray-900 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-gray-200"
                 >
                   Próxima Aula
                 </Link>
               ) : (
                 <BotaoConcluir
                   cursoId={course.id}
                   moduloId={aulaAtual.modulo_id}
                   blocoId={aulaAtual.id}
                   proximaAulaUrl={`/academy/courses/${slug}/aula/${proximaAula.id}`}
                 />
               )
            ) : (
              <div className="text-center p-12 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 w-full">
                <div className="text-emerald-600 font-black text-3xl mb-3 tracking-tighter">CURSO CONCLUÍDO! 🏆</div>
                <p className="text-emerald-700 font-medium mb-6">Você dominou todo o conteúdo deste treinamento.</p>
                <Link href="/academy" className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
                  Voltar ao Catálogo
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}