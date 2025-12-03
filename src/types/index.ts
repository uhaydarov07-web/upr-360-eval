export type UserRole = 'admin' | 'manager';

export type Rating = 'A' | 'B' | 'C' | null;

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  branchId?: string;
}

export interface Branch {
  id: string;
  name: string;
  managerId?: string;
  managerName?: string;
}

export interface Employee {
  id: string;
  fullName: string;
  position: string;
  branchId: string;
  branchName: string;
  rating: Rating;
  evaluatedAt?: string;
  evaluatedBy?: string;
}

export interface EvaluationStats {
  total: number;
  evaluated: number;
  ratingA: number;
  ratingB: number;
  ratingC: number;
}

export interface BranchStats extends EvaluationStats {
  branchId: string;
  branchName: string;
}
