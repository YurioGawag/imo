export enum UserRole {
  VERMIETER = 'vermieter',
  MIETER = 'mieter',
  HANDWERKER = 'handwerker'
}

export interface User {
  _id: string;
  id?: string; // Alias für _id für Kompatibilität
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  createdAt?: string; // Optional gemacht
  lastLogin?: string;
}
