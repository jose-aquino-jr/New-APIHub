"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Globe, ChevronDown, Save, ArrowLeft,
  PawPrint, Languages, Database, GraduationCap, Book, 
  ShoppingCart, Cloud, Smile, Image, DollarSign, Users, 
  MapPin, Camera, MessageCircle, Music, Gamepad2, Brain, 
  Code, Mail, Calendar, BarChart3, Smartphone, LucideIcon, Loader2
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

const CATEGORY_MAP: Record<string, { color: string; icon: LucideIcon }> = {
  'Animais': { color: 'from-orange-500 to-pink-500', icon: PawPrint },
  'Palavras': { color: 'from-blue-500 to-cyan-500', icon: Languages },
  'Dados': { color: 'from-purple-500 to-indigo-500', icon: Database },
  'Educação': { color: 'from-green-500 to-emerald-500', icon: GraduationCap },
  'Livros': { color: 'from-amber-500 to-orange-500', icon: Book },
  'Produtos': { color: 'from-red-500 to-rose-500', icon: ShoppingCart },
  'Clima': { color: 'from-cyan-500 to-blue-500', icon: Cloud },
  'Diversão': { color: 'from-pink-500 to-rose-500', icon: Smile },
  'Imagens': { color: 'from-violet-500 to-purple-500', icon: Image },
  'Financeiro': { color: 'from-emerald-500 to-green-500', icon: DollarSign },
  'Tradução': { color: 'from-sky-500 to-blue-500', icon: Languages },
  'Nomes': { color: 'from-indigo-500 to-purple-500', icon: Users },
  'Localização': { color: 'from-red-500 to-orange-500', icon: MapPin },
  'Fotos': { color: 'from-purple-500 to-pink-500', icon: Camera },
  'Redes Sociais': { color: 'from-blue-500 to-indigo-500', icon: MessageCircle },
  'Música': { color: 'from-green-500 to-teal-500', icon: Music },
  'Jogos': { color: 'from-yellow-500 to-orange-500', icon: Gamepad2 },
  'IA': { color: 'from-purple-500 to-blue-500', icon: Brain },
  'Desenvolvimento': { color: 'from-gray-600 to-gray-800', icon: Code },
  'Email': { color: 'from-blue-500 to-cyan-500', icon: Mail },
  'Calendário': { color: 'from-green-500 to-emerald-500', icon: Calendar },
  'Análises': { color: 'from-indigo-500 to-purple-500', icon: BarChart3 },
  'Mobile': { color: 'from-blue-500 to-purple-500', icon: Smartphone }
};

export default function EdicaoAPI() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const apiId = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [method, setMethod] = useState('GET');
  const [parameters, setParameters] = useState('');
  const [category, setCategory] = useState('');
  const [isHttps, setIsHttps] = useState(true);
  const [isCors, setIsCors] = useState(true);

  useEffect(() => {
    async function loadApiData() {
      // Sincronização de Token para busca
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');

      try {
        // Busca os dados atuais da API
        const res = await fetch(`https://apihub-br.duckdns.org/api-detalhes/${apiId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const api = data.success ? data.data : data;
        
        if (api && (api.name || api.title)) {
          setName(api.name || api.title);
          setDescription(api.description || '');
          setEndpoint(api.base_url || '');
          // Garante que o método venha em maiúsculo e pegue apenas o primeiro se for string separada por vírgula
          const firstMethod = api.method?.split(',')[0] || 'GET';
          setMethod(firstMethod);
          setCategory(api.tags || '');
          setIsHttps(!!api.https);
          setIsCors(!!api.cors);
          setParameters(api.parameters || '');
        } else {
          toast.error("API não encontrada.");
          router.push('/minhas_apis');
        }
      } catch (error) {
        toast.error("Erro ao carregar dados do catálogo.");
      } finally {
        setLoading(false);
      }
    }
    if (apiId) loadApiData();
  }, [apiId, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');

    try {
      // Conforme Doc Seção 3.2: PUT /api-update/{id}
      const res = await fetch(`https://apihub-br.duckdns.org/api-update/${apiId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description,
          base_url: endpoint,
          method, // Se o backend exigir string separada por vírgula: method: method
          tags: category,
          https: isHttps,
          cors: isCors,
          parameters,
        })
      });

      const result = await res.json();

      if (res.ok) {
        toast.success('Alterações sincronizadas!', {
            description: "Os dados foram atualizados no catálogo global."
        });
        router.push('/minhas_apis');
      } else {
        toast.error(result.message || 'Falha ao atualizar API.');
      }
    } catch (err) {
      toast.error('Erro de conexão com o servidor.');
    } finally {
      setSaving(false);
    }
  };

  const categoryData = CATEGORY_MAP[category] || { color: 'from-blue-600 to-indigo-600', icon: Database };
  const SelectedIcon = categoryData.icon;
  const selectedGradient = categoryData.color;

  const getMethodColor = (m: string) => {
    switch(m) {
      case 'GET': return 'text-green-600';
      case 'POST': return 'text-blue-600';
      case 'DELETE': return 'text-red-600';
      case 'PUT': 
      case 'PATCH': return 'text-orange-500';
      default: return 'text-gray-600';
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-400 font-bold animate-pulse">Recuperando registros...</p>
    </div>
  );

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 px-4 text-black font-sans">
      <Toaster richColors position="top-right" />
      
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => router.push('/minhas_apis')} 
          className="group flex items-center gap-2 text-gray-400 hover:text-blue-600 font-black mb-10 transition-all uppercase text-xs tracking-widest"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Voltar ao Gerenciador
        </button>

        <div className="text-center mb-12">
          <AnimatePresence mode="wait">
            <motion.div 
              key={category} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="inline-flex items-center gap-2 bg-white px-5 py-2 rounded-full text-xs font-black mb-6 shadow-sm border border-gray-100 uppercase tracking-tighter"
            >
              <SelectedIcon className="w-4 h-4 text-blue-600" />
              {category || 'Sem Categoria'}
            </motion.div>
          </AnimatePresence>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Editar <span className="text-blue-600">Endpoint</span></h1>
          <p className="text-gray-500 font-medium mt-3 italic">ID: {apiId}</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-8 bg-white p-8 md:p-12 rounded-[3rem] border border-gray-100 shadow-2xl shadow-blue-900/5">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Título da API</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full p-5 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-blue-500/10 outline-none bg-gray-50/50 font-bold text-lg transition-all" 
                required 
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Método</label>
              <div className="relative">
                <select 
                  value={method} 
                  onChange={(e) => setMethod(e.target.value)} 
                  className={`w-full p-5 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none bg-gray-50/50 cursor-pointer font-black text-center ${getMethodColor(method)}`} 
                  required
                >
                  {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Categoria</label>
              <div className="relative">
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  className="w-full p-5 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none bg-gray-50/50 cursor-pointer font-bold" 
                  required
                >
                  <option value="" disabled>Selecione...</option>
                  {Object.keys(CATEGORY_MAP).sort().map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Parâmetros</label>
              <input 
                type="text" 
                value={parameters} 
                onChange={(e) => setParameters(e.target.value)} 
                placeholder="ex: api_key, city" 
                className="w-full p-5 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-blue-500/10 outline-none bg-gray-50/50 font-medium" 
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">URL Base</label>
            <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 font-bold">URL</div>
                <input 
                    type="text" 
                    value={endpoint} 
                    onChange={(e) => setEndpoint(e.target.value)} 
                    className="w-full pl-16 p-5 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-blue-500/10 outline-none bg-gray-50/50 font-bold text-blue-600" 
                    required 
                />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Documentação / Descrição</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="w-full p-6 h-40 rounded-3xl border border-gray-100 focus:ring-4 focus:ring-blue-500/10 outline-none bg-gray-50/50 resize-none font-medium leading-relaxed" 
              required 
            />
          </div>

          <div className="flex flex-wrap gap-4 py-4 border-t border-gray-50">
            <button type="button" onClick={() => setIsHttps(!isHttps)} className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all font-black text-[10px] tracking-[0.2em] ${isHttps ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
              <Shield className={`w-4 h-4 ${isHttps ? 'fill-green-600' : ''}`} />
              HTTPS {isHttps ? 'ATIVO' : 'INATIVO'}
            </button>

            <button type="button" onClick={() => setIsCors(!isCors)} className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all font-black text-[10px] tracking-[0.2em] ${isCors ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
              <Globe className={`w-4 h-4 ${isCors ? 'animate-pulse' : ''}`} />
              CORS {isCors ? 'SUPORTADO' : 'LIMITADO'}
            </button>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02, y: -2 }} 
            whileTap={{ scale: 0.98 }} 
            type="submit" 
            disabled={saving} 
            className={`w-full py-6 rounded-3xl text-white font-black text-xl shadow-2xl shadow-blue-200 flex items-center justify-center gap-4 bg-gradient-to-r ${selectedGradient} ${saving ? 'opacity-50 grayscale' : ''} transition-all uppercase tracking-widest`}
          >
            {saving ? <Loader2 className="animate-spin" size={28} /> : <Save size={28} />}
            {saving ? 'Sincronizando...' : 'Salvar Alterações'}
          </motion.button>
        </form>
      </div>
    </div>
  );
}