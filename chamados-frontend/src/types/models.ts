// src/types/models.ts


export const Role = {
  ROLE_NORMAL: 'ROLE_NORMAL',
  ROLE_TI: 'ROLE_TI',
  ROLE_ADM: 'ROLE_ADM',
} as const;

export type Role = typeof Role[keyof typeof Role];

export interface Setor {
  id: number;
  nome: string;
}

export interface Categoria {
  id: number;
  nome: string;
}

export interface Usuario {
  id: number;
  username: string;
  nome: string;
  email: string;
  role: Role; 
  ativo: boolean;
  password?: string;
}

export interface Chamado {
  id: number;
  titulo: string;
  descricao: string;
  status: string;
  dataAbertura: string;
  usuario: Usuario;
  categoria: Categoria;
  tecnico?: Usuario;
  setor?: Setor;
  dataConclusao?: string;
}