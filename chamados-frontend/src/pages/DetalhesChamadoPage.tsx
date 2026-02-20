// src/pages/DetalhesChamadoPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getChamadoById, 
  updateChamadoStatus, 
  fecharChamado,
  getTecnicos, 
  atribuirChamado 
} from '../services/api'; 
import type { Chamado, Usuario } from '../types/models'; 
import { jwtDecode } from 'jwt-decode'; 

interface UserToken {
  sub: string;
  nome: string;
  role: 'ROLE_ADM' | 'ROLE_TI' | 'ROLE_NORMAL';
}

// Componente de Badge (Reutilizado para consistência)
const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    'ABERTO': 'bg-amber-100 text-amber-800 border-amber-200',
    'EM_ANDAMENTO': 'bg-blue-100 text-blue-800 border-blue-200',
    'FECHADO': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'AGUARDANDO_USUARIO': 'bg-purple-100 text-purple-800 border-purple-200'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export function DetalhesChamadoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<'ROLE_ADM' | 'ROLE_TI' | 'ROLE_NORMAL' | null>(null);

  const [chamado, setChamado] = useState<Chamado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [editStatus, setEditStatus] = useState('');
  const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });
  const [tecnicos, setTecnicos] = useState<Usuario[]>([]);

  // --- EFFECT: BUSCAR DADOS ---
  useEffect(() => {
    if (!id) {
      setError("ID do chamado não encontrado.");
      setLoading(false);
      return;
    }

    let loggedInUserEmail: string | null = null;
    let loggedInUserRole: 'ROLE_ADM' | 'ROLE_TI' | 'ROLE_NORMAL' | null = null;
    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded = jwtDecode<UserToken>(token);
      loggedInUserRole = decoded.role;
      loggedInUserEmail = decoded.sub; 
      setUserRole(decoded.role);
    }
    
    const loadAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getChamadoById(Number(id));

        if (loggedInUserRole === 'ROLE_NORMAL' && loggedInUserEmail !== data.usuario.email) {
          setError("Acesso negado. Este chamado não pertence a você.");
          setLoading(false);
          setTimeout(() => { navigate('/usuario/dashboard'); }, 2000);
          return; 
        }

        setChamado(data);
        setEditStatus(data.status); 

        if (loggedInUserRole === 'ROLE_TI' || loggedInUserRole === 'ROLE_ADM') {
          const tecnicosData = await getTecnicos();
          setTecnicos(tecnicosData);
        }

      } catch (err: any) {
        console.error("Erro ao buscar dados:", err);
        if (err.response && err.response.status === 403) {
          setError("Você não tem permissão para ver este chamado.");
        } else {
          setError("Chamado não encontrado ou falha ao carregar.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
    
  }, [id, navigate]);

  // --- HANDLERS (Mantidos idênticos) ---
  const handleUpdateStatus = async (newStatus: string) => {
    if (!id || !chamado) return;
    setEditStatus(newStatus); 
    setUpdateMessage({ type: '', text: '' }); 
    try {
      const chamadoAtualizado = await updateChamadoStatus(chamado.id, newStatus);
      setChamado(chamadoAtualizado); 
      setUpdateMessage({ type: 'success', text: 'Status atualizado com sucesso!' });
      setTimeout(() => setUpdateMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      setUpdateMessage({ type: 'error', text: 'Falha ao atualizar o status.' });
      setEditStatus(chamado.status);
    }
  };

  const handleAtribuirChamado = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!chamado) return;
    const novoTecnicoId = e.target.value;
    setUpdateMessage({ type: '', text: '' });

    if (!novoTecnicoId || novoTecnicoId === "0") {
        console.log("Desatribuição não implementada");
        return;
    }

    try {
      const chamadoAtualizado = await atribuirChamado(chamado.id, Number(novoTecnicoId));
      setChamado(chamadoAtualizado); 
      setEditStatus(chamadoAtualizado.status);
      setUpdateMessage({ type: 'success', text: 'Técnico atribuído com sucesso!' });
      setTimeout(() => setUpdateMessage({ type: '', text: '' }), 3000);

    } catch (err: any) {
      console.error("Erro ao atribuir chamado:", err);
      setUpdateMessage({ type: 'error', text: 'Falha ao atribuir o chamado.' });
    }
  };

  const handleFecharChamado = async () => {
    if (!chamado) return;
    if (!window.confirm("Tem certeza que deseja fechar este chamado? Esta ação não pode ser desfeita.")) {
      return;
    }
    setUpdateMessage({ type: '', text: '' }); 
    try {
      const chamadoAtualizado = await fecharChamado(chamado.id);
      setChamado(chamadoAtualizado); 
      setEditStatus(chamadoAtualizado.status);
      setUpdateMessage({ type: 'success', text: 'Chamado fechado com sucesso!' });
    } catch (err: any) {
      console.error("Erro ao fechar chamado:", err);
      if (err.response && err.response.status === 409) {
        setUpdateMessage({ type: 'error', text: 'Este chamado já estava fechado.' });
      } else {
        setUpdateMessage({ type: 'error', text: 'Falha ao fechar o chamado.' });
      }
    }
  };

  // --- RENDER ---
  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-500 font-medium">Carregando detalhes...</div>;
  }

  if (error) {
    return <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100">{error}</div>;
  }

  if (!chamado) return null;

  return (
    <div className="max-w-6xl mx-auto pb-10">
      
      {/* Cabeçalho do Chamado */}
      <div className="mb-8 border-b border-slate-200 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-slate-400 font-mono text-sm uppercase">#{chamado.id}</span>
              <StatusBadge status={chamado.status} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 leading-tight">{chamado.titulo}</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Aberto em</p>
            <p className="font-medium text-slate-700">{new Date(chamado.dataAbertura).toLocaleDateString('pt-BR')} às {new Date(chamado.dataAbertura).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
        </div>
      </div>

      {/* Grid Principal: Conteúdo (Esq) vs Ações (Dir) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna da Esquerda: Detalhes */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card da Descrição */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Descrição do Problema</h3>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
              {chamado.descricao}
            </div>
          </div>

          {/* Grid de Metadados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Solicitante</p>
              <p className="font-semibold text-slate-800">{chamado.usuario.nome}</p>
              <p className="text-sm text-slate-500">{chamado.usuario.email}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Categoria & Setor</p>
               <div className="flex items-center gap-2">
                 <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-sm font-medium">{chamado.categoria.nome}</span>
                 {chamado.setor && <span className="text-slate-400 text-sm">• {chamado.setor.nome}</span>}
               </div>
            </div>
          </div>

          {/* Área de Resolução (Para Usuário Comum) */}
          {userRole === 'ROLE_NORMAL' && chamado.status !== 'FECHADO' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-700">O problema foi resolvido?</h4>
                <p className="text-sm text-slate-500">Se tudo estiver funcionando, você pode fechar este chamado.</p>
              </div>
              <button 
                onClick={handleFecharChamado}
                className="bg-white text-red-600 border border-red-200 font-bold py-2 px-6 rounded-lg hover:bg-red-50 hover:border-red-300 transition shadow-sm whitespace-nowrap"
              >
                Fechar Chamado
              </button>
            </div>
          )}
        </div>

        {/* Coluna da Direita: Painel de Controle (TI/ADM) */}
        <div className="space-y-6">
          
          {(userRole === 'ROLE_TI' || userRole === 'ROLE_ADM') ? (
            <div className="bg-white rounded-2xl shadow-lg shadow-blue-900/5 border border-blue-100 p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                <h3 className="text-lg font-bold text-slate-800">Painel do Técnico</h3>
              </div>

              {/* Feedback de Ação */}
              {updateMessage.text && (
                <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${updateMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {updateMessage.text}
                </div>
              )}

              <div className="space-y-5">
                {/* Alterar Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Alterar Status</label>
                  <div className="relative">
                    <select 
                      value={editStatus}
                      onChange={(e) => handleUpdateStatus(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    >
                      <option value="ABERTO">Aberto</option>
                      <option value="EM_ANDAMENTO">Em Andamento</option>
                      <option value="AGUARDANDO_USUARIO">Aguardando Usuário</option>
                      <option value="FECHADO">Fechado</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>

                {/* Atribuir Técnico */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Atribuir Responsável</label>
                  <div className="relative">
                    <select 
                      value={chamado.tecnico?.id || "0"} 
                      onChange={handleAtribuirChamado}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    >
                      <option value="0">-- Pendente --</option>
                      {tecnicos.map(tecnico => (
                        <option key={tecnico.id} value={tecnico.id}>
                          {tecnico.nome}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Sidebar para Usuário Normal (Status apenas leitura)
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Status Atual</h3>
              <div className="flex flex-col gap-4">
                 <div>
                    <p className="text-xs text-slate-500 mb-1">Situação</p>
                    <StatusBadge status={chamado.status} />
                 </div>
                 {chamado.tecnico && (
                   <div>
                      <p className="text-xs text-slate-500 mb-1">Técnico Responsável</p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                          {chamado.tecnico.nome.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-700">{chamado.tecnico.nome}</span>
                      </div>
                   </div>
                 )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}