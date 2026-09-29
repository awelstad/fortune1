type P = { className?: string };

export function ArrowRight({ className = "size-4" }: P) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M3 10h13m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}

export function ArrowUpRight({ className = "size-4" }: P) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M6 14 14 6m0 0H7m7 0v7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}

export function PlusIcon({ className = "size-4" }: P) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function CloseIcon({ className = "size-5" }: P) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="m4 4 12 12M16 4 4 16" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function ChevronLeft({ className = "size-5" }: P) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="m12.5 4-6 6 6 6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function ChevronRight({ className = "size-5" }: P) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="m7.5 4 6 6-6 6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
