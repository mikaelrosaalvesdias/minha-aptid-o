"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? "Não foi possível entrar.");
      return;
    }
    router.refresh();
  }

  return (
    <form className="admin-login card" onSubmit={submit}>
      <Lock size={28} />
      <h1>Admin</h1>
      <p>Use a senha definida em ADMIN_PASSWORD para acessar métricas e cadastros internos.</p>
      <div className="field">
        <label htmlFor="password">Senha</label>
        <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </div>
      {error && <p className="form-error">{error}</p>}
      <button className="button" type="submit" disabled={loading}>
        {loading && <Loader2 className="spin" size={18} />}
        Entrar
      </button>
    </form>
  );
}
