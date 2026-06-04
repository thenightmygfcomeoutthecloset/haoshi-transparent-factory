/* === audio.js — AudioManager 类 V3（含BGM） === */

class AudioManager {
  constructor() {
    this.sounds = {};     // { name: Audio }
    this.currentBGM = null;
    this._muted = true; // 默认静音，用户点喇叭手动开启
    this._bgmStarted = false;

    // 从 localStorage 恢复静音状态
    try {
      this._muted = localStorage.getItem('haoshi_muted') === 'true';
    } catch (e) { /* 无 localStorage 则忽略 */ }
  }

  get muted() { return this._muted; }
  set muted(val) {
    this._muted = val;
    try { localStorage.setItem('haoshi_muted', String(val)); } catch (e) {}
    if (val) { this.stopAll(); }
    else {
      this._bgmStarted = true;
      this.loop('bgm', true); // 继续播放，不重头来
    }
  }

  toggleMute() {
    this.muted = !this._muted;
    return this._muted;
  }

  /** 注册音效: audio.register('click', '/assets/audio/click.mp3') */
  register(name, src) {
    const audio = new Audio(src);
    audio.preload = 'auto';
    this.sounds[name] = audio;
  }

  /** 播放音效: audio.play('click') */
  play(name) {
    if (this._muted) return;
    const s = this.sounds[name];
    if (!s) return;
    s.load();
    s.currentTime = 0;
    const p = s.play();
    if (p) p.catch(() => {});
  }

  /** 循环播放: audio.loop('bgm', resume) */
  loop(name, resume = false) {
    if (this._muted) return;
    const s = this.sounds[name];
    if (!s) return;
    s.load();
    s.loop = true;
    s.volume = 0.3;
    if (!resume) s.currentTime = 0;
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
audio.register('bgm',   './assets/audio/bgm.mp3');
audio.register('click', './assets/audio/click.mp3');
audio.register('tear',  './assets/audio/tear.mp3');
audio.register('stamp', './assets/audio/stamp.mp3');
audio.register('ding',  './assets/audio/ding.mp3');
audio.register('alert', './assets/audio/alert.mp3');
audio.register('fanfare', './assets/audio/fanfare.mp3');
audio.register('flip',  './assets/audio/card-flip.mp3');

export default audio;
