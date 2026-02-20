// src/services/api.ts
import axios from 'axios';
import type { Chamado, Categoria, Usuario, Setor, Role } from '../types/models';

// --- DTOs (Data Transfer Objects) ---
// Estes 'types' ajudam a garantir que estamos enviando os dados corretos
// para as funções de 'create' e 'update', com base no que os controllers esperam.

// Para criar, geralmente não enviamos o 'id'
export type CreateUsuarioDTO = Omit<Usuario, 'id'>;
export type CreateSetorDTO = Pick<Setor, 'nome'>;
export type CreateCategoriaDTO = Pick<Categoria, 'nome'>;
export type CreateChamadoDTO = Pick<Chamado, 'titulo' | 'descricao'> & {
  categoria: { id: number };
  setor?: { id: number };
  usuario?: { id: number }; 
};

// Para atualizar, enviamos apenas os campos que o controller atualiza
export type UpdateUsuarioDTO = Pick<Usuario, 'nome' | 'email' | 'password' | 'role'>;
export type UpdateSetorDTO = Pick<Setor, 'nome'>;
export type UpdateCategoriaDTO = Pick<Categoria, 'nome'>;
export type UpdateChamadoDTO = Pick<Chamado, 'descricao' | 'categoria' | 'setor' | 'status'> & {
  categoria: { id: number };
  setor?: { id: number };
};

// DTOs de autenticação
export type AuthRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
};


// --- Configuração da Instância do Axios ---

const api = axios.create({
  // Seus controllers estão na raiz (ex: "/usuarios"), não em "/api"
  // Ajuste a porta se o seu backend Java rodar em uma diferente (ex: 8080)
  baseURL: 'http://localhost:8080', 
});


/*
 * --------------------------------------------------------------------
 * ⚠️ ATENÇÃO: AUTENTICAÇÃO (O que está faltando)
 * --------------------------------------------------------------------
 * * Todos os seus controllers (menos Categoria) usam um MOCK: `usuarioAutenticado()`.
 * No mundo real, seu front-end precisará enviar um "Token de Autenticação" 
 * (como um JWT) a cada requisição para provar quem ele é.
 * * Quando você implementar o login:
 * 1. O front-end fará um POST para "/login" (você precisará criar esse endpoint).
 * 2. O backend retornará um token (ex: "Bearer ...").
 * 3. O front-end salvará esse token (no localStorage).
 * 4. Você usará o "interceptor" abaixo para adicionar esse token em *todas* * as requisições futuras automaticamente.
 * * Por enquanto, tudo vai funcionar por causa do MOCK no backend.
 * Deixei o código do interceptor comentado abaixo para o futuro:
 */


api.interceptors.request.use(
  (config) => {
    // Ignora o interceptor para a rota de login
    if (config.url === '/auth/login') {
      return config;
    }

    const token = localStorage.getItem('authToken'); // Onde vamos salvar o token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



// ---  Categoria Service (Mapeado de CategoriaController.java) ---

export const getCategorias = async (): Promise<Categoria[]> => {
  const response = await api.get<Categoria[]>('/categorias');
  return response.data;
};

export const getCategoriaById = async (id: number): Promise<Categoria> => {
  const response = await api.get<Categoria>(`/categorias/${id}`);
  return response.data;
};

export const createCategoria = async (data: CreateCategoriaDTO): Promise<Categoria> => {
  const response = await api.post<Categoria>('/categorias', data);
  return response.data;
};

export const updateCategoria = async (id: number, data: UpdateCategoriaDTO): Promise<Categoria> => {
  const response = await api.put<Categoria>(`/categorias/${id}`, data);
  return response.data;
};

export const deleteCategoria = async (id: number): Promise<void> => {
  await api.delete(`/categorias/${id}`);
};


// ---  Setor Service (Mapeado de SetorController.java) ---

export const getSetores = async (): Promise<Setor[]> => {
  const response = await api.get<Setor[]>('/setores');
  return response.data;
};

export const getSetorById = async (id: number): Promise<Setor> => {
  const response = await api.get<Setor>(`/setores/${id}`);
  return response.data;
};

export const createSetor = async (data: CreateSetorDTO): Promise<Setor> => {
  const response = await api.post<Setor>('/setores', data);
  return response.data;
};

export const updateSetor = async (id: number, data: UpdateSetorDTO): Promise<Setor> => {
  const response = await api.put<Setor>(`/setores/${id}`, data);
  return response.data;
};

export const deleteSetor = async (id: number): Promise<void> => {
  await api.delete(`/setores/${id}`);
};


// ---  Usuario Service (Mapeado de UsuarioController.java) ---

export const getUsuarios = async (): Promise<Usuario[]> => {
  const response = await api.get<Usuario[]>('/usuarios');
  return response.data;
};

export const getTecnicos = async (): Promise<Usuario[]> => {
  const response = await api.get<Usuario[]>('/usuarios/tecnicos');
  return response.data;
};

export const getUsuarioById = async (id: number): Promise<Usuario> => {
  const response = await api.get<Usuario>(`/usuarios/${id}`);
  return response.data;
};

export const createUsuario = async (data: CreateUsuarioDTO): Promise<Usuario> => {
  const response = await api.post<Usuario>('/usuarios', data);
  return response.data;
};

export const updateUsuario = async (id: number, data: UpdateUsuarioDTO): Promise<Usuario> => {
  const response = await api.put<Usuario>(`/usuarios/${id}`, data);
  return response.data;
};

export const deleteUsuario = async (id: number): Promise<void> => {
  await api.delete(`/usuarios/${id}`);
};

export const updateUsuarioRole = async (id: number, novoRole: Role) => {
  const response = await api.patch(`/usuarios/${id}/alterar-role?role=${novoRole}`);
  return response.data;
};




// ---  Chamado Service (Mapeado de ChamadoController.java) ---

export const getChamados = async (): Promise<Chamado[]> => {
  const response = await api.get<Chamado[]>('/chamados');
  return response.data;
};

export const getChamadoById = async (id: number): Promise<Chamado> => {
  const response = await api.get<Chamado>(`/chamados/${id}`);
  return response.data;
};

export const createChamado = async (data: CreateChamadoDTO): Promise<Chamado> => {
  const response = await api.post<Chamado>('/chamados', data);
  return response.data;
};

export const updateChamado = async (id: number, data: UpdateChamadoDTO): Promise<Chamado> => {
  const response = await api.put<Chamado>(`/chamados/${id}`, data);
  return response.data;
};


export const deleteChamado = async (id: number): Promise<void> => {
  await api.delete(`/chamados/${id}`);
};

export const updateChamadoStatus = async (id: number, status: string): Promise<Chamado> => {
  // @RequestParam vira 'params' no config do Axios
  const response = await api.patch<Chamado>(`/chamados/${id}/alterar-status`, null, {
    params: { status }
  });
  return response.data;
};

export const assumirChamado = async (id: number): Promise<Chamado> => {
  // O segundo 'null' é porque não estamos enviando um corpo (body)
  const response = await api.patch<Chamado>(`/chamados/${id}/assumir`, null);
  return response.data;
};

export const fecharChamado = async (id: number): Promise<Chamado> => {
  const response = await api.patch<Chamado>(`/chamados/${id}/fechar`, null);
  return response.data;
};

export const atribuirChamado = async (chamadoId: number, tecnicoId: number): Promise<Chamado> => {
  const response = await api.patch<Chamado>(`/chamados/${chamadoId}/atribuir`, null, {
    params: { tecnicoId } // Envia o ID do técnico como um @RequestParam
  });
  return response.data;
};

// ---  Auth Service (Mapeado de AuthController.java) ---
export const login = async (data: AuthRequest): Promise<AuthResponse> => {
  // O endpoint de login é PÚBLICO
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};