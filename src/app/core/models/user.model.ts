export enum ERole {
  ROLE_USER = 'ROLE_USER',
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_PROVIDER = 'ROLE_PROVIDER',
  ROLE_AGENT = 'ROLE_AGENT',
  ROLE_CLAIMS_OFFICER = 'ROLE_CLAIMS_OFFICER'
}

export interface IUser {
  id?: number;
  username?: string; 
  name: string;      
  email: string;
  password?: string; 
  role: ERole;
}

export interface IAuthRequest {
  username: string;
  password: string;
}

export interface IChangePasswordRequest {
  username: string;
  oldPassword: string;
  newPassword: string;
}