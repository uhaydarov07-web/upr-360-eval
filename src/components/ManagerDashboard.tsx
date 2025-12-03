import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  LogOut, 
  CheckCircle2,
  Search,
  Check,
  Building2
} from 'lucide-react';
import { Rating } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function ManagerDashboard() {
  const { user, logout } = useAuth();
  const { getEmployeesByBranch, getBranchStats, updateEmployeeRating, branches } = useData();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  const branchId = user?.branchId || '';
  const employees = getEmployeesByBranch(branchId);
  const stats = getBranchStats(branchId);
  const branch = branches.find(b => b.id === branchId);
  
  const progressPercent = stats.total > 0 ? Math.round((stats.evaluated / stats.total) * 100) : 0;

  const filteredEmployees = employees.filter(emp => 
    emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRating = (employeeId: string, rating: Rating) => {
    updateEmployeeRating(employeeId, rating, user?.id || '');
    toast({
      title: 'Baho saqlandi',
      description: `Hodimga ${rating} baho qo'yildi`,
    });
  };

  const getRatingButtonVariant = (currentRating: Rating, buttonRating: Rating) => {
    if (currentRating === buttonRating) {
      switch (buttonRating) {
        case 'A': return 'ratingA';
        case 'B': return 'ratingB';
        case 'C': return 'ratingC';
        default: return 'outline';
      }
    }
    switch (buttonRating) {
      case 'A': return 'ratingAOutline';
      case 'B': return 'ratingBOutline';
      case 'C': return 'ratingCOutline';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">UPR 360</h1>
              <p className="text-xs text-muted-foreground">Filial boshqaruvchisi</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.name}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Chiqish
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Branch info */}
        <Card className="shadow-card gradient-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">{branch?.name || 'Filial'}</h2>
                <p className="text-primary-foreground/70">Hodimlarni baholash paneli</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="shadow-card">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Jami hodimlar</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-foreground">{stats.evaluated}</p>
              <p className="text-sm text-muted-foreground">Baholangan</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-rating-a">{stats.ratingA}</p>
              <p className="text-sm text-muted-foreground">A baho</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-rating-b">{stats.ratingB}</p>
              <p className="text-sm text-muted-foreground">B baho</p>
            </CardContent>
          </Card>
          <Card className="shadow-card col-span-2 lg:col-span-1">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-rating-c">{stats.ratingC}</p>
              <p className="text-sm text-muted-foreground">C baho</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Baholash jarayoni</CardTitle>
            <CardDescription>
              {stats.evaluated} / {stats.total} hodim baholandi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercent} className="h-3" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>{stats.total - stats.evaluated} ta baholanmagan</span>
              <span>{progressPercent}% tugallandi</span>
            </div>
          </CardContent>
        </Card>

        {/* Employee list */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Hodimlar ro'yxati</CardTitle>
                <CardDescription>Har bir hodimga A, B yoki C baho qo'ying</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Hodim qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {employee.fullName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{employee.fullName}</p>
                        {employee.rating && (
                          <Badge variant="outline" className="text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            Baholandi
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{employee.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                      variant={getRatingButtonVariant(employee.rating, 'A')}
                      size="sm"
                      className="w-12"
                      onClick={() => handleRating(employee.id, 'A')}
                    >
                      A
                    </Button>
                    <Button
                      variant={getRatingButtonVariant(employee.rating, 'B')}
                      size="sm"
                      className="w-12"
                      onClick={() => handleRating(employee.id, 'B')}
                    >
                      B
                    </Button>
                    <Button
                      variant={getRatingButtonVariant(employee.rating, 'C')}
                      size="sm"
                      className="w-12"
                      onClick={() => handleRating(employee.id, 'C')}
                    >
                      C
                    </Button>
                  </div>
                </div>
              ))}
              {filteredEmployees.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Hodimlar topilmadi</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Confirm button */}
        {progressPercent === 100 && (
          <Card className="shadow-card border-rating-a">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-rating-a" />
                  <div>
                    <p className="font-semibold text-foreground">Baholash tugallandi!</p>
                    <p className="text-sm text-muted-foreground">Barcha hodimlar baholandi</p>
                  </div>
                </div>
                <Button variant="ratingA" size="lg">
                  Tasdiqlash
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
