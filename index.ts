import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, difficulty } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "Please provide lesson text (at least 50 characters)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const diffLabel = difficulty || "medium";

    const questionCounts: Record<string, { mc: number; tf: number; sa: number; total: number }> = {
      easy:   { mc: 5, tf: 3, sa: 2, total: 10 },
      medium: { mc: 8, tf: 4, sa: 3, total: 15 },
      hard:   { mc: 11, tf: 5, sa: 4, total: 20 },
    };
    const counts = questionCounts[diffLabel] || questionCounts.medium;

    const systemPrompt = `You are an expert educational quiz generator. Given lesson content, generate a quiz with EXACTLY:
- ${counts.mc} multiple choice questions (each with exactly 4 options)
- ${counts.tf} true/false questions
- ${counts.sa} short answer questions
Total: ${counts.total} questions.

Rules:
- Questions MUST only be based on the provided lesson content. Never invent facts.
- Difficulty level: ${diffLabel}
- Each question needs: question text, correct answer, and a brief explanation.
- For multiple choice, provide exactly 4 options labeled as plain text.
- For true/false, the correct answer must be exactly "True" or "False".
- For short answer, the correct answer should be a concise phrase.

You MUST call the generate_quiz function with the structured quiz data.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here is the lesson content to generate a quiz from:\n\n${text.slice(0, 12000)}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_quiz",
              description: "Generate a structured quiz from lesson content",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        type: { type: "string", enum: ["multiple_choice", "true_false", "short_answer"] },
                        question: { type: "string" },
                        options: { type: "array", items: { type: "string" } },
                        correctAnswer: { type: "string" },
                        explanation: { type: "string" },
                      },
                      required: ["id", "type", "question", "correctAnswer", "explanation"],
                    },
                  },
                },
                required: ["questions"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_quiz" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No quiz data returned from AI");
    }

    const quiz = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(quiz), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-quiz error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
