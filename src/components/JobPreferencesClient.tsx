"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Search } from "lucide-react";

type Preference = {
  id?: string;
  cargo?: string | null;
  area?: string | null;
  cidade?: string | null;
  estado?: string | null;
  modelo?: string;
  salarioMin?: number | null;
  salarioMax?: number | null;
  nivel?: string;
  contrato?: string;
  keywordsDesejadas?: unknown;
  keywordsEvitar?: unknown;
  aceitaSemSalario?: boolean;
  aceitaForaCidade?: boolean;
  frequenciaBusca?: string;
  recebeNotificacoes?: boolean;
};

function asArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
}

export function JobPreferencesClient({ initial }: { initial: Preference | null }) {
  const router = useRouter();
  const [form, setForm] = useState({
    cargo: initial?.cargo ?? "",
    area: initial?.area ?? "",
    cidade: initial?.cidade ?? "",
    estado: initial?.estado ?? "",
    modelo: initial?.modelo ?? "qualquer",
    salarioMin: initial?.salarioMin?.toString() ?? "",
    salarioMax: initial?.salarioMax?.toString() ?? "",
    nivel: initial?.nivel ?? "qualquer",
    contrato: initial?.contrato ?? "qualquer",
    keywordsDesejadas: asArray(initial?.keywordsDesejadas).join(", "),
    keywordsEvitar: asArray(initial?.keywordsEvitar).join(", "),
    aceitaSemSalario: initial?.aceitaSemSalario ?? true,
    aceitaForaCidade: initial?.aceitaForaCidade ?? true,
    frequenciaBusca: initial?.frequenciaBusca ?? "manual",
    recebeNotificacoes: initial?.recebeNotificacoes ?? true
  });
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  async function saveAndOptionallySearch(thenSearch: boolean) {
    setSaving(thenSearch ? false : true);
    setSearching(thenSearch);
    setError("");
    setMsg("");
    try {
      const payload = {
        cargo: form.cargo || null,
        area: form.area || null,
        cidade: form.cidade || null,
        estado: form.estado || null,
        modelo: form.modelo,
        salarioMin: form.salarioMin ? parseFloat(form.salarioMin) : null,
        salarioMax: form.salarioMax ? parseFloat(form.salarioMax) : null,
        nivel: form.nivel,
        contrato: form.contrato,
        keywordsDesejadas: form.keywordsDesejadas.split(",").map((s) => s.trim()).filter(Boolean),
        keywordsEvitar: form.keywordsEvitar.split(",").map((s) => s.trim()).filter(Boolean),
        aceitaSemSalario: form.aceitaSemSalario,
        aceitaForaCidade: form.aceitaForaCidade,
        frequenciaBusca: form.frequenciaBusca,
        recebeNotificacoes: form.recebeNotificacoes
      };
      const res = await fetch("/api/jobs/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar.");

      if (thenSearch) {
        const sres = await fetch("/api/jobs/search", { method: "POST" });
        const sdata = await sres.json();
        if (!sres.ok) throw new Error(sdata.error || "Erro ao buscar.");
        setMsg(`Busca concluída: ${sdata.new} nova(s) vaga(s) de ${sdata.found} encontradas.`);
        router.push("/vagas");
        router.refresh();
      } else {
        setMsg("Preferências salvas.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido.");
    } finally {
      setSaving(false);
      setSearching(false);
    }
  }

  return (
    <div className="ambient-shell">
      <div className="ambient-content proto-shell-sm">
        <section className="proto-card" style={{ padding: "clamp(22px,4vw,32px)", display: "grid", gap: 18, maxWidth: 760 }}>
          <div>
            <p className="proto-eyebrow">Preferências de busca</p>
            <h2 className="proto-title" style={{ fontSize: "1.4rem", margin: 0 }}>Preferências de busca</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="proto-field"><label>Cargo desejado</label><input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} /></div>
            <div className="proto-field"><label>Área</label><input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} /></div>
            <div className="proto-field"><label>Cidade</label><input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} /></div>
            <div className="proto-field"><label>Modelo</label><select value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })}><option>Híbrido</option><option>Remoto</option><option>Presencial</option><option>Qualquer</option></select></div>
            <div className="proto-field"><label>Nível</label><select value={form.nivel} onChange={(e) => setForm({ ...form, nivel: e.target.value })}><option>Qualquer</option><option>Estágio</option><option>Júnior</option><option>Pleno</option><option>Sênior</option></select></div>
            <div className="proto-field"><label>Pretensão salarial</label><input value={form.salarioMax ? `R$ ${form.salarioMin || "0"} — ${form.salarioMax}` : form.salarioMin || ""} onChange={(e) => setForm({ ...form, salarioMin: e.target.value, salarioMax: "" })} placeholder="R$ 2.500 — 4.000" /></div>
          </div>
          {error && <p className="form-error">{error}</p>}
          {msg && <p className="proto-success-soft" style={{ margin: 0, padding: 12, borderRadius: 12 }}>{msg}</p>}
          <button className="proto-btn primary" type="button" onClick={() => saveAndOptionallySearch(false)} disabled={saving || searching}>{saving ? <Loader2 className="spin" size={18} /> : <Save size={18} />} Salvar preferências</button>
        </section>
      </div>
    </div>
  );
}
