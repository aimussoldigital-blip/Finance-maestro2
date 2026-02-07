import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, TrendingUp, Loader2, PiggyBank } from 'lucide-react';
import { useGoals } from '@/hooks/useGoals';
import { useInvestments } from '@/hooks/useInvestments';
import GoalCard from '@/components/goals/GoalCard';
import CreateGoalDialog from '@/components/goals/CreateGoalDialog';
import InvestmentCard from '@/components/investments/InvestmentCard';
import CreateInvestmentDialog from '@/components/investments/CreateInvestmentDialog';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { useMonthlyStats } from '@/hooks/useMonthlyStats';

const Goals = () => {
  const [activeTab, setActiveTab] = useState<'goals' | 'investments'>('goals');
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);
  const [isCreateInvestmentOpen, setIsCreateInvestmentOpen] = useState(false);

  const { goals, isLoading: goalsLoading, totalSaved, totalTarget, globalProgress } = useGoals();
  const { investments, isLoading: investmentsLoading, totalValue, byAssetType } = useInvestments();

  const activeGoals = goals.filter(g => !g.is_archived);
  const archivedGoals = goals.filter(g => g.is_archived);

  const activeInvestments = investments.filter(i => !i.is_archived);
  const archivedInvestments = investments.filter(i => i.is_archived);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const { savedThisMonth, investedThisMonth, isLoading: statsLoading } = useMonthlyStats();

  const prevMonthSavedTotal = totalSaved - savedThisMonth;
  const prevMonthInvestedTotal = totalValue - investedThisMonth;

  const savedChange = prevMonthSavedTotal > 0 ? (savedThisMonth / prevMonthSavedTotal) * 100 : (savedThisMonth > 0 ? 100 : 0);
  const investedChange = prevMonthInvestedTotal > 0 ? (investedThisMonth / prevMonthInvestedTotal) * 100 : (investedThisMonth > 0 ? 100 : 0);

  return (
    <div className="p-4 space-y-6 animate-fade-in pb-24">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Ahorrado</span>
              <PiggyBank className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalSaved)}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-chart-income" />
              <span className="text-xs text-chart-income">
                {savedChange >= 0 ? '+' : ''}{Math.round(savedChange)}% vs mes anterior
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-chart-investment/30 bg-chart-investment/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Invertido</span>
              <TrendingUp className="h-5 w-5 text-chart-investment" />
            </div>
            <p className="text-2xl font-bold text-chart-investment">{formatCurrency(totalValue)}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-chart-income" />
              <span className="text-xs text-chart-income">
                {investedChange >= 0 ? '+' : ''}{Math.round(investedChange)}% vs mes anterior
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'goals' | 'investments')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Metas
          </TabsTrigger>
          <TabsTrigger
            value="investments"
            className="flex items-center gap-2 data-[state=active]:bg-chart-investment data-[state=active]:text-white"
          >
            <TrendingUp className="h-4 w-4" />
            Inversiones
          </TabsTrigger>
        </TabsList>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4 mt-4">
          {/* New Goal Button - at top like image */}
          <Button
            onClick={() => setIsCreateGoalOpen(true)}
            variant="outline"
            className="w-full border-dashed border-primary text-primary hover:bg-primary/5"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Meta
          </Button>

          {goalsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : activeGoals.length === 0 ? (
            <Card className="border-border/50 border-dashed">
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No tienes metas de ahorro activas</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}

          {archivedGoals.length > 0 && (
            <div className="pt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Metas Archivadas ({archivedGoals.length})
              </h3>
              <div className="space-y-2 opacity-60">
                {archivedGoals.map((goal) => (
                  <Card key={goal.id} className="border-border/30">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CategoryIcon icon={goal.icon || 'target'} size="sm" />
                        <span className="text-sm">{goal.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(goal.current_amount || 0)}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Investments Tab */}
        <TabsContent value="investments" className="space-y-4 mt-4">
          {/* New Investment Button */}
          <Button
            onClick={() => setIsCreateInvestmentOpen(true)}
            variant="outline"
            className="w-full border-dashed border-chart-investment text-chart-investment hover:bg-chart-investment/5"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Inversión
          </Button>

          {investmentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-chart-investment" />
            </div>
          ) : investments.length === 0 ? (
            <Card className="border-chart-investment/30 border-dashed bg-chart-investment/5">
              <CardContent className="p-8 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-chart-investment/50" />
                <p className="text-muted-foreground mb-4">No tienes inversiones registradas</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* By Asset Type Summary */}
              {byAssetType.length > 0 && (
                <Card className="border-chart-investment/30 bg-chart-investment/5">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium mb-3 text-chart-investment">Por tipo de activo</h3>
                    <div className="space-y-3">
                      {byAssetType.map((group) => (
                        <div key={group.type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CategoryIcon icon={group.icon} color="hsl(252, 75%, 75%)" size="sm" />
                            <span className="text-sm">{group.label}</span>
                          </div>
                          <span className="font-medium text-chart-investment">{formatCurrency(group.total)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Individual Investments */}
              <div className="space-y-3">
                {activeInvestments.map((investment) => (
                  <InvestmentCard key={investment.id} investment={investment} />
                ))}
              </div>

              {archivedInvestments.length > 0 && (
                <div className="pt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Inversiones Archivadas ({archivedInvestments.length})
                  </h3>
                  <div className="space-y-2 opacity-60">
                    {archivedInvestments.map((investment) => (
                      <Card key={investment.id} className="border-border/30">
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CategoryIcon icon={investment.icon || 'trending-up'} size="sm" />
                            <span className="text-sm">{investment.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(investment.current_value || 0)}
                          </span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateGoalDialog open={isCreateGoalOpen} onOpenChange={setIsCreateGoalOpen} />
      <CreateInvestmentDialog open={isCreateInvestmentOpen} onOpenChange={setIsCreateInvestmentOpen} />
    </div>
  );
};

export default Goals;
