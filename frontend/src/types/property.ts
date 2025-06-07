export interface Property {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  owner: string;
  totalUnits: number;
  description?: string;
  yearBuilt?: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Tenant {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  moveInDate: string;
  isActive: boolean;
}

export interface Unit {
  _id: string;
  property: string;
  unitNumber: string;
  floor?: number;
  squareMeters: number;
  rooms: number;
  monthlyRent: number;
  currentTenant?: User;
  pendingTenant?: Tenant;
  status: 'vacant' | 'occupied' | 'maintenance';
  features?: string[];
  leaseStart?: string;
  leaseEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VermieterDashboardData {
  kpis: {
    totalProperties: number;
    totalUnits: number;
    occupiedUnits: number;
    occupancyRate: string;
    totalMonthlyRent: number;
    openMeldungen: number;
  };
  recentMeldungen: Array<{
    _id: string;
    title: string;
    status: string;
    priority: string;
    unit: Unit;
    reporter: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  }>;
}
