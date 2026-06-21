"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Search, Send, ExternalLink, CheckSquare, Square, RefreshCw, MapPin, Briefcase, Banknote, Calendar, AlertTriangle } from "lucide-react";

type Job = {
  id: string;
  title: string;
  company?: string | null;
  city?: string | null;
  state?: string | null;
  modelo?: string | null;
  salario?: string | null;
  source: string;
  sourceAutoSupport: string;
  status: string;
  compatibilityScore: number;
  compatibilityReason?: string | null;
  compatibilityBlock?: string | null;
  foundAt: string | Date;
  selected: boolean;
  originalUrl: string;
};

function compatColor(score: number): string {
  if (score >= 75) return "var(--success)";
  if (score >= 50) return "var(--primary)";
  if (score >= 30) return "var(--warning)";
  return "var(--danger)";
}

function sourceLabel(source: string): string {
  const map: Record<string, string> = {
    remotive: "Remotive",
    linkedin: "LinkedIn",
    indeed: "Indeed",
    vagas: "Vagas.com",
    catho: "Catho",
    infojobs: "InfoJobs",
    google_jobs: "Google Vagas",
    curado: "Busca curada"
  };
  return map[source] ?? source;
}

export function VagasClient({ initialJobs }: { initialJobs: Job[] }) {
  const router = useRouter();
  const [jobs, setJobs] = useState(initialJobs);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [filters, setFilters] = useState({ cargo: "", cidade: "", modelo: "qualquer", status: "", minScore: "" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialJobs.filter((j) => j.selected).map((j) => j.id)));
  const [showConsent, setShowConsent] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  async function loadJobs() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.cargo) params.set("cargo", filters.cargo);
      if (filters.cidade) params.set("cidade", filters.cidade);
      if (filters.modelo !== "qualquer") params.set("modelo", filters.modelo);
      if (filters.status) params.set("status", filters.status);
      if (filters.minScore) params.set("minScore", filters.minScore);
      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      setJobs(data.jobs ?? []);
      setSelectedIds(new Set((data.jobs ?? []).filter((j: Job) => j.selected).map((j: Job) => j.id)));
    } catch {
      setError("Não foi possível carregar as vagas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.cargo, filters.cidade, filters.modelo, filters.status, filters.minScore]);

  async function runSearch() {
    setSearching(true);
    setError("");
    try {
      const res = await fetch("/api/jobs/search", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro na busca.");
      await loadJobs();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro na busca.");
    } finally {
      setSearching(false);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    const isSelected = selectedIds.has(id);
    void fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ selected: !isSelected }),
      headers: { "Content-Type": "application/json" }
    });
  }

  async function selectAllFiltered(selected: boolean) {
    const ids = filteredJobs.map((j) => j.id);
    setSelectedIds(selected ? new Set(ids) : new Set());
    await fetch("/api/jobs/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobIds: ids, selected })
    });
  }

  const filteredJobs = useMemo(() => jobs, [jobs]);

  async function confirmPublish() {
    setPublishing(true);
    setError("");
    try {
      const res = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobIds: Array.from(selectedIds), consent: true })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao publicar.");
      router.push("/vagas/publicar");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao publicar.");
    } finally {
      setPublishing(false);
      setShowConsent(false);
    }
  }

  const selectedCount = selectedIds.size;

  return (
    <div className="ambient-shell">
      <div className="ambient-content proto-shell" style={{ display: "grid", gap: 24 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <p className="proto-eyebrow">Área de vagas</p>
            <h1 className="proto-title" style={{ fontSize: "clamp(1.9rem,3.6vw,2.7rem)" }}>Vagas compatíveis com você</h1>
          </div>
          <Link href="/vagas/notificacoes" className="proto-btn" style={{ position: "relative" }}><AlertTriangle size={18} /> Notificações</Link>
        </div>

        <nav className="proto-tabs" aria-label="Abas de vagas">
          <Link href="/vagas" className="active">Buscar</Link>
          <Link href="/vagas/publicar">Fila & publicar</Link>
          <Link href="/vagas/historico">Histórico</Link>
          <Link href="/vagas/notificacoes">Notificações</Link>
          <Link href="/vagas/preferencias">Preferências</Link>
        </nav>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, padding: 18, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "var(--shadow-card)" }}>
            <div className="proto-field"><input value={filters.cargo} onChange={(e) => setFilters({ ...filters, cargo: e.target.value })} placeholder="Cargo ou palavra-chave" /></div>
            <div className="proto-field"><input value={filters.cidade} onChange={(e) => setFilters({ ...filters, cidade: e.target.value })} placeholder="Cidade" /></div>
            <div className="proto-field"><select value={filters.modelo} onChange={(e) => setFilters({ ...filters, modelo: e.target.value })}><option value="qualquer">Modelo: todos</option><option value="remoto">Remoto</option><option value="hibrido">Híbrido</option><option value="presencial">Presencial</option></select></div>
            <button className="proto-btn primary" type="button" onClick={runSearch} disabled={searching}>{searching ? <Loader2 className="spin" size={18} /> : <Search size={18} />} Buscar vagas</button>
          </div>

        <div className="proto-card primary-soft" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", padding: "14px 20px" }}>
          <span style={{ fontWeight: 600, fontSize: ".95rem", color: "var(--text)" }}>Encontramos <strong style={{ color: "var(--primary)" }}>{filteredJobs.length} vagas</strong> alinhadas ao seu perfil analítico</span>
          <div className="job-actions">
            <Link href="/vagas/publicar" className="proto-btn primary" style={{ height: 42 }}>Fila & publicar</Link>
            <button className="proto-btn primary" type="button" onClick={() => setShowConsent(true)} disabled={publishing || selectedCount === 0}>{publishing ? <Loader2 className="spin" size={18} /> : <Send size={18} />} Adicionar selecionadas à fila</button>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="selection-bar" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="selection-count"><strong>{selectedCount}</strong> vaga(s) selecionada(s) · {filteredJobs.length} encontrada(s)</div>
          <div className="job-actions">
            <button className="proto-btn ghost" onClick={() => selectAllFiltered(true)}><CheckSquare size={16} /> Selecionar todas</button>
            <button className="proto-btn ghost" onClick={() => selectAllFiltered(false)}><Square size={16} /> Limpar seleção</button>
          </div>
        </div>

        {loading || searching ? (
          <div className="inline-loading" style={{ padding: "40px" }}><Loader2 className="spin" size={20} /> {searching ? "Buscando vagas na internet..." : "Carregando..."}</div>
        ) : filteredJobs.length === 0 ? (
          <div className="proto-card empty-state"><Search size={40} /><p>Nenhuma vaga encontrada ainda.</p><Link href="/vagas/preferencias" className="proto-btn primary">Configurar preferências e buscar</Link></div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 16 }}>
            {filteredJobs.map((job) => {
              const selected = selectedIds.has(job.id);
              const color = compatColor(job.compatibilityScore);
              return (
                <div key={job.id} className="proto-card" style={{ padding: 22, display: "grid", gap: 14, borderColor: selected ? "var(--primary)" : undefined }}>
                  <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                    <input type="checkbox" checked={selected} onChange={() => toggleSelect(job.id)} style={{ width: 21, height: 21, marginTop: 3, accentColor: "var(--primary)", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}><span style={{ fontSize: ".72rem", letterSpacing: ".06em", textTransform: "uppercase", color: "var(--primary)", fontWeight: 700 }}>{sourceLabel(job.source)}</span><Link href={`/vagas/${job.id}`}><h3 style={{ margin: "3px 0 0", fontSize: "1.12rem", fontWeight: 600, lineHeight: 1.3 }}>{job.title}</h3></Link><p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: ".9rem", fontWeight: 600 }}>{job.company}</p></div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {(job.city || job.state) && <span style={{ fontSize: ".78rem", color: "var(--muted)", background: "var(--surface-2)", padding: "4px 11px", borderRadius: 999, border: "1px solid var(--border)" }}><MapPin size={12} style={{ display: "inline", marginRight: 4 }} />{[job.city, job.state].filter(Boolean).join(", ")}</span>}
                    {job.modelo && <span style={{ fontSize: ".78rem", color: "var(--muted)", background: "var(--surface-2)", padding: "4px 11px", borderRadius: 999, border: "1px solid var(--border)" }}><Briefcase size={12} style={{ display: "inline", marginRight: 4 }} />{job.modelo}</span>}
                    {job.salario && <span style={{ fontSize: ".78rem", color: "var(--muted)", background: "var(--surface-2)", padding: "4px 11px", borderRadius: 999, border: "1px solid var(--border)" }}><Banknote size={12} style={{ display: "inline", marginRight: 4 }} />{job.salario}</span>}
                    <span style={{ fontSize: ".78rem", color: "var(--muted)", background: "var(--surface-2)", padding: "4px 11px", borderRadius: 999, border: "1px solid var(--border)" }}><Calendar size={12} style={{ display: "inline", marginRight: 4 }} />{new Date(job.foundAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ fontFamily: "var(--font-head)", fontSize: "1.4rem", fontWeight: 600, color }}>{job.compatibilityScore}%</span><div style={{ flex: 1, height: 8, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden" }}><div style={{ height: "100%", width: `${job.compatibilityScore}%`, borderRadius: 999, background: color }} /></div></div>
                  {job.compatibilityReason && <p className="muted" style={{ margin: 0, fontSize: ".86rem", lineHeight: 1.5 }}>{job.compatibilityReason}</p>}
                  <div className="job-actions" style={{ marginTop: "auto" }}>
                    <a href={job.originalUrl} target="_blank" rel="noreferrer" className="proto-btn" style={{ height: 44 }}><ExternalLink size={15} /> Ver detalhes</a>
                    <span className={`status-badge status-${job.status}`}>{job.status.replace(/_/g, " ")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showConsent && (
          <div className="proto-modal-overlay" onClick={() => setShowConsent(false)}>
            <div className="proto-modal" onClick={(e) => e.stopPropagation()} style={{ padding: 30, textAlign: "center", justifyItems: "center" }}>
              <span style={{ display: "inline-flex", width: 60, height: 60, alignItems: "center", justifyContent: "center", borderRadius: 18, background: "var(--primary-soft)", color: "var(--primary)" }}><Briefcase size={28} /></span>
              <div><h2 className="proto-title" style={{ fontSize: "1.4rem", margin: 0 }}>Adicionar à fila de candidatura?</h2><p style={{ margin: "10px 0 0", color: "var(--muted)", lineHeight: 1.6, fontSize: ".96rem" }}>Vamos preparar sua candidatura para as vagas selecionadas. Você confirma antes de qualquer envio.</p></div>
              <div style={{ display: "flex", gap: 10, width: "100%" }}><button className="proto-btn" onClick={() => setShowConsent(false)}>Cancelar</button><button className="proto-btn primary" onClick={confirmPublish} disabled={publishing}>{publishing ? <Loader2 className="spin" size={18} /> : <Send size={18} />} Adicionar à fila</button></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
