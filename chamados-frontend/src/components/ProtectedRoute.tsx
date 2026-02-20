// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface UserToken {
  sub: string;
  nome: string;
  role: 'ROLE_ADM' | 'ROLE_TI' | 'ROLE_NORMAL'; // <-- Trocamos 'tipo' por 'role'
  exp: number; 
}

// O 'role' é opcional. Se for 'TI', só deixa 'TI' passar.
// Se não for passado, só checa se está logado.
type ProtectedRouteProps = {
  role?: 'TI';
};

export function ProtectedRoute({ role }: ProtectedRouteProps) {
  const token = localStorage.getItem('authToken');

  if (!token) {
    // 1. Não tem token? Manda para o login.
    return <Navigate to="/login" replace />;
  }

  // 2. Tem token, vamos checar o 'role' (se for exigido)
  if (role === 'TI') {
    try {
      const usuario = jwtDecode<UserToken>(token);
      if (usuario.role !== 'ROLE_TI' && usuario.role !== 'ROLE_ADM') {
        // 3. É usuário "NORMAL" tentando acessar área de "TI"?
        // Manda ele para o dashboard dele.
        return <Navigate to="/usuario/dashboard" replace />;
      }
    } catch (e) {
      // 4. Token inválido? Manda para o login.
      localStorage.removeItem('authToken');
      return <Navigate to="/login" replace />;
    }
  }
  
  // 5. Se passou em tudo, renderiza o "molde" (o AppLayout)
  // que por sua vez renderiza a página filha (o <Outlet />)
  return <Outlet />;
}