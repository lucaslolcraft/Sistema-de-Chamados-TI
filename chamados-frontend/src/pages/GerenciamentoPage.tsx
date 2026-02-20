// src/pages/GerenciamentoPage.tsx
import { useState, useEffect } from 'react';
import type { Categoria, Setor, Usuario } from '../types/models';
import type { CreateUsuarioDTO, UpdateUsuarioDTO } from '../services/api';
import {
  getCategorias, createCategoria, updateCategoria, deleteCategoria,
  getSetores, createSetor, updateSetor, deleteSetor,
  getUsuarios, createUsuario, updateUsuario, deleteUsuario, updateUsuarioRole
} from '../services/api';

// Badge simples para identificar o tipo de usuário visualmente
const RoleBadge = ({ role }: { role: string }) => {
  const styles: Record<string, string> = {
    'ROLE_ADM': 'bg-purple-100 text-purple-700 border-purple-200',
    'ROLE_TI': 'bg-blue-100 text-blue-700 border-blue-200',
    'ROLE_NORMAL': 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${styles[role] || styles['ROLE_NORMAL']}`}>
      {role.replace('ROLE_', '')}
    </span>
  );
};

export function GerenciamentoPage() {
  // --- STATES (Mantidos iguais) ---
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setnewUserRole] = useState<'ROLE_ADM' | 'ROLE_TI' | 'ROLE_NORMAL'>('ROLE_NORMAL');

  const [newSectorName, setNewSectorName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- EFFECT ---
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersData, sectorsData, categoriesData] = await Promise.all([
        getUsuarios(),
        getSetores(),
        getCategorias()
      ]);
      setUsuarios(usersData);
      setSetores(sectorsData);
      setCategorias(categoriesData);
    } catch (err: any) {
      console.error("ERRO:", err);
      setError("Falha ao carregar dados. Verifique o console.");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS (Lógica mantida, apenas removido alerts nativos onde possível usar UI melhor no futuro) ---
  
  // USUÁRIOS
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword) {
      alert("Preencha todos os campos do usuário.");
      return;
    }
    const payload: CreateUsuarioDTO = {
      nome: newUserName,
      email: newUserEmail,
      username: newUserEmail,
      password: newUserPassword,
      role: newUserRole,
      ativo: true,
    };
    try {
      await createUsuario(payload);
      setNewUserName(''); setNewUserEmail(''); setNewUserPassword(''); setnewUserRole('ROLE_NORMAL');
      loadAllData();
    } catch (err) { alert("Erro ao criar usuário. Email duplicado?"); }
  };

  const handleUpdateUser = async (user: Usuario) => {
    // Mantive o prompt pela simplicidade do exemplo, mas em produção usaríamos um Modal
    const nome = window.prompt("Novo nome:", user.nome);
    const email = window.prompt("Novo email:", user.email);
    if (nome && email) {
      const payload: UpdateUsuarioDTO = {
        nome: nome,
        email: email,
        role: user.role,
        password: user.password
      };
      try { await updateUsuario(user.id, payload); loadAllData(); } catch(err) { alert("Erro ao atualizar."); }
    }
  };

  const handleChangeUserType = async (id: number, currentType: string) => {
    // Lógica cíclica simples: NORMAL -> TI -> ADM -> NORMAL
    let newType = 'ROLE_NORMAL';
    if (currentType === 'ROLE_NORMAL') newType = 'ROLE_TI';
    else if (currentType === 'ROLE_TI') newType = 'ROLE_ADM';
    
    if (window.confirm(`Alterar para ${newType}?`)) {
      try { await updateUsuarioRole(id, newType); loadAllData(); } catch (err) { alert("Erro ao mudar cargo."); }
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm(`Deletar usuário ID ${id}?`)) {
      try { await deleteUsuario(id); loadAllData(); } catch (err) { alert("Erro ao deletar."); }
    }
  };

  // SETORES
  const handleCreateSector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectorName) return;
    try { await createSetor({ nome: newSectorName }); setNewSectorName(''); loadAllData(); } catch (err) { alert("Erro ao criar setor."); }
  };
  const handleUpdateSector = async (id: number, currentName: string) => {
    const newName = window.prompt("Novo nome:", currentName);
    if (newName && newName !== currentName) {
      try { await updateSetor(id, { nome: newName }); loadAllData(); } catch (err) { alert("Erro atualizar setor."); }
    }
  };
  const handleDeleteSector = async (id: number) => {
    if (window.confirm("Deletar setor?")) {
      try { await deleteSetor(id); loadAllData(); } catch (err) { alert("Erro ao deletar setor."); }
    }
  };

  // CATEGORIAS
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    try { await createCategoria({ nome: newCategoryName }); setNewCategoryName(''); loadAllData(); } catch (err) { alert("Erro ao criar categoria."); }
  };
  const handleUpdateCategory = async (id: number, currentName: string) => {
    const newName = window.prompt("Novo nome:", currentName);
    if (newName && newName !== currentName) {
      try { await updateCategoria(id, { nome: newName }); loadAllData(); } catch (err) { alert("Erro atualizar categoria."); }
    }
  };
  const handleDeleteCategory = async (id: number) => {
    if (window.confirm("Deletar categoria?")) {
      try { await deleteCategoria(id); loadAllData(); } catch (err) { alert("Erro ao deletar categoria."); }
    }
  };


  // --- RENDER ---
  if (loading) return <div className="flex justify-center p-10 text-slate-500">Carregando painel...</div>;
  if (error) return <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100">{error}</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Painel de Gerenciamento</h1>
        <p className="text-slate-500 text-sm">Controle de acessos e configurações do sistema.</p>
      </div>

      {/* --- SEÇÃO: USUÁRIOS --- */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span> 
            Usuários do Sistema
          </h2>
          <span className="text-xs font-semibold bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">
            {usuarios.length} cadastrados
          </span>
        </div>

        <div className="p-6">
          {/* Formulário de Criação de Usuário */}
          <form onSubmit={handleCreateUser} className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Novo Usuário</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
              <div className="lg:col-span-1">
                <input 
                  type="text" 
                  placeholder="Nome Completo" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                />
              </div>
              <div className="lg:col-span-1">
                <input 
                  type="email" 
                  placeholder="Email (Login)" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                />
              </div>
              <div className="lg:col-span-1">
                <input 
                  type="password" 
                  placeholder="Senha" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                />
              </div>
              <div className="lg:col-span-1">
                <select 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={newUserRole} 
                  onChange={e => setnewUserRole(e.target.value as any)}
                >
                  <option value="ROLE_NORMAL">Normal</option>
                  <option value="ROLE_TI">Técnico TI</option>
                  <option value="ROLE_ADM">Admin</option>
                </select>
              </div>
              <div className="lg:col-span-1">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-sm transition shadow-sm">
                  + Adicionar
                </button>
              </div>
            </div>
          </form>

          {/* Lista de Usuários */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                  <th className="py-2 px-2">Usuário</th>
                  <th className="py-2 px-2">Cargo</th>
                  <th className="py-2 px-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {usuarios.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition group">
                    <td className="py-3 px-2">
                      <p className="text-sm font-semibold text-slate-800">{user.nome}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </td>
                    <td className="py-3 px-2">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="py-3 px-2 text-right space-x-2">
                      <button onClick={() => handleUpdateUser(user)} className="text-xs font-medium text-slate-500 hover:text-blue-600 transition">
                        Editar
                      </button>
                      <span className="text-slate-200">|</span>
                      <button onClick={() => handleChangeUserType(user.id, user.role)} className="text-xs font-medium text-slate-500 hover:text-purple-600 transition">
                        Mudar Cargo
                      </button>
                      <span className="text-slate-200">|</span>
                      <button onClick={() => handleDeleteUser(user.id)} className="text-xs font-bold text-red-400 hover:text-red-600 transition">
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Grid para Setores e Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* --- SEÇÃO: SETORES --- */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
          <div className="p-5 border-b border-slate-100 bg-slate-50">
             <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span> 
              Setores
            </h2>
          </div>
          <div className="p-5 flex-1 flex flex-col">
             <form onSubmit={handleCreateSector} className="flex gap-2 mb-4">
               <input 
                  type="text" 
                  placeholder="Novo Setor (ex: RH)" 
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={newSectorName}
                  onChange={e => setNewSectorName(e.target.value)}
               />
               <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition">
                 Criar
               </button>
             </form>

             <div className="flex-1 overflow-y-auto max-h-64 space-y-1 pr-2">
                {setores.map(sector => (
                  <div key={sector.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:border-emerald-200 hover:bg-emerald-50/30 transition group">
                    <span className="text-sm font-medium text-slate-700">{sector.nome}</span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleUpdateSector(sector.id, sector.nome)} className="text-xs text-slate-400 hover:text-emerald-600">Editar</button>
                      <button onClick={() => handleDeleteSector(sector.id)} className="text-xs text-red-300 hover:text-red-500">Excluir</button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* --- SEÇÃO: CATEGORIAS --- */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
          <div className="p-5 border-b border-slate-100 bg-slate-50">
             <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span> 
              Categorias
            </h2>
          </div>
          <div className="p-5 flex-1 flex flex-col">
             <form onSubmit={handleCreateCategory} className="flex gap-2 mb-4">
               <input 
                  type="text" 
                  placeholder="Nova Categoria (ex: Hardware)" 
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
               />
               <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition">
                 Criar
               </button>
             </form>

             <div className="flex-1 overflow-y-auto max-h-64 space-y-1 pr-2">
                {categorias.map(cat => (
                  <div key={cat.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:border-amber-200 hover:bg-amber-50/30 transition group">
                    <span className="text-sm font-medium text-slate-700">{cat.nome}</span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleUpdateCategory(cat.id, cat.nome)} className="text-xs text-slate-400 hover:text-amber-600">Editar</button>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="text-xs text-red-300 hover:text-red-500">Excluir</button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </section>

      </div>
    </div>
  );
}