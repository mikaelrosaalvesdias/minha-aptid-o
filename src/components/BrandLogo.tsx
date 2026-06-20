export function BrandLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      {/* compass ring */}
      <circle cx="32" cy="32" r="28" stroke="url(#lg)" strokeWidth="4" />
      {/* N-S needle */}
      <path d="M32 8 L36 32 L32 36 L28 32 Z" fill="url(#lg)" />
      <path d="M32 56 L36 32 L32 28 L28 32 Z" fill="url(#lg)" opacity="0.4" />
      {/* cardinal ticks */}
      <rect x="30" y="2" width="4" height="6" rx="1" fill="url(#lg)" />
      <rect x="30" y="56" width="4" height="6" rx="1" fill="url(#lg)" opacity="0.5" />
      <rect x="2" y="30" width="6" height="4" rx="1" fill="url(#lg)" opacity="0.5" />
      <rect x="56" y="30" width="6" height="4" rx="1" fill="url(#lg)" opacity="0.5" />
      {/* center dot */}
      <circle cx="32" cy="32" r="3" fill="#fff" />
    </svg>
  );
}
