import { ExternalLink } from "lucide-react";

export type CourseCardData = {
  id: string;
  title: string;
  provider: string;
  url: string;
  type: string;
  isFree: boolean;
};

export function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <a className="course-card card" href={course.url} target="_blank" rel="noreferrer">
      <div>
        <span className="course-type">{course.type}</span>
        <h3>{course.title}</h3>
        <p>{course.provider}</p>
      </div>
      <span className="course-link">
        {course.isFree ? "Gratuito" : "Ver detalhes"} <ExternalLink size={16} />
      </span>
    </a>
  );
}
