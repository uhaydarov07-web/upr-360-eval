import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Building2, 
  CheckCircle2, 
  LogOut, 
  FileSpreadsheet, 
  Download,
  TrendingUp,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const { branches, getOverallStats, getAllBranchStats, isLoading, refreshData } = useData();
  
  const stats = getOverallStats();
  const branchStats = getAllBranchStats();
  const progressPercent = stats.total > 0 ? Math.round((stats.evaluated / stats.total) * 100) : 0;

  const pieData = [
    { name: 'A baho', value: stats.ratingA, color: 'hsl(142, 71%, 45%)' },
    { name: 'B baho', value: stats.ratingB, color: 'hsl(45, 93%, 47%)' },
    { name: 'C baho', value: stats.ratingC, color: 'hsl(0, 84%, 60%)' },
  ].filter(item => item.value > 0);

  const barData = branchStats.slice(0, 6).map(branch => ({
    name: branch.branchName.replace(' filiali', ''),
    A: branch.ratingA,
    B: branch.ratingB,
    C: branch.ratingC,
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Ma'lumotlar yuklanmoqda...</p>
        </div>
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
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">UPR 360</h1>
              <p className="text-xs text-muted-foreground">Admin panel</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={refreshData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.fullName}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Chiqish
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-card hover:shadow-elevated transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Jami filiallar</p>
                  <p className="text-3xl font-bold text-foreground">{branches.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Jami hodimlar</p>
                  <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-chart-2/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-chart-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Baholangan</p>
                  <p className="text-3xl font-bold text-foreground">{stats.evaluated}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-chart-3/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Baholash jarayoni</p>
                  <p className="text-3xl font-bold text-foreground">{progressPercent}%</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress bar */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Umumiy baholash jarayoni</CardTitle>
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie chart */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Baholar taqsimoti
              </CardTitle>
              <CardDescription>A, B, C baholar nisbati</CardDescription>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Hali baholar qo'yilmagan
                </div>
              )}
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rating-a" />
                  <span className="text-sm">A: {stats.ratingA}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rating-b" />
                  <span className="text-sm">B: {stats.ratingB}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rating-c" />
                  <span className="text-sm">C: {stats.ratingC}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bar chart */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Filiallar bo'yicha statistika</CardTitle>
              <CardDescription>Birinchi 6 ta filial</CardDescription>
            </CardHeader>
            <CardContent>
              {barData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="A" fill="hsl(142, 71%, 45%)" name="A baho" />
                      <Bar dataKey="B" fill="hsl(45, 93%, 47%)" name="B baho" />
                      <Bar dataKey="C" fill="hsl(0, 84%, 60%)" name="C baho" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Ma'lumotlar mavjud emas
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Branch list */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Filiallar ro'yxati</CardTitle>
              <CardDescription>Barcha filiallar va ularning holati</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Eksport
            </Button>
          </CardHeader>
          <CardContent>
            {branchStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Filial nomi</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Hodimlar</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Baholangan</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">A</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">B</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">C</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branchStats.map((branch) => {
                      const progress = branch.total > 0 ? Math.round((branch.evaluated / branch.total) * 100) : 0;
                      return (
                        <tr key={branch.branchId} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 font-medium">{branch.branchName}</td>
                          <td className="py-3 px-4 text-center">{branch.total}</td>
                          <td className="py-3 px-4 text-center">{branch.evaluated}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-6 rounded bg-rating-a/10 text-rating-a text-sm font-medium">
                              {branch.ratingA}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-6 rounded bg-rating-b/10 text-rating-b text-sm font-medium">
                              {branch.ratingB}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-6 rounded bg-rating-c/10 text-rating-c text-sm font-medium">
                              {branch.ratingC}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Progress value={progress} className="h-2 flex-1" />
                              <span className="text-xs text-muted-foreground w-10">{progress}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Filiallar hali qo'shilmagan</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Tezkor amallar</CardTitle>
            <CardDescription>Admin boshqaruv funksiyalari</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                <FileSpreadsheet className="w-6 h-6" />
                <span>Hodimlarni yuklash</span>
                <span className="text-xs text-muted-foreground">Excel/CSV</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                <Users className="w-6 h-6" />
                <span>Boshqaruvchi yaratish</span>
                <span className="text-xs text-muted-foreground">Filial uchun</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                <Download className="w-6 h-6" />
                <span>Natijalarni eksport</span>
                <span className="text-xs text-muted-foreground">Excel/CSV</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                <span>Hisobotlar</span>
                <span className="text-xs text-muted-foreground">Batafsil statistika</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
