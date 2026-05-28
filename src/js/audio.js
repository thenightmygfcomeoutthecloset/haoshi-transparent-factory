/* === audio.js — AudioManager 类 === */

class AudioManager {
  constructor() {
    this.sounds = {};     // { name: Audio }
    this.currentBGM = null;
    this._muted = false;

    // 从 localStorage 恢复静音状态
    try {
      this._muted = localStorage.getItem('haoshi_muted') === 'true';
    } catch (e) { /* 无 localStorage 则忽略 */ }
  }

  get muted() { return this._muted; }
  set muted(val) {
    this._muted = val;
    try { localStorage.setItem('haoshi_muted', String(val)); } catch (e) {}
    // 静音时停掉所有正在播放的
    if (val) this.stopAll();
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
    s.currentTime = 0;
    s.play().catch(() => {}); // 忽略自动播放限制
  }

  /** 循环播放: audio.loop('bgm') */
  loop(name) {
    if (this._muted) return;
    const s = this.sounds[name];
    if (!s) return;
    s.loop = true;
    s.currentTime = 0;
    s.play().catch(() => {});
    this.currentBGM = name;
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
    this.currentBGM = null;
  }
}

// 单例
const audio = new AudioManager();
export default audio;
