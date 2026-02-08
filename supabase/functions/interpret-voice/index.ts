/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VoiceInterpretation {
  type: 'expense' | 'income' | 'saving';
  amount: number;
  category: string;
  concept: string | null;
  date: string;
  confidence: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, categories } = await req.json();

    if (!transcript) {
      return new Response(
        JSON.stringify({ error: "No transcript provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    
    const systemPrompt = `Eres un asistente financiero que interpreta comandos de voz para registrar movimientos económicos.

Categorías disponibles:
${categories.map((c: any) => `- ${c.name} (${c.type})`).join('\n')}

Tu tarea es interpretar el texto del usuario y extraer:
1. Tipo: expense (gasto), income (ingreso), o saving (ahorro)
2. Monto: cantidad en euros
3. Categoría: la más apropiada de las disponibles
4. Concepto: descripción breve si se menciona
5. Fecha: "hoy" = ${today}, "ayer" = día anterior, o fecha específica mencionada

Responde SOLO con un JSON válido con esta estructura:
{
  "type": "expense" | "income" | "saving",
  "amount": number,
  "category": "nombre de la categoría",
  "concept": "descripción" | null,
  "date": "YYYY-MM-DD",
  "confidence": 0.0 a 1.0
}

Ejemplos:
- "Gasté 45 euros en el supermercado" → expense, 45, Comida, "supermercado", hoy, 0.9
- "Me pagaron 2000 euros de sueldo" → income, 2000, Sueldo Fijo, null, hoy, 0.95
- "Ahorré 100 euros para emergencias" → saving, 100, Fondo Emergencia, null, hoy, 0.9

Si no puedes determinar algún campo con confianza, usa los valores más probables y reduce el confidence.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: transcript }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to interpret voice command" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No interpretation received" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response
    let interpretation: VoiceInterpretation;
    try {
      // Clean up the response in case it has markdown code blocks
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      interpretation = JSON.parse(cleanContent);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse interpretation", raw: content }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ interpretation }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in interpret-voice function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
