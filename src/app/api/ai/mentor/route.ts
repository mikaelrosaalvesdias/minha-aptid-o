import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

    const body = await request.json();
    const { messages, contextData } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Mensagens inválidas." }, { status: 400 });
    }

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
      const errorData = await openAiResponse.text();
      console.error("OpenAI Mentor Error:", openAiResponse.status, errorData);
      return NextResponse.json({ error: "Erro ao comunicar com a IA." }, { status: 500 });
    }

    const data = await openAiResponse.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return NextResponse.json({ error: "A IA não retornou conteúdo." }, { status: 500 });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Erro interno no Mentor IA:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
