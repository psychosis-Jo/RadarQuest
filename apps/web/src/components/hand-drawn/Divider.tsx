// 古星图册风格分割线（纯 SVG）
export function Divider({ className = '' }: { className?: string }) {
  return (
    <div className={`my-6 flex items-center justify-center gap-3 ${className}`}>
      <span className="h-px flex-1 bg-ink-700" />
      <svg width="32" height="16" viewBox="0 0 32 16" fill="none" className="text-gold/60">
        <circle cx="16" cy="8" r="2" fill="currentColor" />
        <circle cx="6" cy="8" r="1" fill="currentColor" />
        <circle cx="26" cy="8" r="1" fill="currentColor" />
        <line x1="6" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="0.5" />
        <line x1="18" y1="8" x2="26" y2="8" stroke="currentColor" strokeWidth="0.5" />
      </svg>
      <span className="h-px flex-1 bg-ink-700" />
    </div>
  );
}

export function CompassRose({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="0.5" />
      <path d="M12 2 L14 12 L12 10 L10 12 Z" fill="currentColor" opacity="0.7" />
      <path d="M12 22 L14 12 L12 14 L10 12 Z" fill="currentColor" opacity="0.4" />
      <path d="M2 12 L12 14 L10 12 L12 10 Z" fill="currentColor" opacity="0.4" />
      <path d="M22 12 L12 14 L14 12 L12 10 Z" fill="currentColor" opacity="0.4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

export function StarIcon({ size = 12, filled = false, color = '#D4A574' }: { size?: number; filled?: boolean; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill={filled ? color : 'none'} stroke={color} strokeWidth="1">
      <path d="M6 1 L7 5 L11 6 L7 7 L6 11 L5 7 L1 6 L5 5 Z" />
    </svg>
  );
}
