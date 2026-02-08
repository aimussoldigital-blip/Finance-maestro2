import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Check } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import CategoryGrid from './CategoryGrid';
import CreateCategoryDialog from './CreateCategoryDialog';
import VoiceInputDialog from '@/components/voice/VoiceInputDialog';
import { useCategories, CategoryType, Category } from '@/hooks/useCategories';
import { useMovements } from '@/hooks/useMovements';

interface NewRecordSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewRecordSheet = ({ open, onOpenChange }: NewRecordSheetProps) => {
  const [activeTab, setActiveTab] = useState<CategoryType>('expense');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const { categories, isLoading: categoriesLoading } = useCategories(activeTab);
  const { createMovement } = useMovements();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as CategoryType);
    setSelectedCategory(null);
  };

  const handleSave = async () => {
    if (!selectedCategory || !amount || parseFloat(amount) <= 0) return;

    await createMovement.mutateAsync({
      type: activeTab,
      category_id: selectedCategory.id,
      amount: parseFloat(amount),
      concept: concept || undefined,
      date: format(date, 'yyyy-MM-dd'),
    });

    // Reset form
    setSelectedCategory(null);
    setAmount('');
    setConcept('');
    setDate(new Date());
    onOpenChange(false);
  };

  const isValid = selectedCategory && amount && parseFloat(amount) > 0;

  // Colors based on active tab
  const getTabColors = () => {
    switch (activeTab) {
      case 'expense':
        return {
          activeBg: 'bg-[#E05A5A]',
          activeText: 'text-white',
          border: 'ring-[#E05A5A]',
          button: 'bg-[#E05A5A] hover:bg-[#c94a4a]'
        };
      case 'income':
        return {
          activeBg: 'bg-[#6EE7B7]',
          activeText: 'text-black',
          border: 'ring-[#6EE7B7]',
          button: 'bg-[#6EE7B7] hover:bg-[#5dd9a8] text-black'
        };
      case 'saving':
        return {
          activeBg: 'bg-[#60A5FA]',
          activeText: 'text-white',
          border: 'ring-[#60A5FA]',
          button: 'bg-[#60A5FA] hover:bg-[#4a95ea]'
        };
    }
  };

  const colors = getTabColors();

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="max-h-[90vh] rounded-t-3xl px-0 pb-0 mx-auto max-w-md flex flex-col">
          <SheetHeader className="pb-4 pt-4 px-5 shrink-0">
            <SheetTitle className="text-xl font-bold text-left">
              Nuevo Registro
            </SheetTitle>
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col min-h-0">
            <div className="px-5 shrink-0">
              <TabsList className="grid w-full grid-cols-3 h-12 rounded-full p-1 bg-muted/30">
                <TabsTrigger
                  value="expense"
                  className={cn(
                    "rounded-full text-sm font-medium transition-all",
                    activeTab === 'expense'
                      ? "bg-[#E05A5A] text-white"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Gasto
                </TabsTrigger>
                <TabsTrigger
                  value="income"
                  className={cn(
                    "rounded-full text-sm font-medium transition-all",
                    activeTab === 'income'
                      ? "bg-[#6EE7B7] text-black ring-2 ring-[#6EE7B7] ring-offset-2 ring-offset-background"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Ingreso
                </TabsTrigger>
                <TabsTrigger
                  value="saving"
                  className={cn(
                    "rounded-full text-sm font-medium transition-all",
                    activeTab === 'saving'
                      ? "bg-[#60A5FA] text-white ring-2 ring-[#60A5FA] ring-offset-2 ring-offset-background"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Ahorro
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {(['expense', 'income', 'saving'] as CategoryType[]).map((type) => (
                <TabsContent key={type} value={type} className="mt-0">
                  {/* 1. Selecciona categoría */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-3 font-medium">1. Selecciona categoría</p>
                    <CategoryGrid
                      categories={categories}
                      selectedId={selectedCategory?.id || null}
                      onSelect={setSelectedCategory}
                      onCreateNew={() => setIsCreateCategoryOpen(true)}
                      isLoading={categoriesLoading}
                    />
                  </div>
                </TabsContent>
              ))}

              {/* 2. Monto */}
              <div>
                <p className="text-sm text-muted-foreground mb-3 font-medium">2. Monto</p>
                <div className="relative">
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-3xl font-semibold h-16 text-center bg-muted border-0 rounded-2xl placeholder:text-muted-foreground/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground text-xl">€</span>
                </div>
              </div>

              {/* 3. Concepto */}
              <div>
                <p className="text-sm text-muted-foreground mb-3 font-medium">3. Concepto (opcional)</p>
                <Input
                  placeholder="Descripción del movimiento..."
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  className="h-14 bg-muted border-0 rounded-2xl"
                />
              </div>

              {/* 4. Fecha */}
              <div>
                <p className="text-sm text-muted-foreground mb-3 font-medium">4. Fecha</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-between text-left font-normal h-14 bg-muted rounded-2xl border-0 hover:bg-muted/80',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">
                          {date ? format(date, 'dd/MM/yyyy', { locale: es }) : 'Seleccionar fecha'}
                        </span>
                      </div>
                      <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => d && setDate(d)}
                      initialFocus
                      locale={es}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {/* Add extra padding at bottom to ensure content isn't hidden behind button if scrolled to bottom */}
              <div className="h-4"></div>
            </div>

            {/* Save Button - Sticky Footer */}
            <div className="p-5 pt-2 mt-auto border-t">
              <Button
                onClick={handleSave}
                disabled={!isValid || createMovement.isPending}
                className={cn(
                  'w-full h-14 text-base font-semibold rounded-2xl text-white shadow-lg shadow-black/5',
                  colors.button
                )}
              >
                {createMovement.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Check className="h-5 w-5 mr-2" />
                )}
                Guardar Movimiento
              </Button>
            </div>
          </Tabs>
        </SheetContent>
      </Sheet>

      <CreateCategoryDialog
        open={isCreateCategoryOpen}
        onOpenChange={setIsCreateCategoryOpen}
        type={activeTab}
      />

      <VoiceInputDialog
        open={isVoiceOpen}
        onOpenChange={setIsVoiceOpen}
      />
    </>
  );
};

export default NewRecordSheet;
