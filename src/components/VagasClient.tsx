"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Search, Send, ExternalLink, CheckSquare, Square, RefreshCw, MapPin, Briefcase, Banknote, Calendar } from "lucide-react";

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
  if (score >= 75) return "#10b981";
  if (score >= 50) return "#8b5cf6";
  if (score >= 30) return "#f59e0b";
  return "#ef4444";
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
    <div className="vagas-shell">
      <div className="vagas-head">
        <div>
          <p className="eyebrow">Área de Vagas</p>
          <h1>Vagas compatíveis com você</h1>
        </div>
        <div className="job-actions">
          <Link href="/vagas/preferencias" className="button secondary">Preferências</Link>
          <button className="button secondary" onClick={runSearch} disabled={searching}>
            {searching ? <Loader2 className="spin" size={18} /> : <RefreshCw size={18} />} Buscar agora
          </button>
        </div>
      </div>

      <div className="card job-filters">
        <div className="field">
          <label>Cargo</label>
          <input value={filters.cargo} onChange={(e) => setFilters({ ...filters, cargo: e.target.value })} placeholder="Filtrar por cargo..." />
        </div>
        <div className="field">
          <label>Cidade/Estado</label>
          <input value={filters.cidade} onChange={(e) => setFilters({ ...filters, cidade: e.target.value })} placeholder="Filtrar por local..." />
        </div>
        <div className="field">
          <label>Modelo</label>
          <select value={filters.modelo} onChange={(e) => setFilters({ ...filters, modelo: e.target.value })}>
            <option value="qualquer">Todos</option>
            <option value="presencial">Presencial</option>
            <option value="hibrido">Híbrido</option>
            <option value="remoto">Remoto</option>
          </select>
        </div>
        <div className="field">
          <label>Compatibilidade mín.</label>
          <select value={filters.minScore} onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}>
            <option value="">Qualquer</option>
            <option value="30">30+</option>
            <option value="50">50+</option>
            <option value="75">75+</option>
          </select>
        </div>
        <div className="field">
          <label>Status</label>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">Todos</option>
            <option value="nova">Nova</option>
            <option value="publicado">Candidatado</option>
            <option value="acao_manual">Ação manual</option>
          </select>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="selection-bar">
        <div className="selection-count">
          <strong>{selectedCount}</strong> vaga(s) selecionada(s) · {filteredJobs.length} encontrada(s)
        </div>
        <div className="job-actions">
          <button className="button ghost" onClick={() => selectAllFiltered(true)}>
            <CheckSquare size={16} /> Selecionar todas
          </button>
          <button className="button ghost" onClick={() => selectAllFiltered(false)}>
            <Square size={16} /> Limpar seleção
          </button>
        </div>
      </div>

      {loading || searching ? (
        <div className="inline-loading" style={{ padding: "40px" }}>
          <Loader2 className="spin" size={20} /> {searching ? "Buscando vagas na internet..." : "Carregando..."}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="card empty-state">
          <Search size={40} />
          <p>Nenhuma vaga encontrada ainda.</p>
          <Link href="/vagas/preferencias" className="button">Configurar preferências e buscar</Link>
        </div>
      ) : (
        <div className="job-grid">
          {filteredJobs.map((job) => {
            const selected = selectedIds.has(job.id);
            const color = compatColor(job.compatibilityScore);
            return (
              <div key={job.id} className="card job-card" style={selected ? { borderColor: "rgba(139,92,246,0.5)" } : undefined}>
                <div className="job-card-top">
                  <input type="checkbox" className="job-check" checked={selected} onChange={() => toggleSelect(job.id)} />
                  <div style={{ flex: 1 }}>
                    <Link href={`/vagas/${job.id}`}>
                      <h3 className="job-title">{job.title}</h3>
                    </Link>
                    {job.company && <p className="job-company">{job.company}</p>}
                  </div>
                </div>

                <div className="job-meta">
                  {(job.city || job.state) && <span><MapPin size={12} style={{ display: "inline", marginRight: 4 }} />{[job.city, job.state].filter(Boolean).join(", ")}</span>}
                  {job.modelo && <span><Briefcase size={12} style={{ display: "inline", marginRight: 4 }} />{job.modelo}</span>}
                  {job.salario && <span><Banknote size={12} style={{ display: "inline", marginRight: 4 }} />{job.salario}</span>}
                  <span><Calendar size={12} style={{ display: "inline", marginRight: 4 }} />{new Date(job.foundAt).toLocaleDateString("pt-BR")}</span>
                  <span className="job-source">{sourceLabel(job.source)}</span>
                </div>

                <div className="compat-row">
                  <span className="compat-score" style={{ color }}>{job.compatibilityScore}</span>
                  <div className="compat-bar">
                    <div className="compat-fill" style={{ width: `${job.compatibilityScore}%`, background: color }} />
                  </div>
                </div>
                {job.compatibilityReason && <p className="compat-reason">{job.compatibilityReason}</p>}
                {job.compatibilityBlock && <p className="compat-block">⚠ {job.compatibilityBlock}</p>}

                <div className="job-actions" style={{ marginTop: "auto" }}>
                  <a href={job.originalUrl} target="_blank" rel="noreferrer" className="button secondary" style={{ minHeight: 40, padding: "0 16px" }}>
                    <ExternalLink size={15} /> Abrir vaga
                  </a>
                  <span className={`status-badge status-${job.status}`}>{job.status.replace(/_/g, " ")}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedCount > 0 && (
        <div className="selection-bar" style={{ position: "sticky", bottom: 16 }}>
          <div className="selection-count">Pronto para candidatar em <strong>{selectedCount}</strong> vaga(s)</div>
          <button className="button" onClick={() => setShowConsent(true)} disabled={publishing}>
            {publishing ? <Loader2 className="spin" size={18} /> : <Send size={18} />} Publicar currículo nas selecionadas
          </button>
        </div>
      )}

      {showConsent && (
        <div className="capacity-modal" onClick={() => setShowConsent(false)}>
          <div className="capacity-dialog card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="dialog-title">
              <div>
                <h3>Confirmar candidatura</h3>
              </div>
              <button className="button ghost" onClick={() => setShowConsent(false)} style={{ minHeight: 36 }}>×</button>
            </div>
            <div className="consent-box">
              <p>
                Você está prestes a publicar seu currículo nas <strong>{selectedCount}</strong> vagas selecionadas.
                O Minha Aptidão usará o currículo salvo no seu perfil e seus dados cadastrais para tentar realizar a candidatura.
                Algumas vagas podem exigir ação manual. Deseja continuar?
              </p>
            </div>
            <div className="job-actions" style={{ justifyContent: "flex-end" }}>
              <button className="button secondary" onClick={() => setShowConsent(false)}>Cancelar</button>
              <button className="button" onClick={confirmPublish} disabled={publishing}>
                {publishing ? <Loader2 className="spin" size={18} /> : <Send size={18} />} Confirmar e publicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
