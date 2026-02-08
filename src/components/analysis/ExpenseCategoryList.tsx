import { CategoryBreakdown } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CategoryIcon from '@/components/ui/CategoryIcon';

interface ExpenseCategoryListProps {
    categories: CategoryBreakdown[];
    isLoading?: boolean;
}

const ExpenseCategoryList = ({ categories, isLoading }: ExpenseCategoryListProps) => {
    if (isLoading) {
        return (
            <Card className="border-border/50 h-full">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Gastos por Categoría</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2 animate-pulse">
                            <div className="flex justify-between">
                                <div className="h-5 w-1/3 bg-muted rounded" />
                                <div className="h-5 w-1/4 bg-muted rounded" />
                            </div>
                            <div className="h-2 w-full bg-muted rounded" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (categories.length === 0) {
        return (
            <Card className="border-border/50 h-full">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Gastos por Categoría</CardTitle>
                </CardHeader>
                <CardContent className="p-8 text-center text-muted-foreground">
                    No hay gastos registrados en este período.
                </CardContent>
            </Card>
        );
    }

    // Sort by total amount descending
    const sortedCategories = [...categories].sort((a, b) => b.total - a.total);
    // Find the max value to calculate percentages relative to the highest expense
    const maxAmount = sortedCategories.length > 0 ? sortedCategories[0].total : 1;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    return (
        <Card className="border-border/50 h-full">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg">Gastos por Categoría</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {sortedCategories.map((category) => (
                    <div key={category.id} className="space-y-2 group">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CategoryIcon
                                    icon={category.icon}
                                    color={category.color}
                                    className="h-5 w-5"
                                />
                                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                    {category.name}
                                </span>
                            </div>
                            <span className="text-sm font-semibold">
                                {formatCurrency(category.total)}
                            </span>
                        </div>

                        {/* Custom Progress Bar */}
                        <div className="relative h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out"
                                style={{
                                    width: `${(category.total / maxAmount) * 100}%`,
                                    backgroundColor: category.color
                                }}
                            />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

export default ExpenseCategoryList;
