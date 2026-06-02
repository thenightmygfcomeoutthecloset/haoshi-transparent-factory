/* === main.js V2 — 简化翻页系统 === */

import Gesture from './gesture.js';
import audio from './audio.js';
import './pages.js';

// ========== 全局工具函数 ==========
export function showToast(message, duration = 2000) {
  const existing = document.querySelector('.global-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'global-toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}
export function updateProgress(stationIndex, stationName, pct) {
  const bar = document.getElementById('progress-bar');
  const label = document.getElementById('progress-label');
  const fill = document.getElementById('progress-fill');
  if (bar) bar.style.display = 'block';
  if (label) label.textContent = stationName;
  if (fill) fill.style.width = `${pct != null ? pct : (stationIndex / 5) * 100}%`;
}
export function hideProgress() {
  const bar = document.getElementById('progress-bar');
  if (bar) bar.style.display = 'none';
}
window.showToast = showToast;
window.updateProgress = updateProgress;
window.hideProgress = hideProgress;

class App {
  constructor() {
    this.pages = document.querySelectorAll('.page');
    this.total = this.pages.length;
    this.current = 0;
    this.isTransitioning = false;
    this._slideNext = false; // 标记下一次 goTo 用左滑过渡

    // 页面指示器
    this.indicator = document.querySelector('.page-indicator');
    this._initIndicator();

    // 手势 — P1/P2 禁止滑动翻页，必须点按钮
    this.gesture = new Gesture(document.querySelector('.app'), { threshold: 50 });
    this.gesture.onSwipeLeft(() => {
      if (this.current <= 1) return; // P1/P2 禁止滑动（需点按钮）
      if (this.current === 7) return; // P8 传送带页，禁止手势翻页
      this.next();
    });
    this.gesture.onSwipeRight(() => this.prev());

    // 静音按钮
    this.muteBtn = document.querySelector('.mute-btn');
    if (this.muteBtn) {
      this._updateMuteUI();
      this.muteBtn.addEventListener('click', () => {
        audio.toggleMute();
        this._updateMuteUI();
      });
      // 首次进入提示
      if (!sessionStorage.getItem('audio_hint_shown')) {
        sessionStorage.setItem('audio_hint_shown', '1');
        setTimeout(() => showToast('🔊 点击右上角开启声音，体验更佳', 3000), 1500);
      }
    }

    // 直接初始化首屏，不走 goTo 避免 index===current 拦截
    this._initPage(0);
    this._updateIndicator();
  }

  next() {
    if (this.current >= this.total - 1 || this.isTransitioning) return;
    this.goTo(this.current + 1);
  }

  prev() {
    if (this.current <= 0 || this.isTransitioning) return;
    this.goTo(this.current - 1);
  }

  goTo(index) {
    if (index === this.current || index < 0 || index >= this.total || this.isTransitioning) return;
    this.isTransitioning = true;

    const oldPage = this.pages[this.current];
    const newPage = this.pages[index];
    const slide = this._slideNext;
    this._slideNext = false; // 只用一次

    // 离开旧页
    this._leavePage(this.current);
    newPage.classList.add('active');
    this.current = index;
    this._initPage(index);
    this._updateIndicator();

    if (typeof gsap !== 'undefined') {
      if (slide) {
        // 左滑过渡：旧页左滑退出，新页从右侧滑入
        gsap.to(oldPage, { x: '-100%', duration: 0.4, ease: 'power2.inOut', onComplete: () => {
          oldPage.classList.remove('active');
          gsap.set(oldPage, { x: 0 }); // 清理 translateX，否则返回时会残留
        }});
        gsap.fromTo(newPage, { x: '100%' }, { x: 0, duration: 0.4, ease: 'power2.inOut', onComplete: () => { this.isTransitioning = false; } });
      } else {
        gsap.to(oldPage, { opacity: 0, scale: 0.97, duration: 0.35, ease: 'power2.in', onComplete: () => oldPage.classList.remove('active') });
        gsap.fromTo(newPage, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out', onComplete: () => { this.isTransitioning = false; } });
      }
    } else {
      oldPage && oldPage.classList.remove('active');
      this.isTransitioning = false;
    }

    this._spawnParticles(newPage);
  }

  // ========== 页面生命周期 ==========
  _initPage(index) {
    const page = this.pages[index];
    const pageId = `page${String(index + 1).padStart(2, '0')}`;
    if (typeof window[`init_${pageId}`] === 'function') {
      window[`init_${pageId}`](page);
    }
  }

  _leavePage(index) {
    const pageId = `page${String(index + 1).padStart(2, '0')}`;
    if (typeof window[`leave_${pageId}`] === 'function') {
      window[`leave_${pageId}`]();
    }
  }

  // ========== 粒子效果 ==========
  _spawnParticles(page) {
    const container = page.querySelector('.particles');
    if (!container) return;

    const colors = ['rgba(244,169,64,0.4)', 'rgba(255,215,0,0.3)', 'rgba(255,248,236,0.5)'];
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = (60 + Math.random() * 40) + '%';
      p.style.width = (2 + Math.random() * 4) + 'px';
      p.style.height = p.style.width;
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.animationDuration = (5 + Math.random() * 6) + 's';
      p.style.animationDelay = Math.random() * 2 + 's';
      container.appendChild(p);

      // 动画结束后移除
      setTimeout(() => p.remove(), 8000);
    }
  }

  // ========== 指示器 ==========
  _initIndicator() {
    if (!this.indicator) return;
    this.indicator.innerHTML = '';
    for (let i = 0; i < this.total; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot';
      this.indicator.appendChild(dot);
    }
  }

  _updateIndicator() {
    if (!this.indicator) return;
    const dots = this.indicator.querySelectorAll('.dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === this.current));
  }

  // ========== 静音 UI ==========
  _updateMuteUI() {
    if (!this.muteBtn) return;
    this.muteBtn.textContent = audio.muted ? '🔇' : '🔊';
    this.muteBtn.classList.toggle('muted', audio.muted);
  }

  // ========== 缩放 ==========
  _resize() {
    const vp = document.querySelector('.viewport');
    if (!vp) return;
    const scale = Math.min(
      window.innerWidth / 640,
      window.innerHeight / 1008,
      1
    );
    const w = 640 * scale;
    const h = 1008 * scale;
    vp.style.width = '640px';
    vp.style.height = '1008px';
    vp.style.position = 'absolute';
    vp.style.left = `${(window.innerWidth - w) / 2}px`;
    vp.style.top = `${(window.innerHeight - h) / 2}px`;
    vp.style.transform = `scale(${scale})`;
    vp.style.transformOrigin = 'top left';
  }
}

// 启动
function boot() {
  window.app = new App();
  window.app._resize();
  window.addEventListener('resize', () => window.app._resize());
  const ticketEl = document.getElementById('ticketNo');
  if (ticketEl) ticketEl.textContent = 'NO. ' + String(Math.floor(Math.random() * 9000) + 1000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
