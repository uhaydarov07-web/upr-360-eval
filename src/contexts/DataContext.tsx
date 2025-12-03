import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Branch, Employee, Rating, EvaluationStats, BranchStats } from '@/types';

interface DataContextType {
  branches: Branch[];
  employees: Employee[];
  updateEmployeeRating: (employeeId: string, rating: Rating, evaluatedBy: string) => void;
  getEmployeesByBranch: (branchId: string) => Employee[];
  getBranchStats: (branchId: string) => EvaluationStats;
  getOverallStats: () => EvaluationStats;
  getAllBranchStats: () => BranchStats[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Demo data
const DEMO_BRANCHES: Branch[] = [
  { id: 'branch-1', name: 'Toshkent filiali', managerId: 'manager-1', managerName: 'Toshkent filiali boshqaruvchisi' },
  { id: 'branch-2', name: 'Samarqand filiali', managerId: 'manager-2', managerName: 'Samarqand filiali boshqaruvchisi' },
  { id: 'branch-3', name: 'Buxoro filiali' },
  { id: 'branch-4', name: 'Andijon filiali' },
  { id: 'branch-5', name: 'Farg\'ona filiali' },
  { id: 'branch-6', name: 'Namangan filiali' },
  { id: 'branch-7', name: 'Xorazm filiali' },
  { id: 'branch-8', name: 'Navoiy filiali' },
  { id: 'branch-9', name: 'Qashqadaryo filiali' },
  { id: 'branch-10', name: 'Surxondaryo filiali' },
];

const generateEmployees = (): Employee[] => {
  const positions = ['Menejer', 'Kassir', 'Konsultant', 'Operatsionist', 'Hisobchi', 'Xavfsizlik xodimi'];
  const firstNames = ['Aziz', 'Bekzod', 'Dilshod', 'Eldor', 'Farrux', 'Gulnora', 'Hilola', 'Iroda', 'Javlon', 'Kamola'];
  const lastNames = ['Karimov', 'Rahimov', 'Toshmatov', 'Umarov', 'Xoliqov', 'Yusupov', 'Zokirov', 'Aliyev', 'Boboev', 'Davronov'];
  
  const employees: Employee[] = [];
  let employeeCount = 0;
  
  DEMO_BRANCHES.forEach((branch) => {
    const branchEmployeeCount = Math.floor(Math.random() * 15) + 15; // 15-30 employees per branch
    for (let i = 0; i < branchEmployeeCount; i++) {
      employeeCount++;
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const randomRating = Math.random();
      let rating: Rating = null;
      if (randomRating < 0.3) {
        rating = ['A', 'B', 'C'][Math.floor(Math.random() * 3)] as Rating;
      }
      
      employees.push({
        id: `emp-${employeeCount}`,
        fullName: `${firstName} ${lastName}`,
        position: positions[Math.floor(Math.random() * positions.length)],
        branchId: branch.id,
        branchName: branch.name,
        rating,
        evaluatedAt: rating ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      });
    }
  });
  
  return employees;
};

const INITIAL_EMPLOYEES = generateEmployees();

export function DataProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  const updateEmployeeRating = (employeeId: string, rating: Rating, evaluatedBy: string) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId
          ? { ...emp, rating, evaluatedAt: new Date().toISOString(), evaluatedBy }
          : emp
      )
    );
  };

  const getEmployeesByBranch = (branchId: string) => {
    return employees.filter((emp) => emp.branchId === branchId);
  };

  const getBranchStats = (branchId: string): EvaluationStats => {
    const branchEmployees = getEmployeesByBranch(branchId);
    return {
      total: branchEmployees.length,
      evaluated: branchEmployees.filter((e) => e.rating !== null).length,
      ratingA: branchEmployees.filter((e) => e.rating === 'A').length,
      ratingB: branchEmployees.filter((e) => e.rating === 'B').length,
      ratingC: branchEmployees.filter((e) => e.rating === 'C').length,
    };
  };

  const getOverallStats = (): EvaluationStats => {
    return {
      total: employees.length,
      evaluated: employees.filter((e) => e.rating !== null).length,
      ratingA: employees.filter((e) => e.rating === 'A').length,
      ratingB: employees.filter((e) => e.rating === 'B').length,
      ratingC: employees.filter((e) => e.rating === 'C').length,
    };
  };

  const getAllBranchStats = (): BranchStats[] => {
    return DEMO_BRANCHES.map((branch) => ({
      branchId: branch.id,
      branchName: branch.name,
      ...getBranchStats(branch.id),
    }));
  };

  return (
    <DataContext.Provider
      value={{
        branches: DEMO_BRANCHES,
        employees,
        updateEmployeeRating,
        getEmployeesByBranch,
        getBranchStats,
        getOverallStats,
        getAllBranchStats,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
