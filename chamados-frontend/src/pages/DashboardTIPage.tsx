// src/pages/DashboardTIPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getChamados } from '../services/api';
import type { Chamado } from '../types/models';

// Componente Interno para os Badges de Status
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

// Componente para o ícone de ordenação
const SortIcon = ({ active, direction }: { active: boolean; direction: 'asc' | 'desc' }) => {
  if (!active) {
    return (
      <svg className="w-3 h-3 text-slate-300 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }
  return direction === 'asc' ? (
    <svg className="w-3 h-3 text-blue-600 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg className="w-3 h-3 text-blue-600 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  );
};

// Tipo para a configuração de ordenação
type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

export function DashboardTIPage() {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para controlar a ordenação
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  useEffect(() => {
    const loadChamados = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getChamados();
        setChamados(data);
      } catch (err: any) {
        if (err.response && err.response.status === 403) {
          setError("Acesso negado. Você não tem permissão para ver esta página.");
        } else {
          setError("Falha ao carregar os chamados.");
        }
      } finally {
        setLoading(false);
      }
    };
    loadChamados();
  }, []);

  // Função para solicitar ordenação ao clicar no cabeçalho
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Lógica de ordenação (useMemo para otimizar e não reordenar sem necessidade)
  const sortedChamados = useMemo(() => {
    if (!sortConfig) return chamados;

    return [...chamados].sort((a: any, b: any) => {
      // Função auxiliar para acessar propriedades aninhadas (ex: usuario.nome)
      const getValue = (obj: any, path: string) => {
        return path.split('.').reduce((o, i) => (o ? o[i] : null), obj);
      };

      const aValue = getValue(a, sortConfig.key);
      const bValue = getValue(b, sortConfig.key);

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [chamados, sortConfig]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 font-medium">
        Carregando fila de chamados...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100">
        {error}
      </div>
    );
  }

  // Helper para renderizar o cabeçalho clicável
  const renderSortableHeader = (label: string, sortKey: string) => {
    const isActive = sortConfig?.key === sortKey;
    return (
      <th 
        className="px-6 py-4 font-bold cursor-pointer hover:bg-slate-100 transition select-none group"
        onClick={() => requestSort(sortKey)}
      >
        <div className="flex items-center">
          {label}
          <SortIcon active={isActive} direction={sortConfig?.direction || 'asc'} />
        </div>
      </th>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Fila de Chamados (TI)</h2>
        <span className="text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-lg">
          {sortedChamados.length} chamados ativos
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
              {renderSortableHeader("Título", "titulo")}
              {renderSortableHeader("Status", "status")}
              {renderSortableHeader("Solicitante", "usuario.nome")}
              {renderSortableHeader("Categoria", "categoria.nome")}
              {renderSortableHeader("Data de Abertura", "dataAbertura")}
              <th className="px-6 py-4 font-bold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedChamados.map((chamado) => (
              <tr key={chamado.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <span className="font-semibold text-slate-800 block">{chamado.titulo}</span>
                  <span className="text-xs text-slate-400">ID: #{chamado.id}</span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={chamado.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-700 font-medium">{chamado.usuario.nome}</span>
                    <span className="text-xs text-slate-400">{chamado.usuario.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {chamado.categoria.nome}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(chamado.dataAbertura).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    to={`/ti/chamado/${chamado.id}`} 
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-bold text-sm transition"
                  >
                    Ver Detalhes
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedChamados.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <p className="text-lg">Nenhum chamado encontrado na fila.</p>
            <p className="text-sm">Tudo em dia por aqui!</p>
          </div>
        )}
      </div>
    </div>
  );
}