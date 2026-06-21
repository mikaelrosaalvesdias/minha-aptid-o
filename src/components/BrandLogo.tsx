export function BrandLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff" className={className} aria-hidden="true">
      <circle cx="4.7" cy="19.3" r="2" fill="#fff" />
      <path d="M4.7 19.3C7.3 16.7 8.7 12.9 11.3 9.3" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" fill="none" />
      <path d="M16.7 2.7l1.5 3.65 3.65 1.5-3.65 1.5-1.5 3.65-1.5-3.65-3.65-1.5 3.65-1.5z" fill="#fff" />
    </svg>
  );
}
