// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { GerenciamentoPage } from './pages/GerenciamentoPage';
import { DashboardTIPage } from './pages/DashboardTIPage';
import { DashboardUsuarioPage } from './pages/DashboardUsuarioPage';
import { NovoChamadoPage } from './pages/NovoChamadoPage';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DetalhesChamadoPage } from './pages/DetalhesChamadoPage'; // Importado aqui

function App() {
  return (
    <Routes>
      {/* Rota 1: Página de Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rota 2: Rotas do Usuário "TI" (Protegidas por role='TI') */}
      <Route element={<ProtectedRoute role="TI" />}>
        <Route element={<AppLayout />}>
          <Route path="/ti/dashboard" element={<DashboardTIPage />} />
          <Route path="/ti/gerenciamento" element={<GerenciamentoPage />} />
          {/* --- NOVA ROTA TI --- */}
          {/* O ":id" na URL se torna um parâmetro que podemos ler */}
          <Route path="/ti/chamado/:id" element={<DetalhesChamadoPage />} /> 
          {/* -------------------- */}
        </Route>
      </Route>

      {/* Rota 3: Rotas do Usuário "NORMAL" (Protegidas) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/usuario/dashboard" element={<DashboardUsuarioPage />} />
          <Route path="/usuario/novo-chamado" element={<NovoChamadoPage />} />
          {/* --- NOVA ROTA NORMAL --- */}
          <Route path="/usuario/chamado/:id" element={<DetalhesChamadoPage />} />
          {/* ----------------------- */}
        </Route>
      </Route>

      {/* Rota 4: Rota "Padrão" */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

export default App;