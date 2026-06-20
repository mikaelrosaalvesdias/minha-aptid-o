"use client";

import { useState } from "react";
import { Loader2, Save, FileText } from "lucide-react";

type JobProfileData = {
  hasResult: boolean;
  resultId?: string | null;
  topProfileNames: string[];
  strengths: string[];
  keywords: string[];
  jobProfile: {
    id: string;
    phone?: string | null;
    city?: string | null;
    state?: string | null;
    linkedin?: string | null;
    country?: string | null;
    countryCode?: string | null;
    location?: string | null;
    workAuthorization?: string | null;
    needsVisaSponsorship?: boolean | null;
    citizenshipStatus?: string | null;
    englishLevel?: string | null;
    currentSalary?: string | null;
    currentEmployer?: string | null;
    currentRole?: string | null;
    latestSchool?: string | null;
    latestDegree?: string | null;
    onsiteAvailability?: string | null;
    applicationSource?: string | null;
    pretensaoMin?: number | null;
    pretensaoMax?: number | null;
    summary?: string | null;
  } | null;
};

export function JobProfileClient({ initial }: { initial: JobProfileData | null }) {
  const [hasResult] = useState(initial?.hasResult ?? false);
  const [form, setForm] = useState({
    phone: initial?.jobProfile?.phone ?? "",
    city: initial?.jobProfile?.city ?? "",
    state: initial?.jobProfile?.state ?? "",
    linkedin: initial?.jobProfile?.linkedin ?? "",
    country: initial?.jobProfile?.country ?? "Brasil",
    countryCode: initial?.jobProfile?.countryCode ?? "BR",
    location: initial?.jobProfile?.location ?? "",
    workAuthorization: initial?.jobProfile?.workAuthorization ?? "",
    needsVisaSponsorship: initial?.jobProfile?.needsVisaSponsorship ?? false,
    citizenshipStatus: initial?.jobProfile?.citizenshipStatus ?? "",
    englishLevel: initial?.jobProfile?.englishLevel ?? "",
    currentSalary: initial?.jobProfile?.currentSalary ?? "",
    currentEmployer: initial?.jobProfile?.currentEmployer ?? "",
    currentRole: initial?.jobProfile?.currentRole ?? "",
    latestSchool: initial?.jobProfile?.latestSchool ?? "",
    latestDegree: initial?.jobProfile?.latestDegree ?? "",
    onsiteAvailability: initial?.jobProfile?.onsiteAvailability ?? "",
    applicationSource: initial?.jobProfile?.applicationSource ?? "LinkedIn",
    pretensaoMin: initial?.jobProfile?.pretensaoMin?.toString() ?? "",
    pretensaoMax: initial?.jobProfile?.pretensaoMax?.toString() ?? "",
    summary: initial?.jobProfile?.summary ?? ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    setMsg("");
    try {
      const res = await fetch("/api/jobs/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: form.phone || null,
          city: form.city || null,
          state: form.state || null,
          linkedin: form.linkedin || null,
          country: form.country || null,
          countryCode: form.countryCode || null,
          location: form.location || null,
          workAuthorization: form.workAuthorization || null,
          needsVisaSponsorship: form.needsVisaSponsorship,
          citizenshipStatus: form.citizenshipStatus || null,
          englishLevel: form.englishLevel || null,
          currentSalary: form.currentSalary || null,
          currentEmployer: form.currentEmployer || null,
          currentRole: form.currentRole || null,
          latestSchool: form.latestSchool || null,
          latestDegree: form.latestDegree || null,
          onsiteAvailability: form.onsiteAvailability || null,
          applicationSource: form.applicationSource || null,
          pretensaoMin: form.pretensaoMin ? parseFloat(form.pretensaoMin) : null,
          pretensaoMax: form.pretensaoMax ? parseFloat(form.pretensaoMax) : null,
          summary: form.summary || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar.");
      setMsg("Currículo para vagas salvo.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro.");
    } finally {
      setSaving(false);
    }
  }

  if (!hasResult) {
    return (
      <div className="card empty-state" style={{ padding: 40 }}>
        <FileText size={40} />
        <p>Você ainda não tem um resultado de aptidão salvo.</p>
        <p className="muted">Faça o teste de aptidão para gerar seu currículo. O Minha Aptidão usará esse currículo nas candidaturas.</p>
        <a href="/teste" className="button">Fazer o teste</a>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 32, display: "grid", gap: 20 }}>
      <div>
        <h2 style={{ margin: "0 0 8px" }}>Currículo usado nas candidaturas</h2>
        <p className="muted" style={{ margin: 0 }}>
          Estes dados são usados quando você clica em "Publicar currículo". O conteúdo de aptidão vem do seu último resultado salvo.
        </p>
      </div>

      <div className="card" style={{ padding: 18, background: "rgba(255,255,255,0.02)" }}>
        <p className="eyebrow" style={{ marginBottom: 8 }}>Vindo do seu perfil de aptidão</p>
        <div className="chip-list" style={{ marginBottom: 12 }}>
          {(initial?.topProfileNames ?? []).map((p) => <span key={p} className="pill">{p}</span>)}
        </div>
        <div className="chip-list">
          {(initial?.strengths ?? []).map((s) => <span key={s} className="pill" style={{ background: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.2)", color: "#6ee7b7" }}>{s}</span>)}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div className="field"><label>Telefone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" /></div>
        <div className="field"><label>Cidade</label><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="São Paulo" /></div>
        <div className="field"><label>Estado</label><input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="SP" /></div>
        <div className="field"><label>LinkedIn</label><input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="linkedin.com/in/seunome" /></div>
        <div className="field"><label>País</label><input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Brasil" /></div>
        <div className="field"><label>Código do país</label><input value={form.countryCode} onChange={(e) => setForm({ ...form, countryCode: e.target.value.toUpperCase().slice(0, 3) })} placeholder="BR" /></div>
        <div className="field"><label>Localização completa</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="São Paulo, SP, Brasil" /></div>
        <div className="field"><label>Autorização de trabalho</label><select value={form.workAuthorization} onChange={(e) => setForm({ ...form, workAuthorization: e.target.value })}><option value="">Não informado</option><option value="authorized_by_nationality">Autorizado por nacionalidade/residência</option><option value="authorized_by_permit">Autorizado por visto/permissão atual</option><option value="needs_sponsorship">Preciso de patrocínio de visto</option><option value="not_authorized">Não autorizado atualmente</option></select></div>
        <div className="field"><label>Nível de inglês</label><select value={form.englishLevel} onChange={(e) => setForm({ ...form, englishLevel: e.target.value })}><option value="">Não informado</option><option value="basico">Básico</option><option value="intermediario">Intermediário</option><option value="avancado">Avançado</option><option value="fluente">Fluente</option></select></div>
        <div className="field"><label>Empregador atual/anterior</label><input value={form.currentEmployer} onChange={(e) => setForm({ ...form, currentEmployer: e.target.value })} placeholder="Empresa atual ou anterior" /></div>
        <div className="field"><label>Cargo atual/anterior</label><input value={form.currentRole} onChange={(e) => setForm({ ...form, currentRole: e.target.value })} placeholder="Cargo atual ou anterior" /></div>
        <div className="field"><label>Escola mais recente</label><input value={form.latestSchool} onChange={(e) => setForm({ ...form, latestSchool: e.target.value })} placeholder="Instituição de ensino" /></div>
        <div className="field"><label>Grau/formação mais recente</label><input value={form.latestDegree} onChange={(e) => setForm({ ...form, latestDegree: e.target.value })} placeholder="Ensino médio, Técnico, Graduação..." /></div>
        <div className="field"><label>Salário atual</label><input value={form.currentSalary} onChange={(e) => setForm({ ...form, currentSalary: e.target.value })} placeholder="Opcional" /></div>
        <div className="field"><label>Disponibilidade presencial/híbrida</label><input value={form.onsiteAvailability} onChange={(e) => setForm({ ...form, onsiteAvailability: e.target.value })} placeholder="Ex: 2x por semana, remoto apenas" /></div>
        <div className="field"><label>Onde costuma encontrar vagas?</label><input value={form.applicationSource} onChange={(e) => setForm({ ...form, applicationSource: e.target.value })} placeholder="LinkedIn, Google, indicação..." /></div>
        <div className="field"><label>Cidadania / residência</label><input value={form.citizenshipStatus} onChange={(e) => setForm({ ...form, citizenshipStatus: e.target.value })} placeholder="Ex: Brasileiro, residente no Brasil" /></div>
        <div className="field"><label>Precisa de patrocínio de visto?</label><select value={form.needsVisaSponsorship ? "sim" : "nao"} onChange={(e) => setForm({ ...form, needsVisaSponsorship: e.target.value === "sim" })}><option value="nao">Não</option><option value="sim">Sim</option></select></div>
        <div className="field"><label>Pretensão mín. (R$)</label><input type="number" value={form.pretensaoMin} onChange={(e) => setForm({ ...form, pretensaoMin: e.target.value })} /></div>
        <div className="field"><label>Pretensão máx. (R$)</label><input type="number" value={form.pretensaoMax} onChange={(e) => setForm({ ...form, pretensaoMax: e.target.value })} /></div>
      </div>

      <div className="field">
        <label>Resumo profissional (opcional)</label>
        <textarea rows={4} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Um resumo curto usado nas candidaturas..." />
      </div>

      {error && <p className="form-error">{error}</p>}
      {msg && <p style={{ color: "#6ee7b7", fontWeight: 600 }}>{msg}</p>}

      <div className="job-actions">
        <button className="button" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="spin" size={18} /> : <Save size={18} />} Salvar dados de candidatura
        </button>
      </div>
    </div>
  );
}
