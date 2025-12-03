import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Rating = 'A' | 'B' | 'C' | null;

export interface Branch {
  id: string;
  name: string;
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

interface DataContextType {
  branches: Branch[];
  employees: Employee[];
  isLoading: boolean;
  updateEmployeeRating: (employeeId: string, rating: Rating, evaluatedBy: string) => Promise<void>;
  getEmployeesByBranch: (branchId: string) => Employee[];
  getBranchStats: (branchId: string) => EvaluationStats;
  getOverallStats: () => EvaluationStats;
  getAllBranchStats: () => BranchStats[];
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // Fetch branches
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('*')
        .order('name');

      if (branchesError) {
        console.error('Error fetching branches:', branchesError);
      } else {
        setBranches(branchesData?.map(b => ({ id: b.id, name: b.name })) || []);
      }

      // Fetch employees with their evaluations
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select(`
          *,
          branches(name),
          evaluations(rating, evaluated_at, evaluated_by)
        `)
        .order('full_name');

      if (employeesError) {
        console.error('Error fetching employees:', employeesError);
      } else {
        const mappedEmployees: Employee[] = (employeesData || []).map((emp) => {
          const evaluation = emp.evaluations?.[0];
          return {
            id: emp.id,
            fullName: emp.full_name,
            position: emp.position,
            branchId: emp.branch_id,
            branchName: emp.branches?.name || '',
            rating: (evaluation?.rating as Rating) || null,
            evaluatedAt: evaluation?.evaluated_at,
            evaluatedBy: evaluation?.evaluated_by,
          };
        });
        setEmployees(mappedEmployees);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateEmployeeRating = async (employeeId: string, rating: Rating, evaluatedBy: string) => {
    try {
      // Check if evaluation exists
      const { data: existing } = await supabase
        .from('evaluations')
        .select('id')
        .eq('employee_id', employeeId)
        .maybeSingle();

      if (existing) {
        // Update existing evaluation
        const { error } = await supabase
          .from('evaluations')
          .update({
            rating,
            evaluated_by: evaluatedBy,
            evaluated_at: new Date().toISOString(),
          })
          .eq('employee_id', employeeId);

        if (error) throw error;
      } else {
        // Insert new evaluation
        const { error } = await supabase
          .from('evaluations')
          .insert({
            employee_id: employeeId,
            rating,
            evaluated_by: evaluatedBy,
          });

        if (error) throw error;
      }

      // Update local state
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employeeId
            ? { ...emp, rating, evaluatedAt: new Date().toISOString(), evaluatedBy }
            : emp
        )
      );
    } catch (error) {
      console.error('Error updating rating:', error);
      throw error;
    }
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
    return branches.map((branch) => ({
      branchId: branch.id,
      branchName: branch.name,
      ...getBranchStats(branch.id),
    }));
  };

  return (
    <DataContext.Provider
      value={{
        branches,
        employees,
        isLoading,
        updateEmployeeRating,
        getEmployeesByBranch,
        getBranchStats,
        getOverallStats,
        getAllBranchStats,
        refreshData: fetchData,
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
