import { ExternalLink } from "lucide-react";

export type CourseCardData = {
  id: string;
  title: string;
  provider: string;
  url: string;
  type: string;
  isFree: boolean;
};

function safeUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : "";
  } catch {
    return "";
  }
}

export function CourseCard({ course }: { course: CourseCardData }) {
  const url = safeUrl(course.url);
  const hasUrl = Boolean(url);

  return (
    <a className="course-card card" href={hasUrl ? url : "/cursos"} target={hasUrl ? "_blank" : undefined} rel={hasUrl ? "noreferrer" : undefined} aria-disabled={!hasUrl} onClick={(event) => { if (!hasUrl) event.preventDefault(); }}>
      <div>
        <span className="course-type">{course.type}</span>
        <h3>{course.title}</h3>
        <p>{course.provider}</p>
      </div>
      <span className="course-link">
        {hasUrl ? (course.isFree ? "Abrir curso gratuito" : "Abrir curso") : "Link ainda não cadastrado"} <ExternalLink size={16} />
      </span>
    </a>
  );
}
