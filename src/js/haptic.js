/* === haptic.js — 跨平台多模态触觉与声学联觉引擎 === */

class HapticEngine {
  constructor() {
    this.isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    this.isWeChat = /MicroMessenger/i.test(navigator.userAgent);
    this.hasVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;
    this.iosSwitchElement = null;
    this.audioCtx = null;

    if (this.isIOS) {
      this._setupIOSHapticFallback();
    }
  }

  _setupIOSHapticFallback() {
    try {
      const el = document.createElement('input');
      el.type = 'checkbox';
      el.setAttribute('switch', '');
      el.style.position = 'fixed';
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      el.style.top = '-9999px';
      document.body.appendChild(el);
      this.iosSwitchElement = el;
    } catch (_) {}
  }

  _playAudioTick() {
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.audioCtx = new AudioContext();
      }
      if (this.audioCtx && this.audioCtx.state === 'running') {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.audioCtx.currentTime + 0.03);
        gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.03);
      }
    } catch (_) {}
  }

  /** 轻微齿轮/刻度反馈 (8ms) */
  tick() {
    if (this.isWeChat && window.WeixinJSBridge) {
      try { window.WeixinJSBridge.invoke('vibrateShort'); return; } catch (_) {}
    }
    if (this.isIOS && this.iosSwitchElement) {
      try { this.iosSwitchElement.click(); } catch (_) {}
    }
    if (this.hasVibrate) {
      try { navigator.vibrate(8); return; } catch (_) {}
    }
    this._playAudioTick();
  }

  /** 关键操作敲击感 (20ms) */
  impact() {
    if (this.isWeChat && window.WeixinJSBridge) {
      try { window.WeixinJSBridge.invoke('vibrateShort'); return; } catch (_) {}
    }
    if (this.hasVibrate) {
      try { navigator.vibrate(22); return; } catch (_) {}
    }
    this.tick();
  }

  /** 成功反馈双击 (12ms - 60ms - 24ms) */
  success() {
    if (this.hasVibrate) {
      try { navigator.vibrate([12, 60, 24]); return; } catch (_) {}
    }
    this.impact();
  }

  /** 警示震颤 */
  warning() {
    if (this.hasVibrate) {
      try { navigator.vibrate([30, 60, 30, 60, 40]); return; } catch (_) {}
    }
    this.impact();
  }
}

export const haptic = new HapticEngine();
export default haptic;
