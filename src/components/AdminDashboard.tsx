"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, Save } from "lucide-react";

type Overview = {
  stats: {
    sessionCount: number;
    resultCount: number;
    commonProfiles: { slug: string; name: string; count: number }[];
  };
  questions: AdminQuestion[];
  profiles: AdminProfile[];
  courses: AdminCourse[];
  integrationProviders: AdminIntegrationProvider[];
  logs: { id: string; level: string; message: string; createdAt: string }[];
};

type AdminQuestion = {
  id: string;
  slug: string;
  text: string;
  category: string;
  active: boolean;
  order: number;
  average: number | null;
  answers: number;
  weights: { profileSlug: string; profileName: string; weight: number }[];
};

type AdminProfile = {
  slug: string;
  name: string;
  description: string;
  strengths: string[];
  attentionPoints: string[];
  suggestedDegrees: string[];
  suggestedShortCourses: string[];
  searchKeywords: string[];
};

type AdminCourse = {
  id: string;
  profileSlug: string;
  title: string;
  provider: string;
  url: string;
  type: string;
  active: boolean;
  order: number;
};

type AdminIntegrationProvider = {
  id: string;
  name: string;
  slug: string;
  type: string;
  authType: string;
  status: string;
  baseUrl: string | null;
  capabilities: string[];
  scopes: string[];
  isVisibleToUsers: boolean;
  environment: string;
  dailyLimit: number;
  monthlyLimit: number;
  lastHealthcheckAt: string | null;
  lastHealthcheckStatus: string | null;
  lastError: string | null;
  activeAt: string | null;
  notes: string | null;
};

const emptyCourse = {
  profileSlug: "",
  title: "",
  provider: "",
  url: "",
  type: "curso",
  active: true,
  order: 0,
  isFree: true,
  source: "admin"
};

function toLines(items: string[]) {
  return items.join("\n");
}

function fromLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toProviderForm(provider: AdminIntegrationProvider) {
  return {
    id: provider.id,
    name: provider.name,
    slug: provider.slug,
    type: provider.type,
    authType: provider.authType,
    status: provider.status,
    baseUrl: provider.baseUrl ?? "",
    capabilities: provider.capabilities,
    scopes: provider.scopes,
    isVisibleToUsers: provider.isVisibleToUsers,
    environment: provider.environment,
    dailyLimit: provider.dailyLimit,
    monthlyLimit: provider.monthlyLimit,
    notes: provider.notes ?? "",
    clientId: "",
    clientSecret: "",
    apiKey: "",
    webhookSecret: ""
  };
}

export function AdminDashboard() {
  const router = useRouter();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [message, setMessage] = useState("");
  const [selectedProfileSlug, setSelectedProfileSlug] = useState("");
  const [newCourse, setNewCourse] = useState(emptyCourse);
  const [selectedIntegrationProviderId, setSelectedIntegrationProviderId] = useState("");
  const [integrationProviderForm, setIntegrationProviderForm] = useState<Partial<AdminIntegrationProvider> & { clientId?: string; clientSecret?: string; apiKey?: string; webhookSecret?: string }>({});
  const [atsBoards, setAtsBoards] = useState<Array<{ id: string; source: string; boardKey: string; label: string; active: boolean }>>([]);
  const [newBoard, setNewBoard] = useState({ source: "greenhouse" as "greenhouse" | "lever", boardKey: "", label: "" });

  async function load() {
    const response = await fetch("/api/admin/overview");
    if (response.status === 401) {
      router.refresh();
      return;
    }
    const data = await response.json();
    setOverview(data);
    setSelectedProfileSlug((current) => current || data.profiles?.[0]?.slug || "");
    setSelectedIntegrationProviderId((current) => current || data.integrationProviders?.[0]?.id || "");
    setNewCourse((current) => ({ ...current, profileSlug: data.profiles?.[0]?.slug || "" }));
    if (data.integrationProviders?.[0]) setIntegrationProviderForm(toProviderForm(data.integrationProviders[0]));
  }

  async function loadAtsBoards() {
    try {
      const res = await fetch("/api/admin/ats-boards");
      if (res.ok) {
        const data = await res.json();
        setAtsBoards(data.boards ?? []);
      }
    } catch {}
  }

  useEffect(() => {
    load();
    loadAtsBoards();
  }, []);

  const selectedProfile = useMemo(() => {
    return overview?.profiles.find((profile) => profile.slug === selectedProfileSlug) ?? null;
  }, [overview, selectedProfileSlug]);

  const selectedIntegrationProvider = useMemo(() => {
    return overview?.integrationProviders.find((provider) => provider.id === selectedIntegrationProviderId) ?? null;
  }, [overview, selectedIntegrationProviderId]);

  useEffect(() => {
    if (selectedIntegrationProvider) setIntegrationProviderForm(toProviderForm(selectedIntegrationProvider));
  }, [selectedIntegrationProviderId, selectedIntegrationProvider]);

  async function createBoard() {
    if (!newBoard.boardKey.trim() || !newBoard.label.trim()) return;
    try {
      const res = await fetch("/api/admin/ats-boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newBoard, active: true })
      });
      if (res.ok) {
        setMessage("Board ATS adicionado.");
        setNewBoard({ source: "greenhouse", boardKey: "", label: "" });
        await loadAtsBoards();
      } else {
        const data = await res.json();
        setMessage(data.error || "Erro ao adicionar board.");
      }
    } catch {
      setMessage("Erro ao adicionar board.");
    }
  }

  async function toggleBoard(board: { id: string; active: boolean; source: string; boardKey: string; label: string }) {
    try {
      const res = await fetch("/api/admin/ats-boards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...board, active: !board.active })
      });
      if (res.ok) await loadAtsBoards();
    } catch {}
  }

  async function deleteBoard(id: string) {
    try {
      const res = await fetch(`/api/admin/ats-boards?id=${id}`, { method: "DELETE" });
      if (res.ok) await loadAtsBoards();
    } catch {}
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  async function saveQuestion(question: AdminQuestion) {
    setMessage("");
    const weights = Object.fromEntries(question.weights.map((weight) => [weight.profileSlug, weight.weight]));
    const response = await fetch("/api/admin/questions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: question.id,
        text: question.text,
        active: question.active,
        order: question.order,
        weights
      })
    });
    setMessage(response.ok ? "Pergunta salva." : "Não foi possível salvar a pergunta.");
    await load();
  }

  async function saveProfile(profile: AdminProfile) {
    setMessage("");
    const response = await fetch("/api/admin/profiles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });
    setMessage(response.ok ? "Perfil salvo." : "Não foi possível salvar o perfil.");
    await load();
  }

  async function createCourse() {
    setMessage("");
    const response = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCourse)
    });
    setMessage(response.ok ? "Fonte de curso criada." : "Não foi possível criar a fonte.");
    setNewCourse({ ...emptyCourse, profileSlug: newCourse.profileSlug });
    await load();
  }

  async function createIntegrationProvider() {
    setMessage("");
    const response = await fetch("/api/admin/integrations/providers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: integrationProviderForm.name || "Novo provider",
        slug: integrationProviderForm.slug || "novo-provider",
        type: integrationProviderForm.type || "job_distribution",
        authType: integrationProviderForm.authType || "not_available",
        status: integrationProviderForm.status || "pending_credentials",
        baseUrl: integrationProviderForm.baseUrl || null,
        scopes: integrationProviderForm.scopes || [],
        capabilities: integrationProviderForm.capabilities || [],
        isVisibleToUsers: Boolean(integrationProviderForm.isVisibleToUsers),
        environment: integrationProviderForm.environment || "production",
        dailyLimit: Number(integrationProviderForm.dailyLimit || 0),
        monthlyLimit: Number(integrationProviderForm.monthlyLimit || 0),
        notes: integrationProviderForm.notes || null
      })
    });
    setMessage(response.ok ? "Provider de integração criado." : "Não foi possível criar o provider.");
    await load();
  }

  async function saveIntegrationProvider() {
    if (!integrationProviderForm.id) return;
    setMessage("");
    const response = await fetch(`/api/admin/integrations/providers/${integrationProviderForm.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...integrationProviderForm,
        baseUrl: integrationProviderForm.baseUrl || null,
        clientId: integrationProviderForm.clientId || undefined,
        clientSecret: integrationProviderForm.clientSecret || undefined,
        apiKey: integrationProviderForm.apiKey || undefined,
        webhookSecret: integrationProviderForm.webhookSecret || undefined
      })
    });
    const data = await response.json();
    setMessage(response.ok ? "Provider salvo." : data.error || "Não foi possível salvar o provider.");
    await load();
  }

  async function runIntegrationAction(action: "test" | "enable" | "disable") {
    if (!integrationProviderForm.id) return;
    setMessage("");
    const response = await fetch(`/api/admin/integrations/providers/${integrationProviderForm.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    const data = await response.json();
    setMessage(response.ok ? (action === "test" ? `Teste: ${data.message || "ok"}` : "Provider atualizado.") : data.error || "Não foi possível executar a ação.");
    await load();
  }

  function updateIntegrationProvider(patch: Partial<AdminIntegrationProvider> & { clientId?: string; clientSecret?: string; apiKey?: string; webhookSecret?: string }) {
    setIntegrationProviderForm((current) => ({ ...current, ...patch }));
  }

  async function toggleCourse(course: AdminCourse) {
    const response = await fetch("/api/admin/courses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...course, isFree: true, source: "admin", active: !course.active })
    });
    setMessage(response.ok ? "Fonte atualizada." : "Não foi possível atualizar a fonte.");
    await load();
  }

  if (!overview) {
    return (
      <div className="loading-state card">
        <Loader2 className="spin" size={20} /> Carregando admin...
      </div>
    );
  }

  function updateQuestion(id: string, patch: Partial<AdminQuestion>) {
    setOverview((current) =>
      current
        ? {
            ...current,
            questions: current.questions.map((question) => (question.id === id ? { ...question, ...patch } : question))
          }
        : current
    );
  }

  function updateQuestionWeight(questionId: string, profileSlug: string, weight: number) {
    setOverview((current) =>
      current
        ? {
            ...current,
            questions: current.questions.map((question) =>
              question.id === questionId
                ? {
                    ...question,
                    weights: question.weights.map((item) => (item.profileSlug === profileSlug ? { ...item, weight } : item))
                  }
                : question
            )
          }
        : current
    );
  }

  function updateProfile(patch: Partial<AdminProfile>) {
    if (!selectedProfile) return;
    setOverview((current) =>
      current
        ? {
            ...current,
            profiles: current.profiles.map((profile) =>
              profile.slug === selectedProfile.slug ? { ...profile, ...patch } : profile
            )
          }
        : current
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-top">
        <div>
          <p className="eyebrow">Painel interno</p>
          <h1>Mapa de Aptidão</h1>
        </div>
        <button className="button secondary" type="button" onClick={logout}>
          <LogOut size={17} /> Sair
        </button>
      </div>

      {message && <div className="warning-box">{message}</div>}

      <section className="admin-stats">
        <div className="stat-card card">
          <span>Testes respondidos</span>
          <strong>{overview.stats.resultCount}</strong>
        </div>
        <div className="stat-card card">
          <span>Sessões criadas</span>
          <strong>{overview.stats.sessionCount}</strong>
        </div>
        <div className="stat-card card">
          <span>Perfil mais comum</span>
          <strong>{overview.stats.commonProfiles[0]?.name ?? "Sem dados"}</strong>
        </div>
      </section>

      <section className="admin-section card">
        <h2>Perguntas e pesos</h2>
        <div className="admin-question-list">
          {overview.questions.map((question) => (
            <article className="admin-question" key={question.id}>
              <div className="field">
                <label>{question.category}</label>
                <textarea value={question.text} onChange={(event) => updateQuestion(question.id, { text: event.target.value })} />
              </div>
              <div className="admin-row">
                <label>
                  <input
                    type="checkbox"
                    checked={question.active}
                    onChange={(event) => updateQuestion(question.id, { active: event.target.checked })}
                  />
                  Ativa
                </label>
                <div className="field">
                  <label>Ordem</label>
                  <input
                    type="number"
                    value={question.order}
                    onChange={(event) => updateQuestion(question.id, { order: Number(event.target.value) })}
                  />
                </div>
                <span className="muted">
                  Média: {question.average ? question.average.toFixed(1) : "-"} · {question.answers} respostas
                </span>
              </div>
              <div className="weights-grid">
                {question.weights.map((weight) => (
                  <label key={weight.profileSlug}>
                    <span>{weight.profileName}</span>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      value={weight.weight}
                      onChange={(event) => updateQuestionWeight(question.id, weight.profileSlug, Number(event.target.value))}
                    />
                  </label>
                ))}
              </div>
              <button className="button secondary" type="button" onClick={() => saveQuestion(question)}>
                <Save size={16} /> Salvar pergunta
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-section card">
        <h2>Perfis</h2>
        <div className="field">
          <label>Perfil</label>
          <select value={selectedProfileSlug} onChange={(event) => setSelectedProfileSlug(event.target.value)}>
            {overview.profiles.map((profile) => (
              <option value={profile.slug} key={profile.slug}>
                {profile.name}
              </option>
            ))}
          </select>
        </div>
        {selectedProfile && (
          <div className="profile-editor">
            <div className="field">
              <label>Descrição</label>
              <textarea value={selectedProfile.description} onChange={(event) => updateProfile({ description: event.target.value })} />
            </div>
            <div className="grid-auto">
              <div className="field">
                <label>Forças</label>
                <textarea value={toLines(selectedProfile.strengths)} onChange={(event) => updateProfile({ strengths: fromLines(event.target.value) })} />
              </div>
              <div className="field">
                <label>Pontos de atenção</label>
                <textarea
                  value={toLines(selectedProfile.attentionPoints)}
                  onChange={(event) => updateProfile({ attentionPoints: fromLines(event.target.value) })}
                />
              </div>
              <div className="field">
                <label>Faculdades</label>
                <textarea
                  value={toLines(selectedProfile.suggestedDegrees)}
                  onChange={(event) => updateProfile({ suggestedDegrees: fromLines(event.target.value) })}
                />
              </div>
              <div className="field">
                <label>Palavras-chave</label>
                <textarea
                  value={toLines(selectedProfile.searchKeywords)}
                  onChange={(event) => updateProfile({ searchKeywords: fromLines(event.target.value) })}
                />
              </div>
            </div>
            <button className="button secondary" type="button" onClick={() => saveProfile(selectedProfile)}>
              <Save size={16} /> Salvar perfil
            </button>
          </div>
        )}
      </section>

      <section className="admin-section card">
        <h2>Fontes de cursos</h2>
        <div className="course-admin-form">
          <input placeholder="Título" value={newCourse.title} onChange={(event) => setNewCourse({ ...newCourse, title: event.target.value })} />
          <input placeholder="Fornecedor" value={newCourse.provider} onChange={(event) => setNewCourse({ ...newCourse, provider: event.target.value })} />
          <input placeholder="URL" value={newCourse.url} onChange={(event) => setNewCourse({ ...newCourse, url: event.target.value })} />
          <select value={newCourse.profileSlug} onChange={(event) => setNewCourse({ ...newCourse, profileSlug: event.target.value })}>
            {overview.profiles.map((profile) => (
              <option value={profile.slug} key={profile.slug}>
                {profile.name}
              </option>
            ))}
          </select>
          <button className="button" type="button" onClick={createCourse}>
            Criar fonte
          </button>
        </div>
        <div className="admin-course-list">
          {overview.courses.map((course) => (
            <div className="admin-course" key={course.id}>
              <strong>{course.title}</strong>
              <span>
                {course.provider} · {course.profileSlug}
              </span>
              {course.url && <a href={course.url} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", fontWeight: 700, fontSize: ".85rem" }}>Abrir link do curso</a>}
              <button className="button secondary" type="button" onClick={() => toggleCourse(course)}>
                {course.active ? "Desativar" : "Ativar"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section card">
        <h2>Integrações de Vagas</h2>
        <p className="muted" style={{ margin: 0 }}>
          Providers configuráveis para conexão externa, armazenamento de currículo e candidatura assistida. Providers sem API real ficam como pendentes e não exibem botão falso.
        </p>
        <div className="course-admin-form" style={{ marginTop: 16 }}>
          <select value={selectedIntegrationProviderId} onChange={(event) => setSelectedIntegrationProviderId(event.target.value)}>
            {overview.integrationProviders.map((provider) => (
              <option value={provider.id} key={provider.id}>
                {provider.name} · {provider.status}
              </option>
            ))}
          </select>
          <button className="button secondary" type="button" onClick={() => runIntegrationAction("test")}>Testar</button>
          <button className="button secondary" type="button" onClick={() => runIntegrationAction("enable")}>Ativar</button>
          <button className="button secondary" type="button" onClick={() => runIntegrationAction("disable")}>Desativar</button>
          <button className="button" type="button" onClick={saveIntegrationProvider}>Salvar provider</button>
          <button className="button secondary" type="button" onClick={createIntegrationProvider}>Criar provider</button>
        </div>
        <div className="course-admin-form" style={{ marginTop: 16 }}>
          <input placeholder="Nome" value={integrationProviderForm.name ?? ""} onChange={(event) => updateIntegrationProvider({ name: event.target.value })} />
          <input placeholder="Slug" value={integrationProviderForm.slug ?? ""} onChange={(event) => updateIntegrationProvider({ slug: event.target.value })} />
          <select value={integrationProviderForm.authType ?? "not_available"} onChange={(event) => updateIntegrationProvider({ authType: event.target.value })}>
            <option value="oauth">oauth</option>
            <option value="api_key">api_key</option>
            <option value="bearer_token">bearer_token</option>
            <option value="partner_api">partner_api</option>
            <option value="composio">composio</option>
            <option value="manual_assisted">manual_assisted</option>
            <option value="not_available">not_available</option>
          </select>
          <select value={integrationProviderForm.status ?? "pending_credentials"} onChange={(event) => updateIntegrationProvider({ status: event.target.value })}>
            <option value="active">active</option>
            <option value="disabled">disabled</option>
            <option value="sandbox">sandbox</option>
            <option value="pending_credentials">pending_credentials</option>
            <option value="pending_partner_access">pending_partner_access</option>
            <option value="error">error</option>
            <option value="deprecated">deprecated</option>
            <option value="manual_assisted">manual_assisted</option>
          </select>
          <input placeholder="Base URL" value={integrationProviderForm.baseUrl ?? ""} onChange={(event) => updateIntegrationProvider({ baseUrl: event.target.value })} />
          <select value={integrationProviderForm.environment ?? "production"} onChange={(event) => updateIntegrationProvider({ environment: event.target.value })}>
            <option value="production">production</option>
            <option value="sandbox">sandbox</option>
          </select>
          <input type="number" placeholder="Limite diário" value={integrationProviderForm.dailyLimit ?? 0} onChange={(event) => updateIntegrationProvider({ dailyLimit: Number(event.target.value) })} />
          <input type="number" placeholder="Limite mensal" value={integrationProviderForm.monthlyLimit ?? 0} onChange={(event) => updateIntegrationProvider({ monthlyLimit: Number(event.target.value) })} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
            <input type="checkbox" checked={Boolean(integrationProviderForm.isVisibleToUsers)} onChange={(event) => updateIntegrationProvider({ isVisibleToUsers: event.target.checked })} />
            Visível no perfil
          </label>
          <textarea placeholder="Observações internas" value={integrationProviderForm.notes ?? ""} onChange={(event) => updateIntegrationProvider({ notes: event.target.value })} />
          <input placeholder="Novo Client ID" value={integrationProviderForm.clientId ?? ""} onChange={(event) => updateIntegrationProvider({ clientId: event.target.value })} />
          <input placeholder="Novo Client Secret" value={integrationProviderForm.clientSecret ?? ""} onChange={(event) => updateIntegrationProvider({ clientSecret: event.target.value })} />
          <input placeholder="Nova API Key" value={integrationProviderForm.apiKey ?? ""} onChange={(event) => updateIntegrationProvider({ apiKey: event.target.value })} />
          <input placeholder="Novo Webhook Secret" value={integrationProviderForm.webhookSecret ?? ""} onChange={(event) => updateIntegrationProvider({ webhookSecret: event.target.value })} />
        </div>
        <div className="course-admin-form" style={{ marginTop: 16 }}>
          {["connect_account", "sync_profile", "search_jobs", "import_jobs", "match_jobs", "upload_resume", "submit_application", "publish_resume_link", "get_application_status", "webhooks", "external_redirect", "manual_apply"].map((capability) => (
            <label key={capability} style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
              <input type="checkbox" checked={(integrationProviderForm.capabilities ?? []).includes(capability)} onChange={(event) => updateIntegrationProvider({ capabilities: event.target.checked ? [...(integrationProviderForm.capabilities ?? []), capability] : (integrationProviderForm.capabilities ?? []).filter((item) => item !== capability) })} />
              {capability}
            </label>
          ))}
        </div>
        {integrationProviderForm.lastError && <div className="warning-box" style={{ marginTop: 16 }}>Último erro: {integrationProviderForm.lastError}</div>}
      </section>

      <section className="admin-section card">
        <p className="muted" style={{ margin: 0 }}>
          Boards Greenhouse e Lever públicos usados na busca de vagas com candidatura automática.
        </p>
        <div className="course-admin-form">
          <div className="field">
            <label>Fonte</label>
            <select value={newBoard.source} onChange={(e) => setNewBoard({ ...newBoard, source: e.target.value as "greenhouse" | "lever" })}>
              <option value="greenhouse">Greenhouse</option>
              <option value="lever">Lever</option>
            </select>
          </div>
          <div className="field">
            <label>Board key (ex: notion)</label>
            <input value={newBoard.boardKey} onChange={(e) => setNewBoard({ ...newBoard, boardKey: e.target.value })} placeholder="notion" />
          </div>
          <div className="field">
            <label>Label (ex: Notion)</label>
            <input value={newBoard.label} onChange={(e) => setNewBoard({ ...newBoard, label: e.target.value })} placeholder="Notion" />
          </div>
          <button className="button" type="button" onClick={createBoard}>Adicionar</button>
        </div>
        <div className="admin-course-list">
          {atsBoards.map((board) => (
            <div className="admin-course" key={board.id}>
              <strong>{board.label}</strong>
              <span>{board.source} · {board.boardKey} {board.active ? "" : "· inativo"}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="button secondary" type="button" onClick={() => toggleBoard(board)}>
                  {board.active ? "Desativar" : "Ativar"}
                </button>
                <button className="button ghost" type="button" onClick={() => deleteBoard(board.id)} style={{ minHeight: 40, padding: "0 12px" }}>
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section card">
        <h2>Logs básicos</h2>
        <div className="log-list">
          {overview.logs.map((log) => (
            <div key={log.id}>
              <strong>{log.level}</strong>
              <span>{new Date(log.createdAt).toLocaleString("pt-BR")}</span>
              <p>{log.message}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
