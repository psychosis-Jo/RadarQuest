'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
// 副作用 import：把 window.StarCatcherAudio 挂到全局
import '@/lib/audio/sounds';

/**
 * 首次用户手势时 init Web Audio Context。
 * 浏览器自动播放策略限制 AudioContext 必须在用户手势后才能 resume。
 */
export function AudioInit() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined' || !window.StarCatcherAudio) return;
    window.StarCatcherAudio.init();
  }, [pathname]);

  return null;
}
