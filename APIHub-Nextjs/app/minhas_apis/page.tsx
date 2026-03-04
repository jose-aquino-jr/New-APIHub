"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, ExternalLink, Trash2, Search,
  Code, Calendar, Loader2, Pencil, ShieldAlert
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { generateSlug } from '@/lib/utils';
import type { API } from '@/types';
import { toast, Toaster } from 'sonner';

export default function MinhasAPIs() {
  const [userApis, setUserApis] = useState<API[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    async function loadMyAPIs() {
      // Aguarda a autenticação ser resolvida
      if (!isAuthenticated) {
        // Se após 2 segundos ainda não autenticou, paramos o loader
        const timeout = setTimeout(() => setIsLoading(false), 2000);
        return () => clearTimeout(timeout);
      }
      
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Conforme Seção 3.4 da Doc: Endpoint para listar APIs do próprio usuário
        const res = await fetch('https://apihub-br.duckdns.org/apis/user/me', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await res.json();

        if (res.ok && result.success) {
          setUserApis(result.data || []);
        } else if (res.status === 401) {
          toast.error("Sessão expirada. Por favor, entre novamente.");
        } else {
          toast.error(result.message || "Erro ao carregar suas APIs.");
        }
      } catch (error) {
        console.error("Erro ao carregar APIs:", error);
        toast.error("Erro de conexão com o servidor.");
      } finally {
        setIsLoading(false);
      }
    }

    loadMyAPIs();
  }, [user, isAuthenticated]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente excluir a API "${name}"? Esta ação é irreversível.`)) return;

    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const loadingToast = toast.loading("Removendo do catálogo...");

    try {
      // Conforme Seção 3.3: DELETE /apis/{id}
      const res = await fetch(`https://apihub-br.duckdns.org/apis/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("API removida com sucesso!", { id: loadingToast });
        setUserApis(prev => prev.filter(api => api.id !== id));
      } else {
        toast.error(data.message || "Erro ao excluir. Verifique suas permissões.", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Erro de conexão com o servidor.", { id: loadingToast });
    }
  };

  const filteredApis = userApis.filter(api => 
    api.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 1. Estado de Carregamento
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50/50">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full" />
          </div>
        </div>
        <p className="text-gray-500 font-bold mt-4 tracking-tighter italic">Sincronizando com APIHub...</p>
      </div>
    );
  }

  // 2. Estado Não Autenticado
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500 pt-24 bg-white px-6 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <p className="text-2xl font-black text-gray-900 tracking-tight">Acesso Restrito</p>
        <p className="text-gray-500 max-w-xs mt-2 font-medium">Você precisa estar logado para gerenciar e publicar suas APIs no catálogo.</p>
        <Link href="/auth/login" className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-bold mt-8 hover:scale-105 active:scale-95 transition-all shadow-xl">
          Entrar na Conta
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-4 text-black">
      <Toaster richColors position="top-right" />
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="w-2 h-8 bg-blue-600 rounded-full" />
               <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Minhas APIs</h1>
            </div>
            <p className="text-gray-500 font-medium ml-5">
              Você possui <span className="text-blue-600 font-bold">{userApis.length} publicações</span> ativas no ecossistema.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text"
                placeholder="Filtrar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-6 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none w-full md:w-72 shadow-sm transition-all font-medium"
              />
            </div>
            <Link 
              href="/criacao" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl flex items-center gap-2 font-black shadow-lg shadow-blue-200 transition-all active:scale-95 text-sm uppercase tracking-widest"
            >
              <Plus className="w-5 h-5 stroke-[3px]" />
              <span>Criar</span>
            </Link>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white border border-gray-200 rounded-[3rem] shadow-xl shadow-gray-200/50 overflow-hidden">
          {filteredApis.length > 0 ? (
            <div className="divide-y divide-gray-100">
              <AnimatePresence mode="popLayout">
                {filteredApis.map((api) => (
                  <motion.div 
                    key={api.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-8 hover:bg-blue-50/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center text-white shadow-lg group">
                        <Code className="w-8 h-8 group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900 text-2xl tracking-tighter">{api.name}</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[10px] uppercase tracking-[0.15em] font-black px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {api.tags || 'Geral'}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                            <Calendar className="w-4 h-4 text-gray-300" />
                            {api.created_at ? new Date(api.created_at).toLocaleDateString('pt-BR') : 'Hoje'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                      <Link 
                        href={`/apis/${generateSlug(api.name)}`}
                        className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Ver Documentação"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </Link>
                      
                      <Link
                        href={`/minhas_apis/edicao/${api.id}`}
                        className="p-3 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                        title="Editar API"
                      >
                        <Pencil className="w-5 h-5" />
                      </Link>

                      <div className="w-px h-6 bg-gray-100 mx-1" />

                      <button 
                        onClick={() => handleDelete(api.id, api.name)}
                        className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Remover API"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="p-32 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Nada por aqui...</h3>
              <p className="text-gray-500 mb-8 font-medium">Você ainda não contribuiu com o catálogo global de APIs.</p>
              <Link href="/criacao" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase text-xs tracking-widest">
                Publicar primeira API
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}