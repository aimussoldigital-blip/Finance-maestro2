import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, Shield, ShieldOff, Users, RefreshCw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Admin = () => {
  const { user } = useAuth();
  const { isAdmin, isCheckingAdmin, users, isLoadingUsers, refetchUsers, toggleBlock, isTogglingBlock, deleteUser, isDeletingUser } = useAdmin();
  const safeUsers = users ?? [];
   const { toast } = useToast();

  const handleToggleBlock = (userId: string, currentlyBlocked: boolean, email: string) => {
    toggleBlock(
      { userId, shouldBlock: !currentlyBlocked },
      {
        onSuccess: () => {
          toast({
            title: currentlyBlocked ? 'Usuario desbloqueado' : 'Usuario bloqueado',
            description: `${email} ha sido ${currentlyBlocked ? 'desbloqueado' : 'bloqueado'}`,
          });
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: 'No se pudo cambiar el estado del usuario',
            variant: 'destructive',
          });
          console.error(error);
        },
      }
    );
  };

  const handleDeleteUser = (userId: string, email: string) => {
    deleteUser(userId, {
      onSuccess: () => {
        toast({
          title: 'Cuenta eliminada',
          description: `La cuenta de ${email} ha sido eliminada permanentemente`,
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: 'No se pudo eliminar la cuenta',
          variant: 'destructive',
        });
        console.error(error);
      },
    });
  };

  if (isCheckingAdmin) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-4 space-y-6 animate-fade-in">
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-6 text-center">
            <ShieldOff className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold text-destructive">Acceso Denegado</h2>
            <p className="text-muted-foreground mt-2">No tienes permisos de administrador para acceder a esta sección.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => refetchUsers()}
          disabled={isLoadingUsers}
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingUsers ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuarios Registrados ({safeUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingUsers ? (
            <div className="p-8 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : safeUsers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No hay usuarios registrados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Fecha de Registro</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeUsers.map((userData) => (
                    <TableRow key={userData.id}>
                      <TableCell className="font-medium">
                        {userData.email}
                        {userData.id === user?.id && (
                          <Badge variant="secondary" className="ml-2">Tú</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(userData.created_at), 'dd MMM yyyy', { locale: es })}
                      </TableCell>
                      <TableCell>
                        {userData.last_sign_in_at 
                          ? format(new Date(userData.last_sign_in_at), 'dd MMM yyyy HH:mm', { locale: es })
                          : 'Nunca'
                        }
                      </TableCell>
                      <TableCell>
                        {userData.is_blocked ? (
                          <Badge variant="destructive">Bloqueado</Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-600">Activo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {userData.id !== user?.id && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant={userData.is_blocked ? 'default' : 'destructive'}
                              size="sm"
                              onClick={() => handleToggleBlock(userData.id, userData.is_blocked, userData.email)}
                              disabled={isTogglingBlock}
                            >
                              {isTogglingBlock ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : userData.is_blocked ? (
                                <>
                                  <ShieldOff className="h-4 w-4 mr-1" />
                                  Desbloquear
                                </>
                              ) : (
                                <>
                                  <Shield className="h-4 w-4 mr-1" />
                                  Bloquear
                                </>
                              )}
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  disabled={isDeletingUser}
                                >
                                  {isDeletingUser ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Eliminar
                                    </>
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar cuenta?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción es permanente y no se puede deshacer. Se eliminará la cuenta de <strong>{userData.email}</strong> y todos sus datos asociados.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(userData.id, userData.email)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Eliminar permanentemente
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
