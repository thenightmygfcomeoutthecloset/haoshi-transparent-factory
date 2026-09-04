/* === main.js — 7幕沉浸式工坊漫游 调度核心 === */

import Gesture from './gesture.js';
import audio from './audio.js';
import haptic from './haptic.js';
import { ACT_LABELS } from './config.js';
import './pages.js';

// ========== 全局提示组件 ==========
export function showToast(message, duration = 2200) {
  const existing = document.querySelector('.global-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'global-toast';
  toast.textContent = message;
  toast.style.background = 'var(--navy-dark)';
  toast.style.color = '#FFD700';
  toast.style.border = '1px solid var(--brand-gold)';
  toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  haptic.tick();
  setTimeout(() => {
    toast.classList.remove('visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}
window.showToast = showToast;

class App {
  constructor() {
    this.pages = document.querySelectorAll('.page');
    this.total = this.pages.length;
    this.current = 0;
    this.isTransitioning = false;

    // 手势识别 — 滑动切换（排除交互控件）
    this.gesture = new Gesture(document.querySelector('.app'), { threshold: 75 });
    this.gesture.onSwipeLeft(() => {
      // Act 1 与 Act 2 禁止盲目跳过，需完成撕票与激活
      if (this.current <= 1) return;
      this.next();
    });
    this.gesture.onSwipeRight(() => this.prev());

    // 静音控制
    this.muteBtn = document.getElementById('muteBtn');
    if (this.muteBtn) {
      this._updateMuteUI();
      this.muteBtn.addEventListener('click', () => {
        audio.toggleMute();
        this._updateMuteUI();
        haptic.tick();
      });
    }

    // 顶部 HUD 点击圆点支持直接切换（已通过的幕）
    const dots = document.querySelectorAll('.hud-dot');
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const targetAct = parseInt(dot.dataset.act);
        if (!isNaN(targetAct) && targetAct <= this.current + 1) {
          this.goTo(targetAct);
        }
      });
    });

    // 默认初始化第 1 幕
    this._initPage(0);
    this._updateHUD();
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
    haptic.tick();

    const oldPage = this.pages[this.current];
    const newPage = this.pages[index];

    this._leavePage(this.current);
    this.current = index;
    this._updateHUD();

    if (typeof gsap !== 'undefined') {
      if (oldPage) gsap.killTweensOf(oldPage);
      if (newPage) gsap.killTweensOf(newPage);

      newPage.classList.add('active');
      this._initPage(index);

      if (oldPage) {
        gsap.to(oldPage, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => {
            oldPage.classList.remove('active');
            gsap.set(oldPage, { clearProps: 'opacity,transform' });
          }
        });
      }

      gsap.fromTo(newPage,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.35,
          ease: 'power2.out',
          onComplete: () => {
            this.isTransitioning = false;
            gsap.set(newPage, { clearProps: 'opacity,transform' });
          }
        }
      );
    } else {
      if (oldPage) oldPage.classList.remove('active');
      if (newPage) newPage.classList.add('active');
      this._initPage(index);
      this.isTransitioning = false;
    }
  }

  _initPage(index) {
    const page = this.pages[index];
    if (!page) return;
    const pageId = page.id;
    if (typeof window[`init_${pageId}`] === 'function') {
      window[`init_${pageId}`](page);
    }
  }

  _leavePage(index) {
    const page = this.pages[index];
    if (!page) return;
    const pageId = page.id;
    if (typeof window[`leave_${pageId}`] === 'function') {
      window[`leave_${pageId}`]();
    }
  }

  _updateMuteUI() {
    if (!this.muteBtn) return;
    this.muteBtn.textContent = audio.muted ? '🔇' : '🔊';
    this.muteBtn.classList.toggle('muted', audio.muted);
  }

  _updateHUD() {
    const act = ACT_LABELS[this.current];
    const logTag = document.getElementById('hudLogTag');
    if (logTag && act) {
      logTag.textContent = act.hud;
    }
    const dots = document.querySelectorAll('.hud-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === this.current);
      dot.classList.toggle('passed', idx < this.current);
    });
  }

  _resize() {
    const vp = document.querySelector('.viewport');
    if (!vp) return;
    vp.style.width = '100%';
    vp.style.height = '100%';
    vp.style.maxWidth = '480px';
    vp.style.position = 'relative';
    vp.style.left = '';
    vp.style.top = '';
    vp.style.transform = '';
  }
}

// 引导启动
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
