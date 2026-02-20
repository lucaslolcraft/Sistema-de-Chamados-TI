// src/components/AppLayout.tsx
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export function AppLayout() {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  const usuario = jwtDecode<any>(token || '');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-slate-800 text-blue-400">
          IT Support
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {usuario.role === 'ROLE_TI' || usuario.role === 'ROLE_ADM' ? (
            <>
              <Link to="/ti/dashboard" className="block px-4 py-2 rounded hover:bg-slate-800 transition">Fila de Chamados</Link>
              <Link to="/ti/gerenciamento" className="block px-4 py-2 rounded hover:bg-slate-800 transition">Gerenciamento</Link>
            </>
          ) : (
            <>
              <Link to="/usuario/dashboard" className="block px-4 py-2 rounded hover:bg-slate-800 transition">Meus Chamados</Link>
              <Link to="/usuario/novo-chamado" className="block px-4 py-2 rounded hover:bg-slate-800 transition text-blue-400 font-medium">+ Abrir Chamado</Link>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-400 uppercase font-semibold">Usuário</p>
          <p className="text-sm truncate">{usuario.nome}</p>
          <button onClick={handleLogout} className="mt-2 text-xs text-red-400 hover:text-red-300">Sair da conta</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white h-16 border-b border-slate-200 flex items-center px-8 justify-between">
          <h2 className="text-lg font-semibold text-slate-700 uppercase tracking-wider text-sm">Dashboard</h2>
          <div className="flex items-center gap-4 text-sm text-slate-500">
             <span></span>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}