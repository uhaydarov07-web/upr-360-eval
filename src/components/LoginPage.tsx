import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Users, Lock, Mail, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      toast({
        title: 'Muvaffaqiyatli!',
        description: 'Tizimga kirdingiz',
      });
    } else {
      setError(result.error || "Xatolik yuz berdi");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
            <Users className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground mb-2">UPR 360</h1>
          <p className="text-primary-foreground/70">Hodimlarni baholash platformasi</p>
        </div>

        <Card className="shadow-elevated border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center">Tizimga kirish</CardTitle>
            <CardDescription className="text-center">
              Email va parolingizni kiriting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Parol</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Kirish...' : 'Kirish'}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center mb-3">Demo ma'lumotlar:</p>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-md bg-muted">
                  <p className="font-medium">Admin:</p>
                  <p className="text-muted-foreground">admin@upr360.uz / admin123</p>
                </div>
                <div className="p-2 rounded-md bg-muted">
                  <p className="font-medium">Filial boshqaruvchisi:</p>
                  <p className="text-muted-foreground">manager1@upr360.uz / manager123</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
