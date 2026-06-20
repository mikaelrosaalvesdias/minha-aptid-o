import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const userId = await getSession();
    if (!userId) {
      return NextResponse.json({ error: "Faça login para usar a IA." }, { status: 401 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY not set");
      return NextResponse.json({ error: "Chave da OpenAI não configurada no servidor." }, { status: 500 });
    }

    const body = await request.json();
    const { strengths, profiles } = body;

    if (!strengths?.length || !profiles?.length) {
      return NextResponse.json({ error: "Dados insuficientes para gerar o resumo." }, { status: 400 });
    }

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
      const errorData = await openAiResponse.text();
      console.error("OpenAI Error:", openAiResponse.status, errorData);
      return NextResponse.json({ error: `Erro da OpenAI (${openAiResponse.status}). Verifique a chave de API.` }, { status: 500 });
    }

    const data = await openAiResponse.json();
    const summary = data.choices?.[0]?.message?.content;

    if (!summary) {
      return NextResponse.json({ error: "A IA não retornou conteúdo." }, { status: 500 });
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Erro interno na rota AI:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
