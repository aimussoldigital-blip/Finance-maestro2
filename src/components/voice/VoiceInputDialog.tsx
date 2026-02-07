import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useCategories, Category, CategoryType } from '@/hooks/useCategories';
import { useMovements } from '@/hooks/useMovements';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VoiceInterpretation {
  type: CategoryType;
  amount: number;
  category: string;
  concept: string | null;
  date: string;
  confidence: number;
}

interface VoiceInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VoiceInputDialog = ({ open, onOpenChange }: VoiceInputDialogProps) => {
  const [step, setStep] = useState<'recording' | 'processing' | 'confirm' | 'error'>('recording');
  const [interpretation, setInterpretation] = useState<VoiceInterpretation | null>(null);
  const [matchedCategory, setMatchedCategory] = useState<Category | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { isRecording, transcript, error: voiceError, startRecording, stopRecording, clearTranscript } = useVoiceRecorder();
  const { categories } = useCategories();
  const { createMovement } = useMovements();
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateCompare = new Date(dateStr);
    dateCompare.setHours(0, 0, 0, 0);
    
    if (dateCompare.getTime() === today.getTime()) {
      return 'Hoy';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateCompare.getTime() === yesterday.getTime()) {
      return 'Ayer';
    }
    
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const typeLabels: Record<CategoryType, string> = {
    expense: 'GASTO',
    income: 'INGRESO',
    saving: 'AHORRO',
  };

  const handleStopAndProcess = async () => {
    stopRecording();
    
    if (!transcript.trim()) {
      setErrorMessage('No se detectó ningún texto. Intenta de nuevo.');
      setStep('error');
      return;
    }

    setStep('processing');

    try {
      const { data, error } = await supabase.functions.invoke('interpret-voice', {
        body: {
          transcript: transcript.trim(),
          categories: categories.map(c => ({ name: c.name, type: c.type })),
        },
      });

      if (error) throw error;

      if (!data?.interpretation) {
        throw new Error('No se pudo interpretar el comando');
      }

      const interp = data.interpretation as VoiceInterpretation;
      setInterpretation(interp);

      // Find matching category
      const matched = categories.find(
        c => c.name.toLowerCase() === interp.category.toLowerCase() && c.type === interp.type
      ) || categories.find(
        c => c.name.toLowerCase().includes(interp.category.toLowerCase()) && c.type === interp.type
      ) || categories.find(
        c => c.type === interp.type
      );

      setMatchedCategory(matched || null);
      setStep('confirm');

    } catch (err: any) {
      console.error('Error processing voice:', err);
      setErrorMessage(err.message || 'Error al procesar el comando de voz');
      setStep('error');
    }
  };

  const handleConfirm = async () => {
    if (!interpretation || !matchedCategory) return;

    try {
      await createMovement.mutateAsync({
        type: interpretation.type,
        category_id: matchedCategory.id,
        amount: interpretation.amount,
        concept: interpretation.concept || undefined,
        date: interpretation.date,
      });

      toast({
        title: '¡Registrado!',
        description: `${typeLabels[interpretation.type]} de ${formatCurrency(interpretation.amount)} en ${matchedCategory.name}`,
      });

      handleClose();
    } catch (err) {
      console.error('Error creating movement:', err);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el movimiento',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setStep('recording');
    setInterpretation(null);
    setMatchedCategory(null);
    setErrorMessage('');
    clearTranscript();
    onOpenChange(false);
  };

  const handleRetry = () => {
    setStep('recording');
    setInterpretation(null);
    setMatchedCategory(null);
    setErrorMessage('');
    clearTranscript();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {step === 'recording' && 'Entrada por Voz'}
            {step === 'processing' && 'Procesando...'}
            {step === 'confirm' && 'Confirmar Registro'}
            {step === 'error' && 'Error'}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {/* Recording Step */}
          {step === 'recording' && (
            <div className="text-center space-y-6">
              <button
                onClick={isRecording ? handleStopAndProcess : startRecording}
                className={cn(
                  'w-24 h-24 rounded-full mx-auto flex items-center justify-center transition-all',
                  isRecording 
                    ? 'bg-destructive animate-pulse' 
                    : 'bg-primary hover:bg-primary/90'
                )}
              >
                {isRecording ? (
                  <MicOff className="h-10 w-10 text-white" />
                ) : (
                  <Mic className="h-10 w-10 text-white" />
                )}
              </button>

              <p className="text-sm text-muted-foreground">
                {isRecording 
                  ? 'Escuchando... Toca para procesar'
                  : 'Toca el micrófono para comenzar'}
              </p>

              {transcript && (
                <div className="p-4 rounded-lg bg-secondary/50 text-left">
                  <p className="text-sm font-medium mb-1">Transcripción:</p>
                  <p className="text-sm text-muted-foreground">{transcript}</p>
                </div>
              )}

              {voiceError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {voiceError}
                </div>
              )}
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Interpretando tu comando...</p>
            </div>
          )}

          {/* Confirm Step */}
          {step === 'confirm' && interpretation && matchedCategory && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <p className="text-lg">
                  Registrar <span className="font-bold">{typeLabels[interpretation.type]}</span> de{' '}
                  <span className="font-bold text-primary">{formatCurrency(interpretation.amount)}</span>
                </p>
                <p className="text-lg">
                  en <span className="font-bold">{matchedCategory.name}</span>
                </p>
                {interpretation.concept && (
                  <p className="text-muted-foreground text-sm mt-1">
                    "{interpretation.concept}"
                  </p>
                )}
                <p className="text-muted-foreground text-sm mt-1">
                  Fecha: {formatDate(interpretation.date)}
                </p>
              </div>

              {interpretation.confidence < 0.7 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Confianza baja. Por favor, verifica los datos.</span>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleRetry} className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Reintentar
                </Button>
                <Button 
                  onClick={handleConfirm} 
                  disabled={createMovement.isPending}
                  className="flex-1 gradient-primary"
                >
                  {createMovement.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Confirmar
                </Button>
              </div>
            </div>
          )}

          {/* Error Step */}
          {step === 'error' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 mx-auto flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <p className="text-muted-foreground">{errorMessage}</p>
              <Button onClick={handleRetry} className="gradient-primary">
                Intentar de nuevo
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceInputDialog;
