import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

const payloadSchema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(4000) })).min(1).max(20),
  contextData: z.object({
    profiles: z.array(z.string().trim().max(120)).max(10),
    strengths: z.array(z.string().trim().max(160)).max(20),
    attentionPoints: z.array(z.string().trim().max(160)).max(20)
  })
});

export async function POST(request: Request) {
  try {
    const userId = await getSession();
    if (!userId) {
      return NextResponse.json({ error: "Faça login para usar o Mentor." }, { status: 401 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Chave da OpenAI não configurada." }, { status: 500 });
    }

    const { messages, contextData } = payloadSchema.parse(await request.json());

    // System prompt with the context
    const systemPrompt = `Você é um Mentor de Carreira Especialista, gentil, encorajador e direto.
Você está aconselhando um usuário que realizou um teste de aptidão. 
Abaixo está o perfil dele:
- Principais perfis profissionais: ${contextData.profiles.join(", ")}
- Principais forças/soft skills: ${contextData.strengths.join(", ")}
- Pontos que precisam de atenção/desenvolvimento: ${contextData.attentionPoints.join(", ")}

Seu objetivo é ajudá-lo a entrar no mercado de trabalho, montar currículo, se preparar para entrevistas ou encontrar cursos. 
Use as informações do perfil dele para personalizar TODAS as suas respostas. Seja prático. Use português do Brasil.`;

    // Only take the last 10 messages to save tokens
    const recentMessages = messages.slice(-10);

    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...recentMessages
        ],
        temperature: 0.7,
        max_tokens: 600
      })
    });

    if (!openAiResponse.ok) {
      await logError("OpenAI Mentor retornou erro", { status: openAiResponse.status });
      return NextResponse.json({ error: "Erro ao comunicar com a IA." }, { status: 500 });
    }

    const data = await openAiResponse.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return NextResponse.json({ error: "A IA não retornou conteúdo." }, { status: 500 });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    await logError("Erro interno no Mentor IA", { error: String(error) });
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Dados inválidos para o Mentor." }, { status: 400 });
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
