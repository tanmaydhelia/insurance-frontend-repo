export enum ERole {
  ROLE_USER = 'ROLE_USER',
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_PROVIDER = 'ROLE_PROVIDER',
  ROLE_AGENT = 'ROLE_AGENT'
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: ERole;
  token?: string;
}

export interface AuthResponse {
  token: string;
}