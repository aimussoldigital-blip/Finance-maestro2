import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Goal, useGoalContributions } from '@/hooks/useGoals';
import { Loader2, TrendingUp } from 'lucide-react';

interface GoalHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal;
}

const GoalHistorySheet = ({ open, onOpenChange, goal }: GoalHistorySheetProps) => {
  const { contributions, isLoading } = useGoalContributions(goal.id);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle>Historial de "{goal.name}"</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-100px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : contributions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay aportes registrados</p>
              <p className="text-sm">¡Empieza a ahorrar para tu meta!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contributions.map((contribution) => (
                <div
                  key={contribution.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-card border border-border"
                >
                  <div>
                    <p className="font-medium text-primary">
                      +{formatCurrency(contribution.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(contribution.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                    {contribution.note && (
                      <p className="text-sm text-muted-foreground mt-1">{contribution.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default GoalHistorySheet;
