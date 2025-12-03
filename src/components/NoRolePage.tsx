import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, LogOut, ShieldAlert } from 'lucide-react';

export function NoRolePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
            <Users className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground mb-2">UPR 360</h1>
        </div>

        <Card className="shadow-elevated border-0">
          <CardContent className="pt-8 pb-6 text-center">
            <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Rol tayinlanmagan</h2>
            <p className="text-muted-foreground mb-6">
              Hurmatli {user?.fullName}, sizga hali tizimda rol tayinlanmagan. 
              Iltimos, administrator bilan bog'laning.
            </p>
            <div className="p-4 rounded-lg bg-muted mb-6">
              <p className="text-sm text-muted-foreground">
                Email: {user?.email}
              </p>
            </div>
            <Button variant="outline" onClick={logout} className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Chiqish
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
