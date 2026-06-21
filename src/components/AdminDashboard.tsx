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

export function AdminDashboard() {
  const router = useRouter();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [message, setMessage] = useState("");
  const [selectedProfileSlug, setSelectedProfileSlug] = useState("");
  const [newCourse, setNewCourse] = useState(emptyCourse);
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
    setNewCourse((current) => ({ ...current, profileSlug: data.profiles?.[0]?.slug || "" }));
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
        <h2>Fontes de Vagas (ATS)</h2>
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
