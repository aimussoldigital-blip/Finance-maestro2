import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  children: React.ReactNode;
}

export default function EditProfileDialog({ children }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Trae el valor actual cuando abre
    (async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .maybeSingle();
      setDisplayName(data?.display_name ?? '');
    })();
  }, [open, user?.id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    const name = displayName.trim();
    if (name.length < 2) {
      toast({
        title: 'Nombre inválido',
        description: 'Escribe al menos 2 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: name })
        .eq('id', user.id); // ✅ clave: id (no user_id)

      if (error) throw error;

      // refresca el hook useProfile
      qc.invalidateQueries({ queryKey: ['profile', user.id] });

      toast({ title: 'Listo', description: 'Nombre actualizado.' });
      setOpen(false);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message ?? 'No se pudo actualizar.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)}>{children}</span>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>
            Cambia el nombre que se mostrará en la app.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={save} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Nombre</Label>
            <Input
              id="display_name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ej: Alejandra"
              autoFocus
            />
          </div>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Guardar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}


