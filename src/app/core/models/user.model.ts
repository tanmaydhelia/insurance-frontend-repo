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
  active?: boolean;  // Account status (true=active, false=suspended)
}

// Request to create a staff user via admin
export interface ICreateStaffRequest {
  name: string;
  email: string;
  password: string;
  role: ERole;
}

// Request to update user details
export interface IUpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: ERole;
}

export interface IAuthRequest {
  email: string;
  password: string;
}

export interface IChangePasswordRequest {
  email: string;
  oldPassword: string;
  newPassword: string;
}