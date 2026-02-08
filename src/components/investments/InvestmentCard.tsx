import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Plus, Minus, Archive, Trash2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { Investment, useInvestments, getAssetTypeLabel, getAssetTypeIcon } from '@/hooks/useInvestments';
import ModifyInvestmentDialog from './ModifyInvestmentDialog';
import WithdrawInvestmentDialog from './WithdrawInvestmentDialog';
import InvestmentHistorySheet from './InvestmentHistorySheet';

interface InvestmentCardProps {
  investment: Investment;
}

const InvestmentCard = ({ investment }: InvestmentCardProps) => {
  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { deleteInvestment, archiveInvestment } = useInvestments();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  return (
    <>
      <Card className="border-chart-investment/30 bg-chart-investment/5 overflow-hidden">
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-chart-investment/20 flex items-center justify-center">
                <CategoryIcon 
                  icon={investment.icon || getAssetTypeIcon(investment.asset_type as any)} 
                  color="hsl(252, 75%, 75%)" 
                  size="md" 
                />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{investment.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {getAssetTypeLabel(investment.asset_type as any)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-semibold text-chart-investment">
                {formatCurrency(investment.current_value || 0)}
              </span>
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
                  <DropdownMenuItem onClick={() => archiveInvestment.mutate(investment.id)}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archivar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => deleteInvestment.mutate(investment.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 bg-chart-investment/10 hover:bg-chart-investment/20 text-chart-investment"
              onClick={() => setIsHistoryOpen(true)}
            >
              <History className="h-4 w-4 mr-1" />
              Historial
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 bg-destructive/10 hover:bg-destructive/20 text-destructive"
              onClick={() => setIsWithdrawOpen(true)}
            >
              <Minus className="h-4 w-4 mr-1" />
              Retirar
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-chart-investment hover:bg-chart-investment/90"
              onClick={() => setIsModifyOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Aportar
            </Button>
          </div>
        </CardContent>
      </Card>

      <ModifyInvestmentDialog
        open={isModifyOpen}
        onOpenChange={setIsModifyOpen}
        investment={investment}
      />

      <WithdrawInvestmentDialog
        open={isWithdrawOpen}
        onOpenChange={setIsWithdrawOpen}
        investment={investment}
      />

      <InvestmentHistorySheet
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        investment={investment}
      />
    </>
  );
};

export default InvestmentCard;
