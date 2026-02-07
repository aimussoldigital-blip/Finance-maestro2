import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LogOut, User, Settings, Moon, Sun, Monitor, ChevronRight, Shield, Key, Pencil } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import ChangePasswordDialog from '@/components/auth/ChangePasswordDialog';
import EditProfileDialog from '@/components/profile/EditProfileDialog';

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { displayName } = useProfile();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themeOptions = [
    { value: 'light' as const, label: 'Claro', icon: Sun },
    { value: 'dark' as const, label: 'Oscuro', icon: Moon },
    { value: 'system' as const, label: 'Sistema', icon: Monitor },
  ];

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Perfil</h1>

      {/* User info */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{displayName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <EditProfileDialog>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </Button>
            </EditProfileDialog>
          </div>
        </CardContent>
      </Card>

      {/* Theme selector */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            {resolvedTheme === 'dark' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            Apariencia
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.value}
                  variant="outline"
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 h-auto py-4 border-2 transition-all',
                    theme === option.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-transparent bg-secondary/50 hover:bg-secondary hover:border-muted-foreground/30'
                  )}
                >
                  <Icon className={cn(
                    'h-6 w-6 mb-1',
                    theme === option.value ? 'text-primary' : 'text-muted-foreground'
                  )} />
                  <span className={cn(
                    'text-xs font-medium',
                    theme === option.value ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {option.label}
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Admin Panel Link - Only visible to admins */}
      {isAdmin && (
        <Card className="border-primary/50 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigate('/admin')}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-primary font-medium">
              <Shield className="h-5 w-5" />
              Panel de Administración
            </div>
            <ChevronRight className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
      )}

      {/* Settings */}
      <Card className="border-border/50">
        <CardContent className="p-2">
          <ChangePasswordDialog>
            <Button
              variant="ghost"
              className="w-full justify-between h-12"
            >
              <div className="flex items-center">
                <Key className="h-4 w-4 mr-3" />
                Cambiar Contraseña
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Button>
          </ChangePasswordDialog>
          <Separator />
          <Button
            variant="ghost"
            className="w-full justify-between h-12"
          >
            <div className="flex items-center">
              <Settings className="h-4 w-4 mr-3" />
              Configuración
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Separator />
          <Button
            variant="ghost"
            className="w-full justify-between h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={signOut}
          >
            <div className="flex items-center">
              <LogOut className="h-4 w-4 mr-3" />
              Cerrar Sesión
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
