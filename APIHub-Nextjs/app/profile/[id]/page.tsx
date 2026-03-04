"use client";

import { useEffect, useState } from 'react';
import { 
  User, Code, Globe, Mail, MapPin, Star, BookOpen, Package, 
  Cpu, LayoutGrid, Terminal, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Interfaces robustecidas
interface API {
  id: string;
  name: string;
  description: string;
  status: 'community' | 'verified' | 'deprecated';
  rating: number;
  tags?: string;
}

interface Usuario {
  id: string;
  name: string;
  bio: string;
  location: string;
  email: string;
  avatar_url?: string;
  github?: string;
  website?: string;
  technologies?: string[];
  apis: API[];
}

const BACKEND_URL = "https://apihub-br.duckdns.org";

export default function PerfilUsuario({ params }: { params: { userId: string } }) {
  const [dados, setDados] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'apis'>('overview');

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const response = await fetch(`${BACKEND_URL}/users/profile/${params.userId}/with-apis`);
        const data = await response.json();
        
        const tecnologiasMock = ["React", "Node.js", "TypeScript", "Python", "Next.js", "GraphQL"];
        setDados({ ...data, technologies: data.technologies || tecnologiasMock });
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarPerfil();
  }, [params.userId]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Carregando Perfil...</p>
    </div>
  );

  if (!dados) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl font-black text-gray-200 uppercase italic">Usuário 404</h2>
        <Link href="/" className="text-blue-600 font-bold text-sm underline">Voltar para a Home</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          
          {/* SIDEBAR: IDENTIDADE */}
          <aside className="md:col-span-4 lg:col-span-3 space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="relative group"
            >
              {dados.avatar_url ? (
                <img src={dados.avatar_url} alt={dados.name} className="w-full aspect-square rounded-[2.5rem] border-2 border-gray-50 shadow-xl object-cover" />
              ) : (
                <div className="w-full aspect-square bg-gradient-to-br from-gray-900 to-blue-900 rounded-[2.5rem] flex items-center justify-center text-white text-7xl font-black shadow-2xl">
                  {dados.name.charAt(0)}
                </div>
              )}
              <div className="absolute -bottom-3 -right-3 bg-blue-600 text-white p-3 rounded-2xl shadow-lg">
                <Cpu size={20} />
              </div>
            </motion.div>

            <div className="space-y-2">
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{dados.name}</h1>
              <p className="text-lg text-gray-400 font-medium">@{dados.name.replace(/\s/g, '').toLowerCase()}</p>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed font-medium">
              {dados.bio || "Este desenvolvedor ainda não definiu uma bio, mas suas APIs falam por ele."}
            </p>

            <div className="space-y-4 pt-4 border-t border-gray-50">
              <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                <MapPin size={18} className="text-blue-500" /> {dados.location || "Remote / Cloud"}
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                <Mail size={18} className="text-blue-500" /> {dados.email}
              </div>
            </div>

            {/* TECH STACK */}
            <div className="pt-6">
              <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">Core Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {dados.technologies?.map(tech => (
                  <span key={tech} className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black border border-gray-100 uppercase transition-all hover:border-blue-200 hover:text-blue-600 cursor-default">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT: PRODUÇÃO */}
          <main className="md:col-span-8 lg:col-span-9 space-y-10">
            
            {/* NAVEGAÇÃO DE TABS */}
            <div className="flex items-center gap-8 border-b border-gray-100">
               <button 
                onClick={() => setActiveTab('overview')}
                className={`text-sm font-black pb-4 transition-all relative ${activeTab === 'overview' ? 'text-gray-900' : 'text-gray-300 hover:text-gray-500'}`}
               >
                  <span className="flex items-center gap-2 italic"><BookOpen size={16} /> Overview</span>
                  {activeTab === 'overview' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-full" />}
               </button>
               <button 
                onClick={() => setActiveTab('apis')}
                className={`text-sm font-black pb-4 transition-all relative ${activeTab === 'apis' ? 'text-gray-900' : 'text-gray-300 hover:text-gray-500'}`}
               >
                  <span className="flex items-center gap-2 italic">
                    <Package size={16} /> APIs Públicas 
                    <span className="ml-1 bg-gray-100 px-2 py-0.5 rounded-lg text-[9px]">{dados.apis?.length || 0}</span>
                  </span>
                  {activeTab === 'apis' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-full" />}
               </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'overview' ? (
                <motion.div 
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-10"
                >
                  {/* GRID DE APIs EM DESTAQUE */}
                  <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {dados.apis?.slice(0, 4).map((api) => (
                      <Link key={api.id} href={`/api-detalhes/${api.id}`}>
                        <motion.div 
                          whileHover={{ y: -5 }}
                          className="h-full p-6 border-2 border-gray-50 rounded-[2rem] bg-white hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-500/5 transition-all group"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <Terminal size={18} />
                              </div>
                              <span className="text-base font-black text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight">
                                {api.name}
                              </span>
                            </div>
                            {api.status === 'verified' && (
                              <div className="bg-green-50 p-1 rounded-full text-green-600">
                                <ExternalLink size={12} />
                              </div>
                            )}
                          </div>
                          
                          <p className="text-gray-500 text-xs font-medium leading-relaxed line-clamp-2 mb-6">
                            {api.description}
                          </p>

                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                              {api.tags?.split(',')[0] || 'Cloud Service'}
                            </span>
                            <div className="flex items-center gap-1.5 bg-yellow-50 px-2 py-1 rounded-lg">
                              <Star size={12} className="text-yellow-500 fill-yellow-500" />
                              <span className="text-[10px] font-black text-yellow-700">{api.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </section>

                  {/* ACTIVITY GRAPH */}
                  <section className="space-y-4">
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Contribution Graph</h2>
                    <div className="border border-gray-100 rounded-[2.5rem] p-8 bg-gray-50/50">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {Array.from({ length: 48 }).map((_, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.01 }}
                            className={`w-4 h-4 rounded-md shadow-sm ${
                              i % 7 === 0 ? 'bg-green-600 shadow-green-200' : 
                              i % 3 === 0 ? 'bg-green-300' : 
                              'bg-gray-200'
                            }`} 
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-6 px-4 text-[9px] text-gray-400 font-black uppercase tracking-widest">
                        <span>Low Activity</span>
                        <div className="flex gap-1 items-center">
                          <div className="w-2 h-2 bg-gray-200 rounded-sm"></div>
                          <div className="w-2 h-2 bg-green-300 rounded-sm"></div>
                          <div className="w-2 h-2 bg-green-600 rounded-sm"></div>
                        </div>
                        <span>High Activity</span>
                      </div>
                    </div>
                  </section>
                </motion.div>
              ) : (
                <motion.div 
                  key="apis"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 gap-4"
                >
                  {/* LISTAGEM COMPLETA ESTILO TABELA/LINHAS */}
                  {dados.apis?.map((api) => (
                    <Link key={api.id} href={`/api-detalhes/${api.id}`}>
                      <div className="p-4 border border-gray-100 rounded-2xl flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400">
                            <Package size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">{api.name}</h4>
                            <p className="text-[10px] text-gray-400 font-medium italic">{api.tags}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xs font-black text-gray-900">
                            <Star size={12} className="text-yellow-500 fill-yellow-500" /> {api.rating}
                          </div>
                          <span className="text-[9px] uppercase font-black text-blue-500">View Docs</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

          </main>
        </div>
      </div>
    </div>
  );
}