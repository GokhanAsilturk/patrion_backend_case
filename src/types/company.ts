export interface Company {
  id: number;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyInput {
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
}

export interface CompanyResponse {
  id: number;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
} 