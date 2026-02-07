import { cn } from '@/lib/utils';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { Category } from '@/hooks/useCategories';
import { MoreHorizontal } from 'lucide-react';

interface CategoryGridProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (category: Category) => void;
  onCreateNew?: () => void;
  isLoading?: boolean;
}

const CategoryGrid = ({ categories, selectedId, onSelect, onCreateNew, isLoading }: CategoryGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category)}
          className={cn(
            'flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200',
            'aspect-square bg-muted/80',
            selectedId === category.id && 'ring-2 ring-primary bg-muted'
          )}
        >
          <div className="mb-1.5">
            <CategoryIcon 
              icon={category.icon} 
              color="currentColor"
              size="sm" 
            />
          </div>
          <span className="text-[10px] font-medium text-foreground text-center leading-tight line-clamp-2 px-0.5">
            {category.name}
          </span>
        </button>
      ))}
      
      {onCreateNew && (
        <button
          onClick={onCreateNew}
          className="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 aspect-square bg-muted/80 hover:bg-muted"
        >
          <div className="mb-1.5">
            <MoreHorizontal className="h-5 w-5 text-foreground" />
          </div>
          <span className="text-[10px] font-medium text-foreground text-center">
            Otros
          </span>
        </button>
      )}
    </div>
  );
};

export default CategoryGrid;
