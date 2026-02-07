import { useState, useRef, useCallback } from 'react';

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  transcript: string;
  error: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  clearTranscript: () => void;
}

export const useVoiceRecorder = (): UseVoiceRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  const startRecording = useCallback(() => {
    setError(null);
    setTranscript('');

    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Tu navegador no soporta reconocimiento de voz. Prueba con Chrome o Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = 'es-ES';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript((prev) => {
          if (finalTranscript) {
            return prev + finalTranscript;
          }
          return prev.split(' ').slice(0, -interimTranscript.split(' ').length).join(' ') + 
                 (prev ? ' ' : '') + interimTranscript;
        });
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Permiso de micrófono denegado. Por favor, permite el acceso al micrófono.');
        } else if (event.error === 'no-speech') {
          setError('No se detectó voz. Intenta de nuevo.');
        } else {
          setError(`Error de reconocimiento: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setError('Error al iniciar el reconocimiento de voz');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isRecording,
    transcript,
    error,
    startRecording,
    stopRecording,
    clearTranscript,
  };
};
