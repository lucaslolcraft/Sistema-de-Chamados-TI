// src/pages/NovoChamadoPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategorias, getSetores, createChamado } from '../services/api';
import type { Categoria, Setor } from '../types/models';
// Importamos o tipo DTO que definimos na api.ts (se não tiver exportado lá, defina aqui ou use 'any')
import type { CreateChamadoDTO } from '../services/api'; 

export function NovoChamadoPage() {
  const navigate = useNavigate();

  // --- STATES PARA OS DADOS DAS LISTAS ---
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);

  // --- STATES PARA O FORMULÁRIO ---
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [setorId, setSetorId] = useState(''); 

  // --- STATES DE CONTROLE ---
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // --- EFFECT: Buscar dados dos Dropdowns ---
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setLoading(true);
        const [categoriasData, setoresData] = await Promise.all([
          getCategorias(),
          getSetores()
        ]);
        setCategorias(categoriasData);
        setSetores(setoresData);
      } catch (err) {
        setError("Erro ao carregar dados do formulário. Tente recarregar a página.");
      } finally {
        setLoading(false);
      }
    };
    loadDropdownData();
  }, []); 

  // --- HANDLER: Enviar o Formulário ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validação Simples
    if (!titulo || !descricao || !categoriaId) {
      setError("Por favor, preencha Título, Descrição e Categoria.");
      return;
    }

    setSubmitting(true);

    // Montar Payload
    const payload: CreateChamadoDTO = {
      titulo: titulo,
      descricao: descricao,
      categoria: { id: Number(categoriaId) },
    };

    if (setorId) {
      payload.setor = { id: Number(setorId) };
    }

    try {
      await createChamado(payload);
      setSuccess("Chamado criado com sucesso! Redirecionando...");
      
      // Limpa campos
      setTitulo('');
      setDescricao('');
      setCategoriaId('');
      setSetorId('');
      
      setTimeout(() => {
        navigate('/usuario/dashboard');
      }, 2000);

    } catch (err) {
      setError("Erro ao criar chamado. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- RENDER ---
  if (loading) {
    return <div className="flex justify-center p-10 text-slate-500 font-medium">Carregando formulário...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto pb-10">
      
      {/* Cabeçalho Simples */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Abrir Novo Chamado</h1>
        <p className="text-slate-500 text-sm">Descreva seu problema para que nossa equipe possa ajudar.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* --- TÍTULO --- */}
          <div>
            <label htmlFor="titulo" className="block text-sm font-bold text-slate-700 mb-2">
              Título (Resumo)
            </label>
            <input
              id="titulo"
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Impressora do RH não conecta"
              disabled={submitting}
            />
          </div>

          {/* --- GRID PARA SELECTS --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categoria */}
            <div>
              <label htmlFor="categoria" className="block text-sm font-bold text-slate-700 mb-2">
                Categoria <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="categoria"
                  className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition cursor-pointer"
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  disabled={submitting}
                >
                  <option value="">Selecione...</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
                {/* Ícone de seta customizado */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* Setor */}
            <div>
              <label htmlFor="setor" className="block text-sm font-bold text-slate-700 mb-2">
                Setor Ocorrente <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <div className="relative">
                <select
                  id="setor"
                  className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition cursor-pointer"
                  value={setorId}
                  onChange={(e) => setSetorId(e.target.value)}
                  disabled={submitting}
                >
                  <option value="">-- Nenhum --</option>
                  {setores.map((setor) => (
                    <option key={setor.id} value={setor.id}>{setor.nome}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* --- DESCRIÇÃO --- */}
          <div>
            <label htmlFor="descricao" className="block text-sm font-bold text-slate-700 mb-2">
              Descrição Detalhada
            </label>
            <textarea
              id="descricao"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition h-40 resize-y"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o problema com o máximo de detalhes possível..."
              disabled={submitting}
            />
          </div>

          {/* --- MENSAGENS DE FEEDBACK --- */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-100 text-sm font-medium animate-pulse">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 text-sm font-medium">
              {success}
            </div>
          )}

          {/* --- BOTÃO DE ENVIO --- */}
          <button 
            type="submit" 
            className={`w-full font-bold py-4 rounded-xl shadow-lg shadow-blue-100 transition-all transform flex justify-center items-center gap-2
              ${submitting || loading 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5'
              }`}
            disabled={submitting || loading}
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </>
            ) : (
              'Criar Chamado Técnico'
            )}
          </button>

        </form>
      </div>
    </div>
  );
}