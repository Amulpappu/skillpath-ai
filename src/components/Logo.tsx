/** SkillPath AI mark: a path rising through a teal tile. */
export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="17" fill="#0b5f58" />
      <path d="M13 47 C 25 47, 21 19, 33 25 S 43 41, 51 17" stroke="#fff" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <circle cx="13" cy="47" r="5.5" fill="#fff" />
      <circle cx="51" cy="17" r="6" fill="#2fb3a3" stroke="#fff" strokeWidth="2.5" />
    </svg>
  );
}
