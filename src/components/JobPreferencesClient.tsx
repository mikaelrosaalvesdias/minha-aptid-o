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
    <div className="card" style={{ padding: "32px", display: "grid", gap: "20px" }}>
      <h2 style={{ margin: 0 }}>Preferências de busca de vagas</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <div className="field">
          <label>Cargo desejado</label>
          <input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} placeholder="Ex: Analista de Marketing" />
        </div>
        <div className="field">
          <label>Área desejada</label>
          <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Ex: Marketing" />
        </div>
        <div className="field">
          <label>Cidade</label>
          <input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} placeholder="Ex: São Paulo" />
        </div>
        <div className="field">
          <label>Estado</label>
          <input value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} placeholder="Ex: SP" />
        </div>
        <div className="field">
          <label>Modelo de trabalho</label>
          <select value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })}>
            <option value="qualquer">Qualquer um</option>
            <option value="presencial">Presencial</option>
            <option value="hibrido">Híbrido</option>
            <option value="remoto">Remoto</option>
          </select>
        </div>
        <div className="field">
          <label>Nível</label>
          <select value={form.nivel} onChange={(e) => setForm({ ...form, nivel: e.target.value })}>
            <option value="qualquer">Qualquer um</option>
            <option value="estagio">Estágio</option>
            <option value="junior">Júnior</option>
            <option value="pleno">Pleno</option>
            <option value="senior">Sênior</option>
            <option value="lideranca">Liderança</option>
          </select>
        </div>
        <div className="field">
          <label>Tipo de contrato</label>
          <select value={form.contrato} onChange={(e) => setForm({ ...form, contrato: e.target.value })}>
            <option value="qualquer">Qualquer um</option>
            <option value="clt">CLT</option>
            <option value="pj">PJ</option>
            <option value="estagio">Estágio</option>
            <option value="freelancer">Freelancer</option>
            <option value="temporario">Temporário</option>
          </select>
        </div>
        <div className="field">
          <label>Pretensão salarial mínima (R$)</label>
          <input type="number" min="0" value={form.salarioMin} onChange={(e) => setForm({ ...form, salarioMin: e.target.value })} placeholder="Ex: 2000" />
        </div>
        <div className="field">
          <label>Pretensão salarial máxima (R$)</label>
          <input type="number" min="0" value={form.salarioMax} onChange={(e) => setForm({ ...form, salarioMax: e.target.value })} placeholder="Ex: 5000" />
        </div>
        <div className="field">
          <label>Frequência de busca automática</label>
          <select value={form.frequenciaBusca} onChange={(e) => setForm({ ...form, frequenciaBusca: e.target.value })}>
            <option value="manual">Manual (eu disparo)</option>
            <option value="diaria">Diária</option>
            <option value="semanal">Semanal</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label>Palavras-chave desejadas (separadas por vírgula)</label>
        <input value={form.keywordsDesejadas} onChange={(e) => setForm({ ...form, keywordsDesejadas: e.target.value })} placeholder="Ex: inbound, social media, Copywriting" />
      </div>
      <div className="field">
        <label>Palavras-chave a evitar (separadas por vírgula)</label>
        <input value={form.keywordsEvitar} onChange={(e) => setForm({ ...form, keywordsEvitar: e.target.value })} placeholder="Ex: experiência obrigatória, gestão de pessoas" />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
        <label className="consent-check">
          <input type="checkbox" checked={form.aceitaSemSalario} onChange={(e) => setForm({ ...form, aceitaSemSalario: e.target.checked })} />
          <span>Aceito vagas sem salário informado</span>
        </label>
        <label className="consent-check">
          <input type="checkbox" checked={form.aceitaForaCidade} onChange={(e) => setForm({ ...form, aceitaForaCidade: e.target.checked })} />
          <span>Aceito vagas fora da minha cidade</span>
        </label>
        <label className="consent-check">
          <input type="checkbox" checked={form.recebeNotificacoes} onChange={(e) => setForm({ ...form, recebeNotificacoes: e.target.checked })} />
          <span>Quero receber notificações no app</span>
        </label>
      </div>

      {error && <p className="form-error">{error}</p>}
      {msg && <p style={{ color: "#6ee7b7", fontWeight: 600 }}>{msg}</p>}

      <div className="job-actions">
        <button className="button secondary" onClick={() => saveAndOptionallySearch(false)} disabled={saving || searching}>
          {saving ? <Loader2 className="spin" size={18} /> : <Save size={18} />} Salvar preferências
        </button>
        <button className="button" onClick={() => saveAndOptionallySearch(true)} disabled={saving || searching}>
          {searching ? <Loader2 className="spin" size={18} /> : <Search size={18} />} Salvar e buscar vagas agora
        </button>
      </div>
    </div>
  );
}
