"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Download, FileText, FileUp, GitCompare, Layers, Loader2, Palette, Plus, Save, Sparkles, Star, Trash2, Upload } from "lucide-react";
import jsPDF from "jspdf";
import { defaultSectionConfig, defaultVisualConfig, getResumeTemplate, resumeSections, resumeTemplates } from "@/lib/resume/templates";
import { resumeToPlainText } from "@/lib/resume/export";
import { scoreResume } from "@/lib/resume/scoring";
import type { ResumeData, ResumeEducation, ResumeExperience, ResumeScores, ResumeSectionConfig, ResumeSectionKey, ResumeTemplate, ResumeVersionPayload, ResumeVisualConfig } from "@/lib/resume/types";

type SavedResume = {
  id: string;
  title: string;
  phone: string | null;
  linkedin: string | null;
  summary: string | null;
  photo: string | null;
  experiences: ResumeExperience[];
  education: ResumeEducation[];
  uploadedFileName: string | null;
  uploadedFileSize: number | null;
  activeResumeType: string;
};

type SavedVersion = ResumeVersionPayload & {
  id: string;
  resumeId?: string | null;
  scores?: ResumeScores;
  suggestions?: unknown[];
  exportHistory?: unknown[];
  createdAt?: string;
  updatedAt?: string;
};

const safeFonts = ["Arial", "Helvetica", "Times", "Courier", "Georgia", "Verdana"];

const priorityColors = {
  alta: "#fca5a5",
  média: "#fcd34d",
  baixa: "#93c5fd"
};

function emptyExperience(): ResumeExperience {
  return { company: "", role: "", period: "", description: "" };
}

function emptyEducation(): ResumeEducation {
  return { institution: "", course: "", period: "" };
}

function mergeSectionConfig(config?: Partial<ResumeSectionConfig> | null): ResumeSectionConfig {
  return {
    order: Array.isArray(config?.order) && config.order.length > 0 ? config.order : defaultSectionConfig.order,
    visibility: { ...defaultSectionConfig.visibility, ...(config?.visibility ?? {}) },
    titles: { ...defaultSectionConfig.titles, ...(config?.titles ?? {}) }
  };
}

function mergeVisualConfig(config?: Partial<ResumeVisualConfig> | null): ResumeVisualConfig {
  return { ...defaultVisualConfig, ...(config ?? {}) };
}

function labelForSection(section: ResumeSectionKey, sectionConfig: ResumeSectionConfig) {
  return sectionConfig.titles[section] ?? defaultSectionConfig.titles[section] ?? section;
}

function toRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const fallback: [number, number, number] = [79, 70, 229];
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return fallback;
  return [parseInt(normalized.slice(0, 2), 16), parseInt(normalized.slice(2, 4), 16), parseInt(normalized.slice(4, 6), 16)];
}

export function ResumeBuilderClient({
  userName,
  userEmail,
  strengths,
  profiles
}: {
  userName: string;
  userEmail: string;
  strengths: string[];
  profiles: string[];
}) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [title, setTitle] = useState(profiles[0] || "Profissional");
  const [summary, setSummary] = useState("");
  const [experiences, setExperiences] = useState<ResumeExperience[]>([emptyExperience()]);
  const [education, setEducation] = useState<ResumeEducation[]>([emptyEducation()]);
  const [activeResumeType, setActiveResumeType] = useState("builder");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<number | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState("ats-limpo");
  const [visualConfig, setVisualConfig] = useState<ResumeVisualConfig>(resumeTemplates[0].defaultVisualConfig);
  const [sectionConfig, setSectionConfig] = useState<ResumeSectionConfig>(defaultSectionConfig);
  const [versions, setVersions] = useState<SavedVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>(["ats-limpo", "profissional-classico", "comercial-vendas"]);
  const [targetRole, setTargetRole] = useState("");
  const [targetArea, setTargetArea] = useState(profiles[0] ?? "");
  const [useForAutoApply, setUseForAutoApply] = useState(true);
  const [useForManualApply, setUseForManualApply] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [activePanel, setActivePanel] = useState<"dados" | "templates" | "visual" | "secoes" | "versoes" | "pontuacao" | "exportar">("dados");

  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedTemplate = useMemo(() => getResumeTemplate(selectedTemplateId), [selectedTemplateId]);
  const resumeData: ResumeData = useMemo(() => ({
    title,
    phone: phone || null,
    linkedin: linkedin || null,
    summary: summary || null,
    photo,
    experiences,
    education,
    topProfileNames: profiles,
    strengths,
    activeResumeType
  }), [title, phone, linkedin, summary, photo, experiences, education, profiles, strengths, activeResumeType]);

  const scores = useMemo(() => scoreResume({
    resume: resumeData,
    templateId: selectedTemplateId,
    visualConfig,
    sectionConfig,
    targetArea,
    targetRole,
    useForAutoApply
  }), [resumeData, selectedTemplateId, visualConfig, sectionConfig, targetArea, targetRole, useForAutoApply]);

  const recommendedTemplates = useMemo(() => {
    return resumeTemplates
      .map((template) => {
        let points = template.baseAtsScore + template.baseRhScore;
        const area = `${targetArea} ${targetRole} ${profiles.join(" ")}`.toLowerCase();
        if (useForAutoApply && template.atsCompatible) points += 40;
        if (useForAutoApply && !template.atsCompatible) points -= 35;
        if (/marketing|social|design|criativ|comunica/.test(area) && template.id === "marketing-criativo") points += 35;
        if (/venda|comercial|sdr|atendimento/.test(area) && template.id === "comercial-vendas") points += 35;
        if (/tecnologia|desenvol|dados|suporte|qa/.test(area) && template.id === "tecnologia") points += 35;
        if (!experiences.some((exp) => exp.role || exp.company) && ["primeiro-emprego", "estagio", "jovem-aprendiz", "destaque-habilidades"].includes(template.id)) points += 35;
        return { template, points };
      })
      .sort((a, b) => b.points - a.points)
      .slice(0, 3);
  }, [targetArea, targetRole, profiles, useForAutoApply, experiences]);

  useEffect(() => {
    Promise.all([
      fetch("/api/resume").then((r) => r.json()),
      fetch("/api/resume/versions").then((r) => r.json()).catch(() => ({ versions: [] }))
    ])
      .then(([resumeResponse, versionsResponse]) => {
        const saved = resumeResponse.resume as SavedResume | null;
        if (saved) {
          if (saved.title) setTitle(saved.title);
          if (saved.phone) setPhone(saved.phone);
          if (saved.linkedin) setLinkedin(saved.linkedin);
          if (saved.summary) setSummary(saved.summary);
          if (saved.photo) setPhoto(saved.photo);
          if (Array.isArray(saved.experiences) && saved.experiences.length > 0) setExperiences(saved.experiences);
          if (Array.isArray(saved.education) && saved.education.length > 0) setEducation(saved.education);
          if (saved.uploadedFileName) {
            setUploadedFileName(saved.uploadedFileName);
            setUploadedFileSize(saved.uploadedFileSize ?? null);
          }
          setActiveResumeType(saved.activeResumeType ?? "builder");
        }
        const loadedVersions = Array.isArray(versionsResponse.versions) ? versionsResponse.versions as SavedVersion[] : [];
        setVersions(loadedVersions);
        const principal = loadedVersions.find((version) => version.isPrincipal) ?? loadedVersions[0];
        if (principal) applyVersion(principal);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  function showMessage(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(""), 3500);
  }

  function applyTemplate(template: ResumeTemplate) {
    setSelectedTemplateId(template.id);
    setVisualConfig(template.defaultVisualConfig);
    if (!template.acceptsPhoto) setVisualConfig((current) => ({ ...current, showPhoto: false, photoPosition: "hidden" }));
  }

  function applyVersion(version: SavedVersion) {
    setSelectedVersionId(version.id);
    setSelectedTemplateId(version.templateId);
    setVisualConfig(mergeVisualConfig(version.visualConfig));
    setSectionConfig(mergeSectionConfig(version.sectionConfig));
    setTargetArea(version.targetArea ?? profiles[0] ?? "");
    setTargetRole(version.targetRole ?? "");
    setUseForAutoApply(Boolean(version.useForAutoApply));
    setUseForManualApply(Boolean(version.useForManualApply));
  }

  function updateSectionVisibility(section: ResumeSectionKey, visible: boolean) {
    setSectionConfig((current) => ({ ...current, visibility: { ...current.visibility, [section]: visible } }));
  }

  function moveSection(section: ResumeSectionKey, direction: -1 | 1) {
    setSectionConfig((current) => {
      const order = [...current.order];
      const index = order.indexOf(section);
      const next = index + direction;
      if (index < 0 || next < 0 || next >= order.length) return current;
      [order[index], order[next]] = [order[next], order[index]];
      return { ...current, order };
    });
  }

  function renameSection(section: ResumeSectionKey, value: string) {
    setSectionConfig((current) => ({ ...current, titles: { ...current.titles, [section]: value } }));
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setPhoto(event.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function generateAISummary() {
    setLoadingAi(true);
    try {
      const res = await fetch("/api/ai/resume-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strengths, profiles })
      });
      const data = await res.json();
      if (data.summary) setSummary(data.summary);
      else showMessage(data.error || "Não foi possível gerar o resumo.");
    } catch {
      showMessage("Erro ao comunicar com a IA.");
    } finally {
      setLoadingAi(false);
    }
  }

  async function saveBaseResume() {
    const res = await fetch("/api/resume", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        phone: phone || null,
        linkedin: linkedin || null,
        summary: summary || null,
        photo,
        experiences,
        education,
        topProfileNames: profiles,
        strengths,
        activeResumeType
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao salvar currículo.");
    return data.resume as SavedResume;
  }

  async function saveVersion(makePrincipal = false) {
    setSaving(true);
    try {
      await saveBaseResume();
      const payload = {
        name: selectedVersionId ? versions.find((version) => version.id === selectedVersionId)?.name ?? selectedTemplate.name : `${selectedTemplate.name} - ${new Date().toLocaleDateString("pt-BR")}`,
        kind: selectedTemplate.atsCompatible && useForAutoApply ? "ats" : "visual",
        templateId: selectedTemplate.id,
        targetArea: targetArea || null,
        targetRole: targetRole || null,
        visualConfig,
        sectionConfig,
        guideAnswers: { targetArea, targetRole, useForAutoApply, useForManualApply },
        isPrincipal: makePrincipal || versions.length === 0,
        useForAutoApply,
        useForManualApply,
        useForAreas: targetArea ? [targetArea] : []
      };
      const endpoint = selectedVersionId ? `/api/resume/versions/${selectedVersionId}` : "/api/resume/versions";
      const res = await fetch(endpoint, {
        method: selectedVersionId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar versão.");
      const version = data.version as SavedVersion;
      setSelectedVersionId(version.id);
      setVersions((current) => {
        const without = current.filter((item) => item.id !== version.id).map((item) => version.isPrincipal ? { ...item, isPrincipal: false } : item);
        return [version, ...without].sort((a, b) => Number(Boolean(b.isPrincipal)) - Number(Boolean(a.isPrincipal)));
      });
      showMessage(makePrincipal ? "Currículo salvo e definido como principal." : "Currículo e versão salvos.");
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function duplicateVersion() {
    if (!selectedVersionId) {
      await saveVersion(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/resume/versions/${selectedVersionId}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao duplicar.");
      const version = data.version as SavedVersion;
      setVersions((current) => [version, ...current]);
      applyVersion(version);
      showMessage("Variação duplicada sem alterar a original.");
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Erro ao duplicar.");
    } finally {
      setSaving(false);
    }
  }

  async function setPrincipal() {
    if (!selectedVersionId) {
      await saveVersion(true);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/resume/versions/${selectedVersionId}/principal`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao definir principal.");
      const version = data.version as SavedVersion;
      setVersions((current) => current.map((item) => ({ ...item, isPrincipal: item.id === version.id })));
      showMessage("Versão definida como principal.");
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Erro ao definir principal.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteVersion(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/resume/versions/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erro ao excluir.");
      setVersions((current) => current.filter((version) => version.id !== id));
      if (selectedVersionId === id) setSelectedVersionId(null);
      showMessage("Versão excluída.");
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Erro ao excluir.");
    } finally {
      setSaving(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/resume/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro no upload.");
      setUploadedFileName(data.fileName);
      setUploadedFileSize(data.fileSize ?? null);
      setActiveResumeType("uploaded");
      showMessage("Currículo enviado salvo.");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Erro no upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function removeUploaded() {
    try {
      await fetch("/api/resume/upload", { method: "DELETE" });
      setUploadedFileName(null);
      setUploadedFileSize(null);
      setActiveResumeType("builder");
      showMessage("Currículo enviado removido.");
    } catch {
      setUploadError("Erro ao remover arquivo.");
    }
  }

  function drawPdf(mode: "visual" | "ats") {
    setGeneratingPdf(true);
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = mode === "ats" ? 18 : visualConfig.margins;
      const usable = pageWidth - margin * 2;
      const primary = toRgb(mode === "ats" ? "#111827" : visualConfig.primaryColor);
      const secondary = toRgb(mode === "ats" ? "#374151" : visualConfig.secondaryColor);
      let y = margin;

      function check(needed: number) {
        if (y + needed > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      }
      function textBlock(text: string, size = visualConfig.fontSize, bold = false, color: [number, number, number] = [55, 65, 81]) {
        if (!text.trim()) return;
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(size);
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(text, usable);
        check(lines.length * (size * 0.42) + 4);
        doc.text(lines, margin, y);
        y += lines.length * (size * 0.42) + 4;
      }
      function section(titleText: string) {
        check(12);
        y += 2;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...primary);
        doc.text(titleText.toUpperCase(), margin, y);
        y += 3;
        if (mode === "visual") {
          doc.setDrawColor(...secondary);
          doc.line(margin, y, pageWidth - margin, y);
        }
        y += 6;
      }

      if (mode === "visual" && visualConfig.headerBackground) {
        doc.setFillColor(...primary);
        doc.rect(0, 0, pageWidth, 34, "F");
        doc.setTextColor(255, 255, 255);
      } else {
        doc.setTextColor(17, 24, 39);
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(mode === "ats" ? 20 : visualConfig.titleSize);
      doc.text(userName, margin, y + 8);
      y += 16;
      textBlock(title, mode === "ats" ? 11 : 12, false, mode === "visual" && visualConfig.headerBackground ? [255, 255, 255] : primary);
      const contact = [userEmail, phone, linkedin].filter(Boolean).join(" | ");
      textBlock(contact, 9, false, mode === "visual" && visualConfig.headerBackground ? [255, 255, 255] : [75, 85, 99]);
      y = Math.max(y, mode === "visual" && visualConfig.headerBackground ? 42 : y + 2);

      for (const sectionKey of sectionConfig.order) {
        if (!sectionConfig.visibility[sectionKey] || sectionKey === "personal") continue;
        if (sectionKey === "summary" && summary) {
          section(labelForSection("summary", sectionConfig));
          textBlock(summary);
        }
        if (sectionKey === "experience" && experiences.some((exp) => exp.role || exp.company)) {
          section(labelForSection("experience", sectionConfig));
          for (const exp of experiences.filter((item) => item.role || item.company || item.description)) {
            textBlock([exp.role, exp.company, exp.period].filter(Boolean).join(" — "), 10, true, [17, 24, 39]);
            textBlock(exp.description, 9);
          }
        }
        if (sectionKey === "education" && education.some((edu) => edu.course || edu.institution)) {
          section(labelForSection("education", sectionConfig));
          for (const edu of education.filter((item) => item.course || item.institution)) {
            textBlock([edu.course, edu.institution, edu.period].filter(Boolean).join(" — "), 10, true, [17, 24, 39]);
          }
        }
        if (sectionKey === "softSkills" && strengths.length > 0) {
          section(labelForSection("softSkills", sectionConfig));
          textBlock(strengths.join(", "));
        }
        if (sectionKey === "technicalSkills" && profiles.length > 0) {
          section(labelForSection("technicalSkills", sectionConfig));
          textBlock(profiles.join(", "));
        }
      }
      doc.save(`curriculo-${mode}-${userName.replace(/\s+/g, "-").toLowerCase()}.pdf`);
      showMessage(mode === "ats" ? "PDF ATS limpo exportado." : "PDF visual exportado.");
    } catch {
      showMessage("Erro ao gerar PDF.");
    } finally {
      setGeneratingPdf(false);
    }
  }

  function exportText() {
    const text = resumeToPlainText({ userName, userEmail, resume: resumeData, sectionConfig, ats: true });
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `curriculo-ats-${userName.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyStructured() {
    const text = resumeToPlainText({ userName, userEmail, resume: resumeData, sectionConfig, ats: true });
    navigator.clipboard.writeText(text).then(() => showMessage("Versão estruturada copiada."));
  }

  const panelButton = (id: typeof activePanel, label: string, icon: ReactNode) => (
    <button className={activePanel === id ? "button" : "button secondary"} style={{ minHeight: 40, padding: "0 12px", fontSize: "0.86rem" }} onClick={() => setActivePanel(id)}>
      {icon} {label}
    </button>
  );

  return (
    <main className="page-shell" style={{ display: "grid", gap: 20, gridTemplateColumns: "minmax(280px, 390px) minmax(0, 1fr) minmax(280px, 340px)", alignItems: "start" }}>
      <aside className="card" style={{ padding: 20, position: "sticky", top: 90, maxHeight: "calc(100vh - 110px)", overflow: "auto" }}>
        <Link href="/perfil" className="button ghost" style={{ marginBottom: 12, marginLeft: -10 }}>
          <ArrowLeft size={18} /> Voltar ao Perfil
        </Link>
        <p className="eyebrow">Editor de Currículo</p>
        <h2 style={{ margin: "0 0 8px" }}>Currículo profissional</h2>
        <p className="muted" style={{ marginTop: 0, lineHeight: 1.5 }}>Templates, versões, pontuação ATS/RH/visual e exportação limpa sem perder o currículo atual.</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "16px 0" }}>
          {panelButton("dados", "Dados", <FileText size={14} />)}
          {panelButton("templates", "Templates", <Layers size={14} />)}
          {panelButton("visual", "Visual", <Palette size={14} />)}
          {panelButton("secoes", "Seções", <GitCompare size={14} />)}
          {panelButton("versoes", "Versões", <Copy size={14} />)}
          {panelButton("exportar", "Exportar", <Download size={14} />)}
        </div>

        {activePanel === "dados" && (
          <div style={{ display: "grid", gap: 14 }}>
            <div className="warning-box" style={{ fontSize: "0.85rem" }}>A IA pode sugerir texto, mas não inventa empresa, curso, formação ou resultado numérico. Use apenas dados verdadeiros.</div>
            <div className="field"><label>Cargo desejado</label><input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Ex: Analista de Marketing" /></div>
            <div className="field"><label>Área alvo</label><input value={targetArea} onChange={(e) => setTargetArea(e.target.value)} placeholder="Ex: Comercial, Tecnologia" /></div>
            <div className="field"><label>Título profissional</label><input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="field"><label>Telefone</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" /></div>
            <div className="field"><label>LinkedIn</label><input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/in/seunome" /></div>
            <div className="field"><label>Foto opcional</label><input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ padding: 8 }} /></div>
            {photo && <button className="button ghost" onClick={() => setPhoto(null)} style={{ justifyContent: "flex-start" }}><Trash2 size={16} /> Remover foto</button>}
            <div className="field">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                <label>Resumo profissional</label>
                <button className="button ghost" style={{ minHeight: 32, padding: "0 8px", fontSize: "0.8rem" }} onClick={generateAISummary} disabled={loadingAi}>{loadingAi ? <Loader2 className="spin" size={14} /> : <Sparkles size={14} />} Sugerir</button>
              </div>
              <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={5} placeholder="Resumo real, claro e objetivo." />
            </div>
            <div className="field">
              <label>Experiências profissionais</label>
              {experiences.map((exp, idx) => (
                <div key={idx} style={{ padding: 12, background: "rgba(255,255,255,0.05)", borderRadius: 10, display: "grid", gap: 8 }}>
                  <input placeholder="Cargo" value={exp.role} onChange={(e) => setExperiences((items) => items.map((item, i) => i === idx ? { ...item, role: e.target.value } : item))} />
                  <input placeholder="Empresa" value={exp.company} onChange={(e) => setExperiences((items) => items.map((item, i) => i === idx ? { ...item, company: e.target.value } : item))} />
                  <input placeholder="Período" value={exp.period} onChange={(e) => setExperiences((items) => items.map((item, i) => i === idx ? { ...item, period: e.target.value } : item))} />
                  <textarea placeholder="Atividades e resultados reais" rows={2} value={exp.description} onChange={(e) => setExperiences((items) => items.map((item, i) => i === idx ? { ...item, description: e.target.value } : item))} />
                  {experiences.length > 1 && <button className="button ghost" onClick={() => setExperiences((items) => items.filter((_, i) => i !== idx))}><Trash2 size={14} /> Remover</button>}
                </div>
              ))}
              <button className="button secondary" onClick={() => setExperiences((items) => [...items, emptyExperience()])}><Plus size={16} /> Adicionar experiência</button>
            </div>
            <div className="field">
              <label>Formação acadêmica</label>
              {education.map((edu, idx) => (
                <div key={idx} style={{ padding: 12, background: "rgba(255,255,255,0.05)", borderRadius: 10, display: "grid", gap: 8 }}>
                  <input placeholder="Curso / Formação" value={edu.course} onChange={(e) => setEducation((items) => items.map((item, i) => i === idx ? { ...item, course: e.target.value } : item))} />
                  <input placeholder="Instituição" value={edu.institution} onChange={(e) => setEducation((items) => items.map((item, i) => i === idx ? { ...item, institution: e.target.value } : item))} />
                  <input placeholder="Período" value={edu.period} onChange={(e) => setEducation((items) => items.map((item, i) => i === idx ? { ...item, period: e.target.value } : item))} />
                  {education.length > 1 && <button className="button ghost" onClick={() => setEducation((items) => items.filter((_, i) => i !== idx))}><Trash2 size={14} /> Remover</button>}
                </div>
              ))}
              <button className="button secondary" onClick={() => setEducation((items) => [...items, emptyEducation()])}><Plus size={16} /> Adicionar formação</button>
            </div>
            <div className="field" style={{ padding: 14, background: "rgba(255,255,255,0.05)", borderRadius: 10 }}>
              <label><FileUp size={16} /> Usar currículo externo</label>
              <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>PDF/DOC/TXT até 2MB. Continua disponível para candidatura se você escolher.</p>
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} disabled={uploading} style={{ padding: 8 }} />
              {uploading && <p className="muted"><Loader2 className="spin" size={14} /> Enviando...</p>}
              {uploadError && <p className="form-error">{uploadError}</p>}
              {uploadedFileName && <div style={{ display: "grid", gap: 8 }}><span className="pill"><FileText size={14} /> {uploadedFileName} ({uploadedFileSize ? Math.round(uploadedFileSize / 1024) : 0}KB)</span><label className="consent-check"><input type="checkbox" checked={activeResumeType === "uploaded"} onChange={(e) => setActiveResumeType(e.target.checked ? "uploaded" : "builder")} /> <span>Usar arquivo enviado nas candidaturas</span></label><button className="button ghost" onClick={removeUploaded}><Trash2 size={14} /> Remover arquivo</button></div>}
            </div>
          </div>
        )}

        {activePanel === "templates" && (
          <div style={{ display: "grid", gap: 12 }}>
            <div className="warning-box" style={{ fontSize: "0.85rem" }}>Para candidatura em massa, o recomendado é usar um template ATS limpo. Templates visuais são melhores para envio manual.</div>
            <h3 style={{ margin: 0 }}>Recomendados para você</h3>
            {recommendedTemplates.map(({ template }) => <TemplateCard key={template.id} template={template} selected={selectedTemplateId === template.id} onSelect={() => applyTemplate(template)} compareIds={compareIds} setCompareIds={setCompareIds} />)}
            <h3 style={{ margin: "12px 0 0" }}>Galeria de templates</h3>
            {resumeTemplates.map((template) => <TemplateCard key={template.id} template={template} selected={selectedTemplateId === template.id} onSelect={() => applyTemplate(template)} compareIds={compareIds} setCompareIds={setCompareIds} />)}
          </div>
        )}

        {activePanel === "visual" && (
          <div style={{ display: "grid", gap: 14 }}>
            <div className="field"><label>Cor principal</label><input type="color" value={visualConfig.primaryColor} onChange={(e) => setVisualConfig((current) => ({ ...current, primaryColor: e.target.value }))} /></div>
            <div className="field"><label>Cor secundária</label><input type="color" value={visualConfig.secondaryColor} onChange={(e) => setVisualConfig((current) => ({ ...current, secondaryColor: e.target.value }))} /></div>
            <div className="field"><label>Cor do texto</label><input type="color" value={visualConfig.textColor} onChange={(e) => setVisualConfig((current) => ({ ...current, textColor: e.target.value }))} /></div>
            <div className="field"><label>Cor de fundo</label><input type="color" value={visualConfig.backgroundColor} onChange={(e) => setVisualConfig((current) => ({ ...current, backgroundColor: e.target.value }))} /></div>
            <div className="field"><label>Fonte do título</label><select value={visualConfig.titleFont} onChange={(e) => setVisualConfig((current) => ({ ...current, titleFont: e.target.value }))}>{safeFonts.map((font) => <option key={font}>{font}</option>)}</select></div>
            <div className="field"><label>Fonte do corpo</label><select value={visualConfig.bodyFont} onChange={(e) => setVisualConfig((current) => ({ ...current, bodyFont: e.target.value }))}>{safeFonts.map((font) => <option key={font}>{font}</option>)}</select></div>
            <div className="field"><label>Tamanho da fonte: {visualConfig.fontSize}px</label><input type="range" min="8" max="13" value={visualConfig.fontSize} onChange={(e) => setVisualConfig((current) => ({ ...current, fontSize: Number(e.target.value) }))} /></div>
            <div className="field"><label>Tamanho dos títulos: {visualConfig.titleSize}px</label><input type="range" min="18" max="34" value={visualConfig.titleSize} onChange={(e) => setVisualConfig((current) => ({ ...current, titleSize: Number(e.target.value) }))} /></div>
            <div className="field"><label>Espaçamento entre seções: {visualConfig.sectionSpacing}px</label><input type="range" min="8" max="30" value={visualConfig.sectionSpacing} onChange={(e) => setVisualConfig((current) => ({ ...current, sectionSpacing: Number(e.target.value) }))} /></div>
            <div className="field"><label>Margens: {visualConfig.margins}mm</label><input type="range" min="10" max="24" value={visualConfig.margins} onChange={(e) => setVisualConfig((current) => ({ ...current, margins: Number(e.target.value) }))} /></div>
            <div className="field"><label>Densidade</label><select value={visualConfig.density} onChange={(e) => setVisualConfig((current) => ({ ...current, density: e.target.value as ResumeVisualConfig["density"] }))}><option value="compacto">Compacto</option><option value="normal">Normal</option><option value="espaçado">Espaçado</option></select></div>
            <label className="consent-check"><input type="checkbox" checked={visualConfig.showPhoto} disabled={!selectedTemplate.acceptsPhoto} onChange={(e) => setVisualConfig((current) => ({ ...current, showPhoto: e.target.checked, photoPosition: e.target.checked ? "left" : "hidden" }))} /> <span>Mostrar foto neste template</span></label>
            <div className="field"><label>Formato da foto</label><select value={visualConfig.photoShape} onChange={(e) => setVisualConfig((current) => ({ ...current, photoShape: e.target.value as ResumeVisualConfig["photoShape"] }))}><option value="circle">Arredondada</option><option value="square">Quadrada</option><option value="rounded">Cantos suaves</option></select></div>
            <label className="consent-check"><input type="checkbox" checked={visualConfig.headerBackground} onChange={(e) => setVisualConfig((current) => ({ ...current, headerBackground: e.target.checked }))} /> <span>Fundo no cabeçalho</span></label>
            <label className="consent-check"><input type="checkbox" checked={visualConfig.sectionHighlight} onChange={(e) => setVisualConfig((current) => ({ ...current, sectionHighlight: e.target.checked }))} /> <span>Destaque nos títulos</span></label>
            <label className="consent-check"><input type="checkbox" checked={visualConfig.showIcons} onChange={(e) => setVisualConfig((current) => ({ ...current, showIcons: e.target.checked }))} /> <span>Usar ícones com texto</span></label>
          </div>
        )}

        {activePanel === "secoes" && <div style={{ display: "grid", gap: 10 }}>{sectionConfig.order.map((section, index) => <div key={section} style={{ padding: 10, border: "1px solid var(--border-color)", borderRadius: 10, display: "grid", gap: 8 }}><label className="consent-check"><input type="checkbox" checked={sectionConfig.visibility[section]} onChange={(e) => updateSectionVisibility(section, e.target.checked)} /> <span>{labelForSection(section, sectionConfig)}</span></label><input value={labelForSection(section, sectionConfig)} onChange={(e) => renameSection(section, e.target.value)} /><div style={{ display: "flex", gap: 8 }}><button className="button ghost" disabled={index === 0} onClick={() => moveSection(section, -1)}>Subir</button><button className="button ghost" disabled={index === sectionConfig.order.length - 1} onClick={() => moveSection(section, 1)}>Descer</button></div></div>)}</div>}

        {activePanel === "versoes" && (
          <div style={{ display: "grid", gap: 12 }}>
            <button className="button" onClick={() => saveVersion(false)} disabled={saving || !loaded}>{saving ? <Loader2 className="spin" size={16} /> : <Save size={16} />} Salvar nova versão</button>
            <button className="button secondary" onClick={duplicateVersion} disabled={saving}><Copy size={16} /> Duplicar variação</button>
            <button className="button secondary" onClick={setPrincipal} disabled={saving}><Star size={16} /> Definir como principal</button>
            {versions.map((version) => <div key={version.id} className="card" style={{ padding: 12, borderColor: selectedVersionId === version.id ? "var(--accent-primary)" : undefined }}><button className="button ghost" style={{ width: "100%", justifyContent: "space-between", padding: 0 }} onClick={() => applyVersion(version)}><span>{version.name}</span>{version.isPrincipal && <span className="pill">Principal</span>}</button><p className="muted" style={{ margin: "6px 0", fontSize: "0.82rem" }}>{version.templateId} · {version.kind}</p><button className="button ghost" style={{ minHeight: 32, padding: "0 8px" }} onClick={() => deleteVersion(version.id)}><Trash2 size={14} /> Excluir</button></div>)}
          </div>
        )}

        {activePanel === "exportar" && (
          <div style={{ display: "grid", gap: 12 }}>
            <label className="consent-check"><input type="checkbox" checked={useForAutoApply} onChange={(e) => setUseForAutoApply(e.target.checked)} /> <span>Usar para candidatura automática</span></label>
            <label className="consent-check"><input type="checkbox" checked={useForManualApply} onChange={(e) => setUseForManualApply(e.target.checked)} /> <span>Usar para candidatura manual</span></label>
            <div className="warning-box">Versão ATS: menos bonita, mais segura para plataformas automáticas. Versão visual: melhor para WhatsApp, e-mail e RH humano.</div>
            <button className="button" onClick={() => drawPdf("visual")} disabled={generatingPdf}>{generatingPdf ? <Loader2 className="spin" size={16} /> : <Download size={16} />} Exportar PDF visual</button>
            <button className="button secondary" onClick={() => drawPdf("ats")} disabled={generatingPdf}><Download size={16} /> Exportar PDF ATS limpo</button>
            <button className="button secondary" onClick={exportText}><FileText size={16} /> Exportar texto simples</button>
            <button className="button ghost" onClick={copyStructured}><Copy size={16} /> Copiar versão estruturada</button>
          </div>
        )}

        {message && <p style={{ color: message.includes("Erro") || message.includes("erro") ? "#fca5a5" : "#6ee7b7", fontWeight: 700 }}>{message}</p>}
        <button className="button" style={{ width: "100%", marginTop: 16 }} onClick={() => saveVersion(false)} disabled={saving || !loaded}>{saving ? <Loader2 className="spin" size={18} /> : <Save size={18} />} Salvar currículo</button>
      </aside>

      <section style={{ display: "grid", gap: 16, minWidth: 0 }}>
        <div className="card" style={{ padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div><p className="eyebrow" style={{ margin: 0 }}>Pré-visualização</p><h2 style={{ margin: "4px 0 0" }}>{selectedTemplate.name}</h2></div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><span className="pill">ATS {scores.ats}</span><span className="pill">RH {scores.rh}</span><span className="pill">Visual {scores.visual}</span></div>
        </div>
        <ResumePreview previewRef={previewRef} userName={userName} userEmail={userEmail} resume={resumeData} template={selectedTemplate} visualConfig={visualConfig} sectionConfig={sectionConfig} />
        <div className="card" style={{ padding: 18 }}>
          <h3 style={{ marginTop: 0 }}>Comparar templates</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            {compareIds.slice(0, 3).map((id) => {
              const template = getResumeTemplate(id);
              return <div key={id} style={{ padding: 12, border: "1px solid var(--border-color)", borderRadius: 12 }}><strong>{template.name}</strong><p className="muted" style={{ fontSize: "0.85rem" }}>ATS {template.baseAtsScore} · RH {template.baseRhScore} · Visual {template.baseVisualScore}</p><p className="muted" style={{ fontSize: "0.82rem" }}>Risco: {template.atsRisk}</p><p style={{ fontSize: "0.82rem" }}>{template.bestUse}</p></div>;
            })}
          </div>
        </div>
      </section>

      <aside className="card" style={{ padding: 20, position: "sticky", top: 90, maxHeight: "calc(100vh - 110px)", overflow: "auto" }}>
        <p className="eyebrow">Pontuação</p>
        <div style={{ display: "grid", placeItems: "center", width: 150, height: 150, borderRadius: "50%", margin: "0 auto 16px", background: `conic-gradient(var(--accent-tertiary) ${scores.general * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}><div style={{ width: 118, height: 118, borderRadius: "50%", background: "var(--bg-main)", display: "grid", placeItems: "center" }}><strong style={{ fontSize: 32 }}>{scores.general}</strong><span className="muted">/100</span></div></div>
        <ScoreRow label="ATS" value={scores.ats} />
        <ScoreRow label="RH" value={scores.rh} />
        <ScoreRow label="Visual" value={scores.visual} />
        <ScoreRow label="Conteúdo" value={scores.content} />
        <ScoreRow label="Completude" value={scores.completeness} />
        <ScoreRow label="Aderência" value={scores.areaFit} />
        <ScoreRow label="Clareza" value={scores.clarity} />
        <ScoreRow label="Objetividade" value={scores.objectivity} />
        <p className="pill" style={{ marginTop: 12 }}>Risco ATS: {scores.risk}</p>
        <h3>Sugestões</h3>
        <div style={{ display: "grid", gap: 10 }}>
          {scores.suggestions.length === 0 && <p className="muted">Nenhuma sugestão crítica encontrada.</p>}
          {scores.suggestions.map((suggestion) => <div key={suggestion.id} style={{ padding: 12, border: "1px solid var(--border-color)", borderRadius: 12 }}><span style={{ color: priorityColors[suggestion.priority], fontWeight: 800, fontSize: "0.8rem", textTransform: "uppercase" }}>{suggestion.priority}</span><h4 style={{ margin: "6px 0" }}>{suggestion.title}</h4><p className="muted" style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.45 }}>{suggestion.description}</p>{suggestion.actionLabel && <button className="button ghost" style={{ marginTop: 8, padding: 0 }} onClick={() => setActivePanel(suggestion.action === "templates" ? "templates" : suggestion.action === "visual" || suggestion.action === "photo" ? "visual" : "dados")}>{suggestion.actionLabel}</button>}</div>)}
        </div>
      </aside>
    </main>
  );
}

function TemplateCard({ template, selected, onSelect, compareIds, setCompareIds }: { template: ResumeTemplate; selected: boolean; onSelect: () => void; compareIds: string[]; setCompareIds: (ids: string[]) => void }) {
  const compared = compareIds.includes(template.id);
  return <div className="card" style={{ padding: 14, borderColor: selected ? "var(--accent-primary)" : undefined }}><button className="button ghost" style={{ width: "100%", padding: 0, justifyContent: "space-between" }} onClick={onSelect}><strong>{template.name}</strong>{selected && <Check size={16} />}</button><p className="muted" style={{ fontSize: "0.84rem", lineHeight: 1.45 }}>{template.description}</p><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><span className="pill">ATS {template.baseAtsScore}</span><span className="pill">RH {template.baseRhScore}</span><span className="pill">Visual {template.baseVisualScore}</span></div><p className="muted" style={{ fontSize: "0.82rem" }}>Risco: {template.atsRisk}</p><p style={{ fontSize: "0.82rem" }}>{template.bestUse}</p><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{template.badges.map((badge) => <span key={badge} className="pill" style={{ fontSize: "0.72rem", padding: "4px 8px" }}>{badge}</span>)}</div><button className="button ghost" style={{ marginTop: 8, padding: 0, minHeight: 32 }} onClick={() => setCompareIds(compared ? compareIds.filter((id) => id !== template.id) : [...compareIds, template.id].slice(-3))}><GitCompare size={14} /> {compared ? "Remover da comparação" : "Comparar"}</button></div>;
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return <div style={{ marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem" }}><span>{label}</span><strong>{value}</strong></div><div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 999, overflow: "hidden" }}><div style={{ width: `${value}%`, height: "100%", background: value >= 80 ? "#10b981" : value >= 65 ? "#f59e0b" : "#ef4444" }} /></div></div>;
}

function ResumePreview({ previewRef, userName, userEmail, resume, template, visualConfig, sectionConfig }: { previewRef: RefObject<HTMLDivElement | null>; userName: string; userEmail: string; resume: ResumeData; template: ResumeTemplate; visualConfig: ResumeVisualConfig; sectionConfig: ResumeSectionConfig }) {
  const sectionStyle = { marginBottom: visualConfig.sectionSpacing };
  const titleStyle = { color: visualConfig.primaryColor, borderBottom: visualConfig.sectionHighlight ? `1px solid ${visualConfig.secondaryColor}` : "none", paddingBottom: 5, marginBottom: 8, textTransform: "uppercase" as const, fontSize: visualConfig.fontSize + 2, letterSpacing: "0.04em" };
  const visiblePhoto = visualConfig.showPhoto && template.acceptsPhoto && resume.photo;
  const content = (section: ResumeSectionKey) => {
    if (!sectionConfig.visibility[section] || section === "personal") return null;
    if (section === "summary" && resume.summary) return <div style={sectionStyle}><h3 style={titleStyle}>{labelForSection(section, sectionConfig)}</h3><p>{resume.summary}</p></div>;
    if (section === "experience" && resume.experiences.some((exp) => exp.role || exp.company)) return <div style={sectionStyle}><h3 style={titleStyle}>{labelForSection(section, sectionConfig)}</h3>{resume.experiences.filter((exp) => exp.role || exp.company || exp.description).map((exp, index) => <div key={index} style={{ marginBottom: 10 }}><strong>{exp.role}</strong><span style={{ float: "right", color: "#6b7280" }}>{exp.period}</span><div style={{ color: visualConfig.primaryColor }}>{exp.company}</div><p>{exp.description}</p></div>)}</div>;
    if (section === "education" && resume.education.some((edu) => edu.course || edu.institution)) return <div style={sectionStyle}><h3 style={titleStyle}>{labelForSection(section, sectionConfig)}</h3>{resume.education.filter((edu) => edu.course || edu.institution).map((edu, index) => <div key={index} style={{ marginBottom: 8 }}><strong>{edu.course}</strong><span style={{ float: "right", color: "#6b7280" }}>{edu.period}</span><div>{edu.institution}</div></div>)}</div>;
    if (section === "softSkills" && (resume.strengths ?? []).length > 0) return <div style={sectionStyle}><h3 style={titleStyle}>{labelForSection(section, sectionConfig)}</h3><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{resume.strengths?.map((skill) => <span key={skill} style={{ background: `${visualConfig.primaryColor}18`, color: visualConfig.primaryColor, padding: "4px 8px", borderRadius: 6, fontSize: visualConfig.fontSize - 1 }}>{skill}</span>)}</div></div>;
    if (section === "technicalSkills" && (resume.topProfileNames ?? []).length > 0) return <div style={sectionStyle}><h3 style={titleStyle}>{labelForSection(section, sectionConfig)}</h3><p>{resume.topProfileNames?.join(", ")}</p></div>;
    if (["courses", "certifications", "languages", "projects", "portfolio", "links", "tools", "awards", "volunteer", "additional", "objective"].includes(section)) return <div style={{ ...sectionStyle, opacity: 0.75 }}><h3 style={titleStyle}>{labelForSection(section, sectionConfig)}</h3><p style={{ color: "#6b7280" }}>Sem informações preenchidas ainda. Adicione apenas dados reais quando tiver.</p></div>;
    return null;
  };

  return <section style={{ background: "#e5e7eb", padding: 28, borderRadius: 16, overflowX: "auto" }}><div ref={previewRef} style={{ width: "210mm", minHeight: "297mm", margin: "0 auto", background: visualConfig.backgroundColor, color: visualConfig.textColor, padding: `${visualConfig.margins}mm`, boxShadow: "0 16px 40px rgba(0,0,0,0.2)", fontFamily: `${visualConfig.bodyFont}, Arial, sans-serif`, fontSize: visualConfig.fontSize, lineHeight: visualConfig.lineSpacing }}><header style={{ display: "flex", gap: 18, alignItems: "center", padding: visualConfig.headerBackground ? 18 : 0, margin: visualConfig.headerBackground ? `-${visualConfig.margins}mm -${visualConfig.margins}mm ${visualConfig.sectionSpacing}px` : `0 0 ${visualConfig.sectionSpacing}px`, background: visualConfig.headerBackground ? visualConfig.primaryColor : "transparent", color: visualConfig.headerBackground ? "#ffffff" : visualConfig.textColor }}>
    {visiblePhoto && <img src={resume.photo ?? ""} alt={userName} style={{ width: 92, height: 92, borderRadius: visualConfig.photoShape === "circle" ? "50%" : visualConfig.photoShape === "rounded" ? 14 : 0, objectFit: "cover" }} />}
    <div><h1 style={{ margin: 0, fontFamily: `${visualConfig.titleFont}, Arial, sans-serif`, fontSize: visualConfig.titleSize, color: visualConfig.headerBackground ? "#ffffff" : visualConfig.textColor }}>{userName}</h1><h2 style={{ margin: "6px 0", color: visualConfig.headerBackground ? "#ffffff" : visualConfig.primaryColor, fontSize: visualConfig.fontSize + 4 }}>{resume.title}</h2><p style={{ margin: 0 }}>{[userEmail, resume.phone, resume.linkedin].filter(Boolean).join(" | ")}</p></div>
  </header><div style={{ display: template.twoColumns ? "grid" : "block", gridTemplateColumns: "1.7fr 0.9fr", gap: 28 }}>{template.twoColumns ? <><div>{sectionConfig.order.filter((section) => !["softSkills", "technicalSkills"].includes(section)).map((section) => <div key={section}>{content(section)}</div>)}</div><aside>{sectionConfig.order.filter((section) => ["softSkills", "technicalSkills"].includes(section)).map((section) => <div key={section}>{content(section)}</div>)}</aside></> : sectionConfig.order.map((section) => <div key={section}>{content(section)}</div>)}</div></div></section>;
}
