export type ResumeTemplateCategory = "ATS" | "Profissional" | "Visual" | "Área" | "Entrada" | "Executivo";
export type ResumeAtsRisk = "baixo" | "baixo/médio" | "médio" | "alto";
export type ResumeDensity = "compacto" | "normal" | "espaçado";
export type ResumeKind = "visual" | "ats" | "principal" | "com_foto" | "sem_foto" | "area" | "vaga";

export type ResumeExperience = {
  company: string;
  role: string;
  period: string;
  description: string;
};

export type ResumeEducation = {
  institution: string;
  course: string;
  period: string;
};

export type ResumeData = {
  id?: string;
  title: string;
  phone?: string | null;
  linkedin?: string | null;
  summary?: string | null;
  photo?: string | null;
  experiences: ResumeExperience[];
  education: ResumeEducation[];
  topProfileNames?: string[];
  strengths?: string[];
  uploadedText?: string | null;
  activeResumeType?: string;
};

export type ResumeVisualConfig = {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  backgroundColor: string;
  titleFont: string;
  bodyFont: string;
  fontSize: number;
  titleSize: number;
  sectionSpacing: number;
  lineSpacing: number;
  margins: number;
  borderStyle: "none" | "minimal" | "rounded" | "strong";
  showIcons: boolean;
  showPhoto: boolean;
  photoShape: "circle" | "square" | "rounded";
  photoPosition: "top" | "left" | "right" | "hidden";
  headerBackground: boolean;
  sectionHighlight: boolean;
  density: ResumeDensity;
};

export type ResumeSectionKey =
  | "personal"
  | "summary"
  | "objective"
  | "experience"
  | "education"
  | "courses"
  | "certifications"
  | "technicalSkills"
  | "softSkills"
  | "languages"
  | "projects"
  | "portfolio"
  | "links"
  | "tools"
  | "awards"
  | "volunteer"
  | "additional";

export type ResumeSectionConfig = {
  order: ResumeSectionKey[];
  visibility: Record<ResumeSectionKey, boolean>;
  titles: Record<string, string>;
};

export type ResumeTemplate = {
  id: string;
  name: string;
  category: ResumeTemplateCategory;
  description: string;
  preview: string;
  recommendedFor: string;
  recommendedLevel: string;
  atsCompatible: boolean;
  acceptsPhoto: boolean;
  hasBackground: boolean;
  editableColors: boolean;
  oneColumn: boolean;
  twoColumns: boolean;
  baseAtsScore: number;
  baseVisualScore: number;
  baseRhScore: number;
  atsRisk: ResumeAtsRisk;
  bestUse: string;
  tags: string[];
  badges: string[];
  defaultVisualConfig: ResumeVisualConfig;
  supportedSections: ResumeSectionKey[];
  active: boolean;
  version: string;
};

export type ResumeSuggestion = {
  id: string;
  priority: "alta" | "média" | "baixa";
  area: "ats" | "rh" | "visual" | "conteúdo" | "completude";
  title: string;
  description: string;
  actionLabel?: string;
  action?: string;
};

export type ResumeScores = {
  general: number;
  ats: number;
  rh: number;
  visual: number;
  content: number;
  completeness: number;
  areaFit: number;
  clarity: number;
  objectivity: number;
  risk: ResumeAtsRisk;
  suggestions: ResumeSuggestion[];
  warnings: string[];
};

export type ResumeVersionPayload = {
  id?: string;
  name: string;
  kind: ResumeKind;
  templateId: string;
  targetArea?: string | null;
  targetRole?: string | null;
  visualConfig: ResumeVisualConfig;
  sectionConfig: ResumeSectionConfig;
  guideAnswers?: Record<string, unknown>;
  isPrincipal?: boolean;
  useForAutoApply?: boolean;
  useForManualApply?: boolean;
  useForAreas?: string[];
};
