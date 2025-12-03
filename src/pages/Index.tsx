import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { LoginPage } from '@/components/LoginPage';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ManagerDashboard } from '@/components/ManagerDashboard';

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  return <ManagerDashboard />;
}

const Index = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
};

export default Index;
