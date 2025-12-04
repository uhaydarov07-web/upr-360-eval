import { useState } from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { LoginPage } from '@/components/LoginPage';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ManagerDashboard } from '@/components/ManagerDashboard';
import { NoRolePage } from '@/components/NoRolePage';
import { AdminSetup } from '@/components/AdminSetup';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [showSetup, setShowSetup] = useState(false);

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

  if (!user.role) {
    return <AdminSetup />;
  }

  if (user.role === 'admin') {
    if (showSetup) {
      return (
        <div className="relative">
          <Button 
            variant="outline" 
            size="sm" 
            className="fixed top-4 right-4 z-50"
            onClick={() => setShowSetup(false)}
          >
            Dashboard
          </Button>
          <AdminSetup />
        </div>
      );
    }
    return (
      <div className="relative">
        <Button 
          variant="outline" 
          size="icon" 
          className="fixed bottom-4 right-4 z-50 shadow-lg"
          onClick={() => setShowSetup(true)}
        >
          <Settings className="w-4 h-4" />
        </Button>
        <AdminDashboard />
      </div>
    );
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
