'use client';
import { useEffect, useRef } from 'react';

export type SoundMode = 'off' | 'action' | 'publish' | 'all';
export type IntensityLevel = 0 | 1 | 2 | 3 | 4;

/** 映射 intensity_level (1-5) → audio intensity (low/med/high) */
export function intensityToLevel(level: IntensityLevel): 'low' | 'med' | 'high' {
  if (level <= 1) return 'low';
  if (level >= 3) return 'high';
  return 'med';
}

/** sound_mode → 是否静音 */
export function soundModeToMuted(mode: SoundMode): boolean {
  return mode === 'off';
}

/**
 * 把 settings 同步给 StarCatcherAudio。
 * 在 SettingsForm 调 saveSettings() 后调用即可。
 */
export function applyAudioSettings(opts: {
  soundMode: SoundMode;
  intensityLevel: IntensityLevel;
}) {
  if (typeof window === 'undefined') return;
  // 同步给所有 client 组件（ActionBar 实时过滤用）
  (window as any).__starcatcherSoundMode = opts.soundMode;
  if (!window.StarCatcherAudio) return;
  const muted = soundModeToMuted(opts.soundMode);
  const level = intensityToLevel(opts.intensityLevel);
  window.StarCatcherAudio.setMuted(muted);
  window.StarCatcherAudio.setIntensity(level);
}

/** 触发动作音（按 soundMode 过滤） */
export function playActionSound(action: 'watch' | 'save' | 'note' | 'build' | 'publish', soundMode: SoundMode) {
  if (typeof window === 'undefined' || !window.StarCatcherAudio) return;
  if (soundModeToMuted(soundMode)) return;
  // off=全静；action/all=五个动作都发；publish=只发 publish
  if (soundMode === 'publish' && action !== 'publish') return;
  // 都用 'keep' 这个短促铃音（参考项目里 keep 是基础点亮音）
  window.StarCatcherAudio.play('keep');
}

/** 触发 Boss 点亮音（始终受 soundMode 控制；off 时不响） */
export function playConstellationSound(soundMode: SoundMode) {
  if (typeof window === 'undefined' || !window.StarCatcherAudio) return;
  if (soundModeToMuted(soundMode)) return;
  window.StarCatcherAudio.play('constellation');
}

/** 升级提示音 */
export function playLevelupSound(soundMode: SoundMode) {
  if (typeof window === 'undefined' || !window.StarCatcherAudio) return;
  if (soundModeToMuted(soundMode)) return;
  window.StarCatcherAudio.play('levelup');
}

/**
 * 客户端 hook：监听 Lv 变化，自动播 levelup 音（仅 +1 增长时）
 * 用法：在 Header 之类的组件 useRef 记录 prevLv
 */
export function useLevelUpDetector(currentLevel: number) {
  const prevRef = useRef(currentLevel);
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) { initialized.current = true; prevRef.current = currentLevel; return; }
    if (currentLevel > prevRef.current) {
      window.dispatchEvent(new CustomEvent('starcatcher:levelup', { detail: { from: prevRef.current, to: currentLevel } }));
    }
    prevRef.current = currentLevel;
  }, [currentLevel]);
}
