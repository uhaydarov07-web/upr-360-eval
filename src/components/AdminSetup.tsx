import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Building2, 
  Users, 
  UserPlus, 
  Plus, 
  Trash2,
  CheckCircle2,
  LogOut,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface Manager {
  id: string;
  email: string;
  fullName: string;
  branchId: string | null;
  branchName: string | null;
}

export function AdminSetup() {
  const { user, logout } = useAuth();
  const { branches, employees, refreshData } = useData();
  
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [isClaimingAdmin, setIsClaimingAdmin] = useState(false);
  
  // Branch form
  const [branchName, setBranchName] = useState('');
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  
  // Manager form
  const [managerEmail, setManagerEmail] = useState('');
  const [managerPassword, setManagerPassword] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerBranchId, setManagerBranchId] = useState('');
  const [isAddingManager, setIsAddingManager] = useState(false);
  const [managers, setManagers] = useState<Manager[]>([]);
  
  // Employee form
  const [employeeName, setEmployeeName] = useState('');
  const [employeePosition, setEmployeePosition] = useState('');
  const [employeeBranchId, setEmployeeBranchId] = useState('');
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);

  useEffect(() => {
    checkForAdmin();
    fetchManagers();
  }, []);

  const checkForAdmin = async () => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role', 'admin')
      .limit(1);
    
    if (error) {
      console.error('Error checking for admin:', error);
      setHasAdmin(false);
      return;
    }
    
    setHasAdmin(data && data.length > 0);
  };

  const fetchManagers = async () => {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role
      `)
      .eq('role', 'manager');

    if (error) {
      console.error('Error fetching managers:', error);
      return;
    }

    if (data && data.length > 0) {
      const managerIds = data.map(m => m.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, branch_id, branches(name)')
        .in('id', managerIds);

      if (profilesError) {
        console.error('Error fetching manager profiles:', profilesError);
        return;
      }

      const mappedManagers: Manager[] = (profiles || []).map(p => ({
        id: p.id,
        email: p.email,
        fullName: p.full_name,
        branchId: p.branch_id,
        branchName: p.branches?.name || null
      }));
      
      setManagers(mappedManagers);
    }
  };

  const claimAdminRole = async () => {
    if (!user) return;
    
    setIsClaimingAdmin(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin'
        });

      if (error) throw error;

      toast.success("Admin roli muvaffaqiyatli olindi!");
      window.location.reload();
    } catch (error: any) {
      toast.error("Xatolik: " + error.message);
    } finally {
      setIsClaimingAdmin(false);
    }
  };

  const addBranch = async () => {
    if (!branchName.trim()) {
      toast.error("Filial nomini kiriting");
      return;
    }

    setIsAddingBranch(true);
    try {
      const { error } = await supabase
        .from('branches')
        .insert({ name: branchName.trim() });

      if (error) throw error;

      toast.success("Filial muvaffaqiyatli qo'shildi!");
      setBranchName('');
      refreshData();
    } catch (error: any) {
      toast.error("Xatolik: " + error.message);
    } finally {
      setIsAddingBranch(false);
    }
  };

  const deleteBranch = async (branchId: string) => {
    try {
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', branchId);

      if (error) throw error;

      toast.success("Filial o'chirildi");
      refreshData();
    } catch (error: any) {
      toast.error("Xatolik: " + error.message);
    }
  };

  const addManager = async () => {
    if (!managerEmail.trim() || !managerPassword.trim() || !managerName.trim() || !managerBranchId) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }

    setIsAddingManager(true);
    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: managerEmail.trim(),
        password: managerPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: managerName.trim()
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update profile with branch_id
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ branch_id: managerBranchId })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
        }

        // Assign manager role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'manager'
          });

        if (roleError) throw roleError;

        toast.success("Boshqaruvchi muvaffaqiyatli qo'shildi!");
        setManagerEmail('');
        setManagerPassword('');
        setManagerName('');
        setManagerBranchId('');
        fetchManagers();
      }
    } catch (error: any) {
      toast.error("Xatolik: " + error.message);
    } finally {
      setIsAddingManager(false);
    }
  };

  const addEmployee = async () => {
    if (!employeeName.trim() || !employeePosition.trim() || !employeeBranchId) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }

    setIsAddingEmployee(true);
    try {
      const { error } = await supabase
        .from('employees')
        .insert({
          full_name: employeeName.trim(),
          position: employeePosition.trim(),
          branch_id: employeeBranchId
        });

      if (error) throw error;

      toast.success("Hodim muvaffaqiyatli qo'shildi!");
      setEmployeeName('');
      setEmployeePosition('');
      setEmployeeBranchId('');
      refreshData();
    } catch (error: any) {
      toast.error("Xatolik: " + error.message);
    } finally {
      setIsAddingEmployee(false);
    }
  };

  const deleteEmployee = async (employeeId: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);

      if (error) throw error;

      toast.success("Hodim o'chirildi");
      refreshData();
    } catch (error: any) {
      toast.error("Xatolik: " + error.message);
    }
  };

  // Show claim admin section if no admin exists
  if (hasAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-elevated">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Admin sozlamalari</CardTitle>
            <CardDescription>
              Tizimda hali admin mavjud emas. Siz birinchi admin bo'lishingiz mumkin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">Joriy foydalanuvchi:</p>
              <p className="font-medium">{user?.fullName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Button 
              className="w-full" 
              onClick={claimAdminRole}
              disabled={isClaimingAdmin}
            >
              {isClaimingAdmin ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Shield className="w-4 h-4 mr-2" />
              )}
              Admin rolini olish
            </Button>
            <Button variant="outline" className="w-full" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Chiqish
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">UPR 360</h1>
              <p className="text-xs text-muted-foreground">Admin sozlamalari</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.fullName}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Chiqish
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="branches" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="branches" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Filiallar</span>
            </TabsTrigger>
            <TabsTrigger value="managers" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Boshqaruvchilar</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Hodimlar</span>
            </TabsTrigger>
          </TabsList>

          {/* Branches Tab */}
          <TabsContent value="branches" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Yangi filial qo'shish</CardTitle>
                <CardDescription>Kompaniya filiallarini ro'yxatdan o'tkazing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="branchName">Filial nomi</Label>
                    <Input
                      id="branchName"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      placeholder="Masalan: Toshkent shahri filiali"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addBranch} disabled={isAddingBranch}>
                      {isAddingBranch ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      <span className="ml-2 hidden sm:inline">Qo'shish</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Mavjud filiallar</CardTitle>
                <CardDescription>{branches.length} ta filial ro'yxatdan o'tgan</CardDescription>
              </CardHeader>
              <CardContent>
                {branches.length > 0 ? (
                  <div className="space-y-2">
                    {branches.map((branch) => (
                      <div 
                        key={branch.id} 
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">{branch.name}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteBranch(branch.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Hali filiallar qo'shilmagan</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Managers Tab */}
          <TabsContent value="managers" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Yangi boshqaruvchi qo'shish</CardTitle>
                <CardDescription>Filial boshqaruvchisi hisobi yarating</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="managerName">To'liq ism</Label>
                    <Input
                      id="managerName"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      placeholder="F.I.Sh."
                    />
                  </div>
                  <div>
                    <Label htmlFor="managerEmail">Email</Label>
                    <Input
                      id="managerEmail"
                      type="email"
                      value={managerEmail}
                      onChange={(e) => setManagerEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="managerPassword">Parol</Label>
                    <Input
                      id="managerPassword"
                      type="password"
                      value={managerPassword}
                      onChange={(e) => setManagerPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <Label htmlFor="managerBranch">Filial</Label>
                    <Select value={managerBranchId} onValueChange={setManagerBranchId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filial tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={addManager} disabled={isAddingManager || branches.length === 0}>
                  {isAddingManager ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  Boshqaruvchi qo'shish
                </Button>
                {branches.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Avval filiallar qo'shing
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Mavjud boshqaruvchilar</CardTitle>
                <CardDescription>{managers.length} ta boshqaruvchi</CardDescription>
              </CardHeader>
              <CardContent>
                {managers.length > 0 ? (
                  <div className="space-y-2">
                    {managers.map((manager) => (
                      <div 
                        key={manager.id} 
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserPlus className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{manager.fullName}</p>
                            <p className="text-sm text-muted-foreground">{manager.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {manager.branchName && (
                            <span className="text-sm bg-muted px-2 py-1 rounded">
                              {manager.branchName}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Hali boshqaruvchilar qo'shilmagan</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Yangi hodim qo'shish</CardTitle>
                <CardDescription>Hodimlarni qo'lda ro'yxatdan o'tkazing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="employeeName">To'liq ism (F.I.Sh.)</Label>
                    <Input
                      id="employeeName"
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      placeholder="Ismailov Anvar Toshpulatovich"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employeePosition">Lavozimi</Label>
                    <Input
                      id="employeePosition"
                      value={employeePosition}
                      onChange={(e) => setEmployeePosition(e.target.value)}
                      placeholder="Bosh mutaxassis"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employeeBranch">Filial</Label>
                    <Select value={employeeBranchId} onValueChange={setEmployeeBranchId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filial tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={addEmployee} disabled={isAddingEmployee || branches.length === 0}>
                  {isAddingEmployee ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Hodim qo'shish
                </Button>
                {branches.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Avval filiallar qo'shing
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Mavjud hodimlar</CardTitle>
                <CardDescription>{employees.length} ta hodim ro'yxatdan o'tgan</CardDescription>
              </CardHeader>
              <CardContent>
                {employees.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {employees.map((employee) => (
                      <div 
                        key={employee.id} 
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-chart-2/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-chart-2" />
                          </div>
                          <div>
                            <p className="font-medium">{employee.fullName}</p>
                            <p className="text-sm text-muted-foreground">{employee.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm bg-muted px-2 py-1 rounded">
                            {employee.branchName}
                          </span>
                          {employee.rating && (
                            <span className={`text-sm font-medium px-2 py-1 rounded ${
                              employee.rating === 'A' ? 'bg-rating-a/10 text-rating-a' :
                              employee.rating === 'B' ? 'bg-rating-b/10 text-rating-b' :
                              'bg-rating-c/10 text-rating-c'
                            }`}>
                              {employee.rating}
                            </span>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteEmployee(employee.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Hali hodimlar qo'shilmagan</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
