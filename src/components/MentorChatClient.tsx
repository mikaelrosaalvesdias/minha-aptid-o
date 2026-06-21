"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Sparkles, Loader2, Bot } from "lucide-react";

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
      content: `Olá, ${userName}! Vi que seu perfil tem forte aptidão analítica. Quer que eu monte um plano de estudos de 30 dias para começar na área de dados?`
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
        body: JSON.stringify({ messages: newMessages, contextData })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro na API");

      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (error: any) {
      alert("Houve um erro: " + error.message);
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ambient-shell">
      <div className="ambient-content" style={{ maxWidth: 860, margin: "0 auto", padding: "clamp(24px,4vw,44px) clamp(20px,5vw,40px)", animation: "fadeIn .45s ease both" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 22 }}>
          <Link href={`/resultado/${resultId}`} className="proto-btn ghost" style={{ width: 42, height: 42, padding: 0 }}><ArrowLeft size={20} /></Link>
          <span style={{ display: "inline-flex", width: 54, height: 54, alignItems: "center", justifyContent: "center", borderRadius: 16, background: "linear-gradient(140deg,var(--primary),#5a93f7)", color: "#fff", boxShadow: "0 12px 26px -12px var(--primary-shadow)" }}><Bot size={26} color="#fff" /></span>
          <div><h1 className="proto-title" style={{ fontSize: "1.7rem", margin: 0 }}>Mentor IA</h1><p style={{ margin: "3px 0 0", color: "var(--muted)", fontSize: ".95rem" }}>Orientação baseada no seu perfil analítico</p></div>
        </div>

        <div className="proto-card" style={{ overflow: "hidden", display: "grid", gridTemplateRows: "1fr auto" }}>
          <div style={{ padding: 26, display: "grid", gap: 16, maxHeight: 440, overflowY: "auto" }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ display: "flex", gap: 12, alignItems: "flex-start", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                {msg.role === "assistant" ? (
                  <span style={{ display: "inline-flex", width: 34, height: 34, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 10, background: "var(--primary-soft)", color: "var(--primary)" }}><Bot size={17} /></span>
                ) : (
                  <span style={{ display: "inline-flex", width: 34, height: 34, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 10, background: "var(--primary)", color: "#fff", fontSize: ".78rem", fontWeight: 700 }}>{userName.slice(0, 2).toUpperCase()}</span>
                )}
                <div style={{ background: msg.role === "user" ? "var(--primary)" : "var(--surface-2)", color: msg.role === "user" ? "#fff" : "var(--text)", borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px", padding: "15px 18px", maxWidth: "78%", lineHeight: 1.6, fontSize: ".96rem", whiteSpace: "pre-wrap" }}>{msg.content}</div>
              </div>
            ))}
            {loading && <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><span style={{ display: "inline-flex", width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 10, background: "var(--primary-soft)", color: "var(--primary)" }}><Bot size={17} /></span><div style={{ background: "var(--surface-2)", borderRadius: "4px 16px 16px 16px", padding: "15px 18px", color: "var(--muted)" }}><Loader2 className="spin" size={16} style={{ display: "inline", marginRight: 8 }} /> Pensando...</div></div>}
            <div ref={endRef} />
          </div>
          <form onSubmit={sendMessage} style={{ borderTop: "1px solid var(--border)", padding: 16, display: "flex", gap: 10, alignItems: "center", background: "var(--surface)" }}>
            <div className="proto-field" style={{ flex: 1 }}><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escreva sua pergunta ao mentor…" /></div>
            <button type="submit" className="proto-btn primary" style={{ width: 48, height: 48, padding: 0 }} disabled={!input.trim() || loading}><Send size={20} /></button>
          </form>
        </div>
        <p style={{ margin: "16px 0 0", textAlign: "center", color: "var(--faint)", fontSize: ".84rem", lineHeight: 1.6 }}>O mentor IA oferece sugestões de estudo e carreira. Não substitui orientação profissional especializada.</p>
      </div>
    </main>
  );
}
