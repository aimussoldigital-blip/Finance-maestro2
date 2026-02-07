import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { History, Plus, Archive, Trash2, MoreVertical, TrendingDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { Goal, useGoals } from '@/hooks/useGoals';
import AddContributionDialog from './AddContributionDialog';
import GoalHistorySheet from './GoalHistorySheet';
import WithdrawDialog from './WithdrawDialog';

interface GoalCardProps {
  goal: Goal;
}

const GoalCard = ({ goal }: GoalCardProps) => {
  const [isContributionOpen, setIsContributionOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const { archiveGoal, deleteGoal } = useGoals();

  const progress = goal.target_amount > 0 
    ? ((goal.current_amount || 0) / goal.target_amount) * 100 
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  return (
    <>
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CategoryIcon icon={goal.icon || 'target'} color="hsl(var(--primary))" size="md" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{goal.name}</h3>
                <Progress value={progress} className="h-2 w-32 mt-1" />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsHistoryOpen(true)}>
                    <History className="h-4 w-4 mr-2" />
                    Historial
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => archiveGoal.mutate(goal.id)}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archivar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => deleteGoal.mutate(goal.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Amount */}
          <div className="text-sm text-muted-foreground">
            {formatCurrency(goal.current_amount || 0)} / {formatCurrency(goal.target_amount)}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 bg-muted hover:bg-muted/80"
              onClick={() => setIsHistoryOpen(true)}
            >
              <History className="h-4 w-4 mr-2" />
              Historial
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-chart-expense/50 text-chart-expense hover:bg-chart-expense/10"
              onClick={() => setIsWithdrawOpen(true)}
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              Retirar
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={() => setIsContributionOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Aportar
            </Button>
          </div>
        </CardContent>
      </Card>

      <AddContributionDialog
        open={isContributionOpen}
        onOpenChange={setIsContributionOpen}
        goal={goal}
      />

      <GoalHistorySheet
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        goal={goal}
      />

      <WithdrawDialog
        open={isWithdrawOpen}
        onOpenChange={setIsWithdrawOpen}
        goal={goal}
      />
    </>
  );
};

export default GoalCard;
