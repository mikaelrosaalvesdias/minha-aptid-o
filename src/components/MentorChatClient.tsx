"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Sparkles, User as UserIcon, Loader2, Bot } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function MentorChatClient({
  userName,
  resultId,
  contextData
}: {
  userName: string;
  resultId: string;
  contextData: { profiles: string[]; strengths: string[]; attentionPoints: string[] };
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Olá, ${userName}! Sou seu Mentor IA. Já analisei seu perfil: vi que você tem grande potencial para ${contextData.profiles[0]}. Como posso te ajudar hoje? Posso te dar dicas de entrevista, sugerir como melhorar seus pontos de atenção ou traçar um plano de estudos.`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          contextData
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro na API");

      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (error: any) {
      alert("Houve um erro: " + error.message);
      // Remove the user message if it failed completely
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 100px)", padding: "24px 0" }}>
      <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
        <Link href={`/resultado/${resultId}`} className="button ghost" style={{ padding: "8px" }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={24} color="var(--accent-primary)" />
            Mentor de Carreira IA
          </h1>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Baseado no seu perfil exclusivo.
          </p>
        </div>
      </div>

      <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "rgba(10,10,15,0.8)" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              style={{ 
                display: "flex", 
                gap: "12px", 
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "80%"
              }}
            >
              {msg.role === "assistant" && (
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent-gradient)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Bot size={20} color="#fff" />
                </div>
              )}
              <div 
                style={{ 
                  padding: "12px 16px", 
                  borderRadius: "12px", 
                  background: msg.role === "user" ? "var(--bg-surface-hover)" : "rgba(139, 92, 246, 0.1)",
                  border: msg.role === "user" ? "1px solid var(--border-color)" : "1px solid rgba(139, 92, 246, 0.2)",
                  color: "var(--text-main)",
                  lineHeight: 1.6,
                  borderTopRightRadius: msg.role === "user" ? 0 : "12px",
                  borderTopLeftRadius: msg.role === "assistant" ? 0 : "12px",
                }}
              >
                {msg.content.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i !== msg.content.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: "12px", alignSelf: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent-gradient)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={20} color="#fff" />
              </div>
              <div style={{ padding: "12px 16px", borderRadius: "12px", background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.2)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Loader2 className="spin" size={16} /> Pensando...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={sendMessage} style={{ display: "flex", gap: "12px", padding: "16px", background: "var(--bg-surface)", borderTop: "1px solid var(--border-color)" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Pergunte sobre seu perfil, currículo ou entrevistas..."
            style={{ flex: 1, padding: "12px 16px", borderRadius: "var(--radius-md)", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-color)", color: "var(--text-main)" }}
          />
          <button type="submit" className="button" disabled={!input.trim() || loading} style={{ padding: "0 20px" }}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </main>
  );
}
