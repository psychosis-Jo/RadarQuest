/* ============================================================
 * audio.js — Web Audio API 合成「宇宙空灵」音效（无外部音频文件）
 * 环境氛围音：低频柔和 pad，可循环（缓慢呼吸 LFO）。
 * 动作音：收集星星 / 完成任务 / 升级 / 点亮星座（各一种短促空灵音）。
 * 受全局设置控制：静音开关 + 强度（low/med/high），默认开启，可被设置关闭。
 * 强度映射音量；游戏化档位经 setTier 影响氛围是否开启（low→off）。
 * 暴露 window.StarCatcherAudio：init / play / setMuted / setIntensity / setTier / resume。
 * ============================================================ */
if (typeof window === "undefined") { /* @ts-ignore - SSR guard */ } else { window.StarCatcherAudio = (function () {
  'use strict';

  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let ambient: { nodes: OscillatorNode[]; padGain: GainNode } | null = null;
  // StarCatcher Audio (Web Audio API 实时合成音效，零音频文件依赖)
// 复制自参考项目 Nebula Poetic，仅做 namespace 调整

const state = {
    muted: false,
    intensity: 'med',            // low | med | high（音量）
    tierSound: 'low'             // off | low | high（来自 gamify 档位，控制氛围开关）
  };

  function ensureCtx() {
    if (ctx) return ctx;
    try {
      const AC = (window.AudioContext || (window as any).webkitAudioContext);
      if (!AC) return null;
      ctx = new AC();
      master! = ctx!.createGain();
      master!.gain.value = currentVolume();
      master!.connect(ctx!.destination);
    } catch (e) {
      ctx = null;
      master = null;
    }
    return ctx;
  }

  function currentVolume() {
    if (state.muted) return 0;
    return { low: 0.28, med: 0.55, high: 0.85 }[state.intensity] || 0.55;
  }

  function resume() {
    if (ctx && ctx!.state === 'suspended') ctx!.resume();
  }

  // 单个带包络的振荡音
  function tone(opts: any) {
    if (!ensureCtx() || state.muted) return;
    const _ctx = ctx!;
    resume();
    const t0 = _ctx.currentTime;
    const freq = opts.freq || 440;
    const freq2 = opts.freq2 || null;
    const dur = opts.dur || 0.5;
    const type = opts.type || 'sine';
    const peak = opts.peak || 0.5;
    const attack = opts.attack || 0.012;
    const release = opts.release != null ? opts.release : dur * 0.9;
    const vol = currentVolume();
    const target = Math.max(0.0002, peak * vol);

    const g = _ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(target, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + release);

    const filt = _ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = opts.cutoff || 2600;
    filt.Q.value = 0.6;

    const osc = _ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (freq2) osc.frequency.exponentialRampToValueAtTime(freq2, t0 + dur);
    if (opts.detune) osc.detune.value = opts.detune;

    osc.connect(filt); filt.connect(g); g.connect(master!);
    osc.start(t0);
    osc.stop(t0 + dur + release + 0.05);
  }

  // 空灵铃音：基频 + 八度泛音 + 五度泛音（带柔和衰减）
  function bell(freq: any, dur: any, peak: any) {
    tone({ freq: freq, dur: dur, peak: peak, attack: 0.01, release: dur * 0.9, type: 'sine' });
    tone({ freq: freq * 2.01, dur: dur * 0.8, peak: peak * 0.4, attack: 0.01, release: dur * 0.8, type: 'sine' });
    tone({ freq: freq * 3.0, dur: dur * 0.5, peak: peak * 0.12, attack: 0.01, release: dur * 0.5, type: 'triangle' });
  }

  // ---- 动作音 ----
  function play(type: any) {
    if (!ensureCtx() || state.muted) return;
    resume();
    switch (type) {
      case 'keep':           // 收集/点亮一颗星：柔和上行小 blip
        tone({ freq: 587.33, freq2: 880, dur: 0.18, peak: 0.5, type: 'sine', attack: 0.01, release: 0.28, cutoff: 3200 });
        break;
      case 'task':           // 完成任务：C5 → G5 两音
        bell(523.25, 0.5, 0.5);
        setTimeout(function () { bell(783.99, 0.6, 0.5); }, 110);
        break;
      case 'levelup':        // 升级：C5–E5–G5–C6 上行微光
        [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) {
          setTimeout(function () { bell(f, 0.7, 0.5); }, i * 90);
        });
        break;
      case 'constellation':  // 点亮星座：A3–E4–A4 暖色和弦缓涌
        [220, 329.63, 440].forEach(function (f, i) {
          setTimeout(function () { bell(f, 1.6, 0.45); }, i * 60);
        });
        break;
      default:
        bell(523.25, 0.4, 0.4);
    }
  }

  // ---- 环境氛围 pad ----
  function startAmbient() {
    if (!ensureCtx() || ambient) return;
    resume();
    const padGain = ctx!.createGain();
    padGain.gain.setValueAtTime(0.0001, ctx!.currentTime);
    padGain.gain.exponentialRampToValueAtTime(0.12 * (state.muted ? 0.0001 : currentVolume() + 0.0001), ctx!.currentTime + 3);

    const filt = ctx!.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 700;
    filt.Q.value = 0.4;
    filt.connect(padGain);
    padGain.connect(master!);

    // A2–E3–A3–C#4 柔和铺底（带轻微 detune 增加空气感）
    const freqs = [110, 164.81, 220, 277.18];
    const nodes = [];
    freqs.forEach(function (f, i) {
      const o = ctx!.createOscillator();
      o.type = (i % 2) ? 'sine' : 'triangle';
      o.frequency.value = f;
      o.detune.value = (i - 1.5) * 4;
      const g = ctx!.createGain();
      g.gain.value = (0.25 / freqs.length) * (state.muted ? 0.0001 : 1);
      o.connect(g); g.connect(filt);
      o.start();
      nodes.push(o);
    });

    // 缓慢呼吸 LFO
    const lfo = ctx!.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx!.createGain();
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain);
    lfoGain.connect(padGain.gain);
    lfo.start();
    nodes.push(lfo);

    ambient = { nodes: nodes, padGain: padGain };
  }

  function stopAmbient() {
    if (!ambient || !ctx) return;
    const t = ctx!.currentTime;
    const padGain = ambient.padGain;
    padGain.gain.cancelScheduledValues(t);
    padGain.gain.setValueAtTime(Math.max(0.0002, padGain.gain.value), t);
    padGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    const nodes = ambient.nodes;
    setTimeout(function () {
      nodes.forEach(function (n) { try { n.stop(); } catch (e) {} });
    }, 1400);
    ambient = null;
  }

  // 依据 静音 + 档位 决定是否启动氛围
  function applyAmbient() {
    if (!ctx) return;
    const allow = !state.muted && state.tierSound !== 'off';
    if (allow) startAmbient(); else stopAmbient();
  }

  // ---- 公共接口 ----
  function setMuted(b: any) {
    state.muted = !!b;
    if (master!) master!.gain.value = currentVolume();
    applyAmbient();
  }
  function setIntensity(level: any) {
    if (['low', 'med', 'high'].indexOf(level) >= 0) state.intensity = level;
    if (master!) master!.gain.value = currentVolume();
    applyAmbient();
  }
  function setTier(gamify: any) {
    const _tierMap: Record<string,string> = { low: 'off', med: 'low', high: 'high' }; state.tierSound = _tierMap[gamify] || 'low';
    applyAmbient();
  }
  function init() {
    ensureCtx();
    // 浏览器自动播放策略：首次用户手势后再 resume + 启动氛围
    const kick = function () {
      ensureCtx();
      resume();
      applyAmbient();
    };
    document.addEventListener('pointerdown', kick, { once: true });
    document.addEventListener('keydown', kick, { once: true });
    // 仍尝试启动（被挂起时不发声，手势后恢复）
    applyAmbient();
  }

  return {
    init: init,
    play: play,
    setMuted: setMuted,
    setIntensity: setIntensity,
    setTier: setTier,
    resume: resume
  };
})();
}

