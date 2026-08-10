// 装饰性星点背景（CSS only，无图片）
export function Starfield({ density = 30, className = '' }: { density?: number; className?: string }) {
  const stars = Array.from({ length: density }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5,
    delay: Math.random() * 3,
    opacity: Math.random() * 0.5 + 0.2
  }));
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {stars.map(s => (
        <span
          key={s.id}
          className="absolute rounded-full bg-bone-50"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            animation: `twinkle 3s ease-in-out ${s.delay}s infinite`
          }}
        />
      ))}
    </div>
  );
}
