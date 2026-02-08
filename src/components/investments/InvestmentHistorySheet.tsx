import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Investment, useInvestmentContributions } from '@/hooks/useInvestments';
import { Loader2, TrendingUp, FileText } from 'lucide-react';

interface InvestmentHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investment: Investment;
}

const InvestmentHistorySheet = ({ open, onOpenChange, investment }: InvestmentHistorySheetProps) => {
  const { contributions, isLoading } = useInvestmentContributions(investment.id);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-chart-investment" />
            Historial de {investment.name}
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-chart-investment" />
          </div>
        ) : contributions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay aportes registrados</p>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-[calc(70vh-100px)]">
            {contributions.map((contribution) => (
              <div
                key={contribution.id}
                className="flex items-center justify-between p-4 rounded-xl bg-chart-investment/10 border border-chart-investment/20"
              >
                <div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(contribution.contribution_date), "d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                  {contribution.note && (
                    <p className="text-xs text-muted-foreground mt-1">{contribution.note}</p>
                  )}
                </div>
                <span className={`font-semibold ${contribution.amount >= 0 ? 'text-chart-investment' : 'text-chart-expense'}`}>
                  {contribution.amount >= 0 ? '+' : ''}{formatCurrency(contribution.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default InvestmentHistorySheet;
