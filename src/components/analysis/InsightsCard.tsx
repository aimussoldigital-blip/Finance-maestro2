import { Insight } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightsCardProps {
  insights: Insight[];
  isLoading?: boolean;
}

const InsightsCard = ({ insights, isLoading }: InsightsCardProps) => {
  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Registra movimientos para ver análisis personalizados
          </p>
        </CardContent>
      </Card>
    );
  }

  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return TrendingUp;
      case 'warning':
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const getColor = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'text-primary bg-primary/10';
      case 'warning':
        return 'text-warning bg-warning/10';
      default:
        return 'text-chart-saving bg-chart-saving/10';
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-warning" />
          Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {insights.map((insight, index) => {
            const Icon = getIcon(insight.type);
            const colorClass = getColor(insight.type);
            
            return (
              <li key={index} className="flex items-start gap-3">
                <div className={cn('p-1.5 rounded-lg flex-shrink-0', colorClass)}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {insight.message}
                </p>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};

export default InsightsCard;
