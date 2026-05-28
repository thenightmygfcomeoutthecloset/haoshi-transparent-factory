/* === main.js V2 — 简化翻页系统 === */

import Gesture from './gesture.js';
import audio from './audio.js';
import './pages.js';

class App {
  constructor() {
    this.pages = document.querySelectorAll('.page');
    this.total = this.pages.length;
    this.current = 0;
    this.isTransitioning = false;

    // 页面指示器
    this.indicator = document.querySelector('.page-indicator');
    this._initIndicator();

    // 手势
    this.gesture = new Gesture(document.querySelector('.app'), { threshold: 50 });
    this.gesture.onSwipeLeft(() => this.next());
    this.gesture.onSwipeRight(() => this.prev());

    // 静音按钮
    this.muteBtn = document.querySelector('.mute-btn');
    if (this.muteBtn) {
      this._updateMuteUI();
      this.muteBtn.addEventListener('click', () => {
        audio.toggleMute();
        this._updateMuteUI();
      });
    }

    // 显示首页
    this.goTo(0, false);
  }

  next() {
    if (this.current >= this.total - 1 || this.isTransitioning) return;
    // P1 禁止滑动手势，只能通过信封点击触发
    if (this.current === 0) return;
    this.goTo(this.current + 1);
  }

  prev() {
    if (this.current <= 0 || this.isTransitioning) return;
    this.goTo(this.current - 1);
  }

  goTo(index, animate = true) {
    if (index === this.current || index < 0 || index >= this.total) return;

    const oldPage = this.pages[this.current];
    const newPage = this.pages[index];

    // 离开旧页
    this._leavePage(this.current);
    oldPage.classList.remove('active');

    // 进入新页
    newPage.classList.add('active');
    this.current = index;
    this._initPage(index);
    this._updateIndicator();

    // 触发粒子效果
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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
