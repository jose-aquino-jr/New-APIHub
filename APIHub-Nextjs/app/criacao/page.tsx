"use client";

import { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Shield, Globe, ChevronDown, 
  PawPrint, Languages, Database, GraduationCap, Book, 
  ShoppingCart, Cloud, Smile, Image, DollarSign, Users, 
  MapPin, Camera, MessageCircle, Music, Gamepad2, Brain, 
  Code, Mail, Calendar, BarChart3, Smartphone, LucideIcon,
  Check, Loader2, Code2
} from 'lucide-react';

// --- CONFIGURAÇÕES E MAPEAMENTOS ---

interface CategoryConfig {
  color: string;
  icon: LucideIcon;
}

const CATEGORY_MAP: Record<string, CategoryConfig> = {
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

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const METHOD_STYLES: Record<string, string> = {
  GET: 'border-green-500 text-green-600 bg-green-50',
  POST: 'border-blue-500 text-blue-600 bg-blue-50',
  PUT: 'border-amber-500 text-amber-600 bg-amber-50',
  PATCH: 'border-purple-500 text-purple-600 bg-purple-50',
  DELETE: 'border-red-500 text-red-600 bg-red-50',
};

export default function CriacaoAPI() {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [parameters, setParameters] = useState('');
  const [category, setCategory] = useState('');
  const [selectedMethods, setSelectedMethods] = useState<string[]>(['GET']);
  const [isHttps, setIsHttps] = useState(true);
  const [isCors, setIsCors] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const toggleMethod = (method: string) => {
    setSelectedMethods(prev => 
      prev.includes(method) 
        ? (prev.length > 1 ? prev.filter(m => m !== method) : prev) 
        : [...prev, method]
    );
  };

  const categoryData = CATEGORY_MAP[category] || { color: 'from-blue-600 to-purple-600', icon: Database };
  const SelectedIcon = categoryData.icon;
  const selectedGradient = categoryData.color;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!name || !description || !endpoint || !category) {
      toast.error('Campos obrigatórios faltando');
      return;
    }

    setEnviando(true);

    try {
      // Sincronização de Token unificada
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const payload = {
        name,
        description,
        base_url: endpoint,
        method: selectedMethods.join(','), 
        tags: category,
        https: isHttps,
        cors: isCors,
        authentication_type: 'none',
        parameters: parameters,
      };

      const response = await fetch('https://apihub-br.duckdns.org/apis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('API Publicada!', { 
          description: `${name} agora faz parte do catálogo oficial.` 
        });
        router.push('/academy/dashboard');
      } else {
        throw new Error(data.detail || data.message || 'Erro ao processar requisição');
      }
    } catch (error: any) {
      toast.error('Erro na publicação', { description: error.message });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-12 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 px-4 text-black">
      <Toaster richColors position="top-right" />
      
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <AnimatePresence mode="wait">
            <motion.div 
              key={category}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm font-bold mb-4 shadow-sm border border-gray-100 text-gray-700"
            >
              <SelectedIcon className="w-4 h-4 text-blue-600" />
              {category || 'Nova API'}
            </motion.div>
          </AnimatePresence>
          
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Publicar no <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Catálogo</span>
          </h1>
          <p className="text-gray-500 mt-2">Sua API será listada para toda a comunidade Dev.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 md:p-10 rounded-[2.5rem] border border-gray-200 shadow-xl shadow-blue-900/5">
          
          {/* SELETOR DE MÉTODOS HTTP */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
              <Code2 size={18} className="text-blue-600" /> Métodos Disponíveis
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              {HTTP_METHODS.map((m) => {
                const active = selectedMethods.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMethod(m)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all border-2 ${
                      active 
                        ? `${METHOD_STYLES[m]} border-current scale-105 shadow-md` 
                        : 'bg-white border-transparent text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {active && <Check size={14} />}
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Nome da API</label>
              <input 
                required
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: API de Clima Real"
                className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Categoria</label>
              <div className="relative">
                <select 
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-gray-50/50 cursor-pointer"
                >
                  <option value="">Selecione uma categoria...</option>
                  {Object.keys(CATEGORY_MAP).sort().map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Descrição</label>
            <textarea 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva as funcionalidades..."
              className="w-full p-4 h-28 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">URL Base (Endpoint)</label>
              <input 
                required
                type="text" 
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://api.exemplo.com"
                className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Parâmetros (opcional)</label>
              <input 
                type="text" 
                value={parameters}
                onChange={(e) => setParameters(e.target.value)}
                placeholder="Ex: key, city, lang"
                className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 py-2">
            <button
              type="button"
              onClick={() => setIsHttps(!isHttps)}
              className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border-2 transition-all ${isHttps ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
            >
              <Shield className={`w-4 h-4 ${isHttps ? 'text-green-500' : ''}`} />
              <span className="text-xs font-black uppercase">HTTPS</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCors(!isCors)}
              className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border-2 transition-all ${isCors ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
            >
              <Globe className={`w-4 h-4 ${isCors ? 'text-blue-500' : ''}`} />
              <span className="text-xs font-black uppercase">CORS</span>
            </button>
          </div>

          {/* LIVE PREVIEW - NOVO */}
          <div className="p-4 bg-gray-900 rounded-2xl border border-gray-800 space-y-2">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">URL Preview</p>
            <code className="text-blue-400 text-xs break-all">
              {endpoint || 'https://api.exemplo.com'}{parameters ? `?${parameters.replace(/\s/g, '')}=value` : ''}
            </code>
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={enviando}
            type="submit"
            className={`w-full py-5 rounded-[1.5rem] text-white font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 bg-gradient-to-r ${selectedGradient} ${enviando ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {enviando ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Publicando API...
              </>
            ) : (
              <>
                Cadastrar no Catálogo
                <Zap className="w-6 h-6 fill-white" />
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}