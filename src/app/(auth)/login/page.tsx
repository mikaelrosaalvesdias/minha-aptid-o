"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao fazer login");
      }
      router.push("/perfil");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "calc(100vh - 71px)", display: "grid", placeItems: "center", padding: "clamp(30px,6vw,70px) 20px" }}>
      <div style={{ width: "min(440px,100%)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 24, boxShadow: "var(--shadow-lg)", padding: "clamp(28px,4vw,40px)", display: "grid", gap: 22 }}>
        <div style={{ textAlign: "center", display: "grid", gap: 8, justifyItems: "center" }}>
          <span style={{ display: "inline-flex", width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 14, background: "linear-gradient(140deg,var(--primary),#5a93f7)", boxShadow: "0 10px 22px -10px var(--primary-shadow)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><circle cx="4.7" cy="19.3" r="2" fill="#fff" /><path d="M4.7 19.3C7.3 16.7 8.7 12.9 11.3 9.3" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" fill="none" /><path d="M16.7 2.7l1.5 3.65 3.65 1.5-3.65 1.5-1.5 3.65-1.5-3.65-3.65-1.5 3.65-1.5z" fill="#fff" /></svg>
          </span>
          <h1 style={{ fontFamily: "var(--font-head)", fontWeight: 500, fontSize: "1.9rem", margin: "6px 0 0", letterSpacing: "-0.02em" }}>Bem-vindo de volta</h1>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: ".96rem" }}>Entre para continuar sua jornada profissional.</p>
        </div>
        <form onSubmit={handleLogin} style={{ display: "grid", gap: 22 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontSize: ".88rem", fontWeight: 600, color: "var(--muted)" }}>E-mail</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" style={{ width: "100%", height: 50, border: "1px solid var(--border)", borderRadius: 13, background: "var(--surface-2)", color: "var(--text)", padding: "0 15px", fontSize: "1rem" }} />
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontSize: ".88rem", fontWeight: 600, color: "var(--muted)" }}>Senha</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: "100%", height: 50, border: "1px solid var(--border)", borderRadius: 13, background: "var(--surface-2)", color: "var(--text)", padding: "0 15px", fontSize: "1rem" }} />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" disabled={loading} style={{ height: 52, border: "none", borderRadius: 13, background: "var(--primary)", color: "#fff", fontWeight: 600, fontSize: "1.02rem", cursor: "pointer", fontFamily: "var(--font-body)", boxShadow: "0 12px 26px -12px var(--primary-shadow)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading ? <Loader2 className="spin" size={18} /> : null}
            Entrar
          </button>
        </form>
        <div style={{ display: "flex", alignItems: "center", gap: 14, color: "var(--faint)", fontSize: ".85rem" }}><span style={{ flex: 1, height: 1, background: "var(--border)" }} />ou<span style={{ flex: 1, height: 1, background: "var(--border)" }} /></div>
        <p style={{ margin: 0, textAlign: "center", color: "var(--muted)", fontSize: ".95rem" }}>Não tem conta? <Link href="/cadastro" style={{ color: "var(--primary)", fontWeight: 700 }}>Criar conta grátis</Link></p>
      </div>
    </main>
  );
}
