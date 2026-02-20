// src/pages/DashboardUsuarioPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getChamados } from '../services/api';
import type { Chamado } from '../types/models';

// Componente visual para os Status (O mesmo usado no TI)
const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    'ABERTO': 'bg-amber-100 text-amber-700 border-amber-200',
    'EM_ANDAMENTO': 'bg-blue-100 text-blue-700 border-blue-200',
    'FECHADO': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'AGUARDANDO_USUARIO': 'bg-purple-100 text-purple-700 border-purple-200'
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export function DashboardUsuarioPage() {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChamados = async () => {
      try {
        setLoading(true);
        setError(null);
        // O backend filtra automaticamente pelo usuário logado
        const data = await getChamados(); 
        setChamados(data);
      } catch (err: any) {
        console.error("Erro ao buscar chamados:", err);
        setError("Falha ao carregar seus chamados.");
      } finally {
        setLoading(false);
      }
    };
    loadChamados();
  }, []);

  // --- Renderização de Loading ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 font-medium">
        Carregando seus chamados...
      </div>
    );
  }

  // --- Renderização de Erro ---
  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página com Botão de Ação */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Meus Chamados</h2>
          <p className="text-slate-500 text-sm mt-1">Acompanhe o status das suas solicitações</p>
        </div>
        
        {/* Botão de Novo Chamado destacado */}
        <Link 
          to="/usuario/novo-chamado" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg shadow-blue-100 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
        >
          <span className="text-xl leading-none">+</span> Abrir Novo Chamado
        </Link>
      </div>

      {/* Card da Tabela */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-bold">Título</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold">Categoria</th>
              <th className="px-6 py-4 font-bold">Setor</th>
              <th className="px-6 py-4 font-bold">Data</th>
              <th className="px-6 py-4 font-bold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {chamados.map((chamado) => (
              <tr key={chamado.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <span className="font-semibold text-slate-800 block">{chamado.titulo}</span>
                  <span className="text-xs text-slate-400">ID: #{chamado.id}</span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={chamado.status} />
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {chamado.categoria.nome}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {chamado.setor?.nome || <span className="text-slate-300 italic">N/A</span>}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(chamado.dataAbertura).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    to={`/usuario/chamado/${chamado.id}`} 
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-bold text-sm transition"
                  >
                    Ver Detalhes
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Estado Vazio (Empty State) */}
        {chamados.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400 text-2xl">
              🎫
            </div>
            <h3 className="text-lg font-bold text-slate-700">Você ainda não tem chamados</h3>
            <p className="text-slate-500 text-sm mb-6">Precisa de ajuda com algo? Abra um novo ticket agora.</p>
            <Link 
              to="/usuario/novo-chamado" 
              className="text-blue-600 font-semibold hover:underline"
            >
              Criar meu primeiro chamado
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}