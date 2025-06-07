export enum UserRole {
  VERMIETER = 'vermieter',
  MIETER = 'mieter',
  HANDWERKER = 'handwerker'
}

export interface User {
  _id: string;
  id?: string;
  userId?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  createdAt?: string;
  lastLogin?: string;
  assignedUnit?: string; // Reference to a Unit ID
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
