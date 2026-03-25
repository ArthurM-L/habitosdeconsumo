import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { profile, percentage, name, gender, secondaryProfiles } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const secondaryText = Object.entries(secondaryProfiles as Record<string, number>)
      .map(([id, pct]) => {
        const labels: Record<string, string> = {
          geracaoX: "Geração X",
          geracaoY: "Millennials (Geração Y)",
          geracaoZ: "Geração Z",
          geracaoAlpha: "Geração Alpha",
        };
        return `${labels[id] ?? id}: ${pct}%`;
      })
      .join(", ");

    const nameClause = name ? `O nome do utilizador é ${name}.` : "";
    const genderClause = gender ? `Identidade de género: ${gender}.` : "";

    const systemPrompt = `Você é um especialista em comportamento do consumidor e psicologia geracional no Brasil. 
Escreva análises personalizadas, empáticas e perspicazes sobre o perfil de consumo identificado. 
Seja direto, use linguagem acessível, evite clichês. Máximo de 4 frases.`;

    const userPrompt = `${nameClause} ${genderClause}
Perfil dominante identificado: ${profile} com ${percentage}% de afinidade.
Perfis secundários: ${secondaryText}.

Escreva uma análise personalizada de 3-4 frases sobre o que este perfil revela sobre os hábitos de consumo desta pessoa, 
destacando pontos fortes, tendências comportamentais e uma dica prática e relevante para este perfil geracional no contexto brasileiro.
Não mencione percentuais na resposta. Fale diretamente com a pessoa (use "você").`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content ?? "Análise não disponível.";

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-analysis error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
