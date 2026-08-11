// 全局 Window 增强
export {};

declare global {
  interface Window {
    StarCatcherAudio?: {
      init: () => void;
      play: (type: 'keep' | 'task' | 'levelup' | 'constellation') => void;
      setMuted: (b: boolean) => void;
      setIntensity: (level: 'low' | 'med' | 'high') => void;
      setTier: (gamify: 'low' | 'med' | 'high') => void;
      resume: () => void;
    };
    starCatcherToast?: (text: string, opts?: { tone?: 'info' | 'success' | 'gold' | 'warning'; ttl?: number }) => void;
    __pendingToasts?: Array<{ text: string; tone: 'info' | 'success' | 'gold' | 'warning' }>;
    __starcatcherSoundMode?: 'off' | 'action' | 'publish' | 'all';
  }
}
