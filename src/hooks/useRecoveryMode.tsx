
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRecoveryMode() {
    const [isRecovery, setIsRecovery] = useState(false);

    useEffect(() => {
        // Escuchar cambios de estado de autenticación
        console.log("Setting up auth state change listener for recovery mode");
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log("Auth event:", event);
                if (event === "PASSWORD_RECOVERY") {
                    setIsRecovery(true);
                }
            }
        );

        // Verificar si hay un error o tipo en el hash de la URL (para detectar recovery si el evento ya pasó)
        // A veces el evento puede dispararse antes de que el componente monte, o si la sesión se restaura.
        // Sin embargo, PASSWORD_RECOVERY es específico de cuando se intercambia el token de recuperación.

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    return isRecovery;
}
