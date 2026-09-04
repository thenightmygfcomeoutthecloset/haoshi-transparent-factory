/* === audio.js — AudioManager 类 V3（含BGM） === */

class AudioManager {
  constructor() {
    this.sounds = {};     // { name: Audio }
    this.currentBGM = null;
    this._muted = true;   // 默认静音，用户点喇叭手动开启
    this._bgmStarted = false;
    this._initWeChatUnlock();
  }

  _initWeChatUnlock() {
    const unlock = () => {
      if (typeof window.WeixinJSBridge !== 'undefined') {
        window.WeixinJSBridge.invoke('getNetworkType', {}, () => {});
      }
    };
    if (typeof window.WeixinJSBridge !== 'undefined') {
      unlock();
    } else {
      document.addEventListener('WeixinJSBridgeReady', unlock, { once: true });
    }
  }

  get muted() { return this._muted; }
  set muted(val) {
    this._muted = val;
    if (val) { this.stopAll(); }
    else {
      this._bgmStarted = true;
      this.loop('bgm', true);
    }
  }

  toggleMute() {
    this.muted = !this._muted;
    return this._muted;
  }

  /** 注册音效: audio.register('click', '/assets/audio/click.mp3')。preloadBgm=false 用于大文件 */
  register(name, src, preloadBgm = false) {
    const audio = new Audio(src);
    audio.preload = preloadBgm ? 'none' : 'auto';
    this.sounds[name] = audio;
  }

  /** 播放音效: audio.play('click') */
  play(name) {
    if (this._muted) return;
    const s = this.sounds[name];
    if (!s) return;
    try {
      s.currentTime = 0;
    } catch (_) {}
    const p = s.play();
    if (p) p.catch(() => {});
  }

  /** 循环播放: audio.loop('bgm', resume) */
  loop(name, resume = false) {
    if (this._muted) return;
    const s = this.sounds[name];
    if (!s) return;
    s.loop = true;
    s.volume = 0.3;
    if (!resume) {
      try {
        s.currentTime = 0;
      } catch (_) {}
    }
    const p = s.play();
    if (p) p.catch(() => {});
    this.currentBGM = name;
  }

  /** 尝试启动BGM（需用户交互后调用） */
  tryStartBGM() {
    if (this._bgmStarted || this._muted) return;
    this._bgmStarted = true;
    this.loop('bgm');
  }

  /** 停止指定音效 */
  stop(name) {
    const s = this.sounds[name];
    if (!s) return;
    s.pause();
    s.currentTime = 0;
  }

  /** 停止所有 */
  stopAll() {
    Object.values(this.sounds).forEach(s => {
      s.pause();
      s.currentTime = 0;
    });
    // 不清除 currentBGM，以便取消静音后恢复
  }
}

// 单例
const audio = new AudioManager();

// 注册全部音效（public/ 目录下的文件构建时直接复制到输出目录）
audio.register('bgm',   './assets/audio/bgm.mp3', true); // 3.5MB大文件，不预加载
audio.register('click', './assets/audio/click.mp3');
audio.register('tear',  './assets/audio/tear.mp3');
audio.register('stamp', './assets/audio/stamp.mp3');
audio.register('ding',  './assets/audio/ding.mp3');
audio.register('alert', './assets/audio/alert.mp3');
audio.register('fanfare', './assets/audio/fanfare.mp3');
audio.register('flip',  './assets/audio/card-flip.mp3');

export default audio;
