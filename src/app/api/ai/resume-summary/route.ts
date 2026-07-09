import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

const payloadSchema = z.object({
  strengths: z.array(z.string().trim().max(160)).min(1).max(20),
  profiles: z.array(z.string().trim().max(160)).min(1).max(10)
});

export async function POST(request: Request) {
  try {
    const userId = await getSession();
    if (!userId) {
      return NextResponse.json({ error: "Faça login para usar a IA." }, { status: 401 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Chave da OpenAI não configurada no servidor." }, { status: 500 });
    }

    const { strengths, profiles } = payloadSchema.parse(await request.json());

    const prompt = `Atue como um especialista em carreiras e recursos humanos. 
O usuário deseja um resumo ("Sobre mim") forte e bem escrito para colocar no topo do currículo.
Ele possui as seguintes forças principais: ${strengths.join(", ")}.
E se destaca nas seguintes áreas/perfis comportamentais: ${profiles.join(", ")}.

Escreva o resumo em primeira pessoa, de forma inspiradora e profissional, com 2 parágrafos no máximo.
Foque no potencial, nas habilidades comportamentais (soft skills) e na vontade de gerar valor para a empresa. 
Aja naturalmente. Retorne apenas o texto do resumo, sem saudações ou explicações.`;

    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 400
      })
    });

    if (!openAiResponse.ok) {
      await logError("OpenAI resumo retornou erro", { status: openAiResponse.status });
      return NextResponse.json({ error: "Erro ao comunicar com a IA." }, { status: 500 });
    }

    const data = await openAiResponse.json();
    const summary = data.choices?.[0]?.message?.content;

    if (!summary) {
      return NextResponse.json({ error: "A IA não retornou conteúdo." }, { status: 500 });
    }

    return NextResponse.json({ summary });
  } catch (error) {
    await logError("Erro interno na rota de resumo IA", { error: String(error) });
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Dados inválidos para gerar o resumo." }, { status: 400 });
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
