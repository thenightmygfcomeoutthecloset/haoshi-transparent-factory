/* === pages.js — GSAP 增强 12页交互 === */

import audio from './audio.js';
import QuizGame from './quiz.js';
import { generatePoster, downloadPoster } from './poster.js';
import { LIVE_URL, TMALL_URL, OFFICIAL_SITE_URL, TOPIC_TEXT } from './config.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ============================================================
// P1 首屏 — 金色参观券入场 + 手势引导
// ============================================================
window.init_page01 = function () {
  const btn = document.getElementById('btnEnter');
  if (!btn || btn.dataset.ready) return;
  btn.dataset.ready = '1';

  if (typeof gsap !== 'undefined') {
    gsap.fromTo('#goldenTicket', { y: 60, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'elastic.out(1,0.5)' });
    gsap.fromTo('.p1-hook-text', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.5, ease: 'power2.out' });
    gsap.fromTo('.p1-hook-sub', { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.8, ease: 'power2.out' });
    gsap.fromTo('#btnEnter', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: 1, ease: 'back.out(2)' });
  }

  // 手势引导动画
  const hint = document.createElement('div');
  hint.className = 'swipe-hint';
  hint.innerHTML = '<span class="finger-icon">👆</span>';
  btn.parentElement.appendChild(hint);
  const removeHint = () => { hint.remove(); };
  btn.addEventListener('touchstart', removeHint, { once: true });
  btn.addEventListener('mousedown', removeHint, { once: true });

  btn.addEventListener('click', () => {
    audio.play('click');
    window.app && window.app.next();
  });
  mountGestureHint(document.getElementById('page01'), 'tap', '点击撕下参观券');
};

// ============================================================
// P2 厂长身份 — Loading → 验证成功 → 戴上工牌
// ============================================================
window.init_page02 = function () {
  const card = document.getElementById('badgeCard');
  const verifyBadge = document.getElementById('verifyBadge');
  const verifyTitle = document.getElementById('verifyTitle');
  const badgeHint = document.getElementById('badgeHint');
  if (!card || card.dataset.ready) return;
  card.dataset.ready = '1';

  setTimeout(() => {
    if (verifyBadge) verifyBadge.innerHTML = '✓ 验证成功，你已被任命为一日透明厂长';
    setTimeout(() => {
      if (verifyTitle) verifyTitle.style.display = '';
      card.style.display = '';
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(card, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(2)' });
        gsap.to(card, { boxShadow: '0 0 30px rgba(245,184,75,0.5), 0 0 80px rgba(0,59,122,0.3)', duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      }
      if (badgeHint) badgeHint.textContent = '👆 点击戴上工牌';
    }, 500);
  }, 1500);

  card.addEventListener('click', () => {
    card.style.animation = 'none';
    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf(card);
      gsap.to(card, { scale: 0.9, duration: 0.15, yoyo: true, repeat: 1, onComplete: () => {
        audio.play('click');
        window.app && window.app.next();
      }});
    } else {
      card.style.boxShadow = '0 0 60px rgba(245,184,75,0.7), 0 0 120px rgba(0,59,122,0.4)';
      audio.play('click');
      setTimeout(() => window.app && window.app.next(), 800);
    }
  });
};

// ============================================================
// P4 原料查验 + 世界地图 GSAP
// ============================================================
window.init_page05 = function () {
  const cards = $$('#ingredientCards .ingredient-card');
  if (cards.length === 0 || cards[0].dataset.ready) return;

  if (typeof gsap !== 'undefined') {
    // 动画顺序：漳州(0s) → 玻利维亚(0.5s) → 法国+新西兰(1.0s)
    const animPin = (sel, delay) => {
      gsap.fromTo(sel, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, delay, ease: 'back.out(1.7)' });
      gsap.to(sel + ' .map-pin-label', { opacity: 1, duration: 0.3, delay: delay + 0.3, ease: 'power2.out' });
    };
    animPin('[data-pin="zhangzhou"]', 0.3);
    animPin('[data-pin="bolivia"]',   0.8);
    animPin('[data-pin="france"]',    1.3);
    animPin('[data-pin="nz"]',        1.3);
    // 轨迹线跟随标记
    const trail1 = document.querySelector('.map-trail[data-trail="1"]');
    const trail0 = document.querySelector('.map-trail[data-trail="0"]');
    const trail2 = document.querySelector('.map-trail[data-trail="2"]');
    gsap.fromTo(trail1, { width: 0, opacity: 0 }, { width: trail1?.style?.width || 121, opacity: 0.7, duration: 0.6, delay: 1.1, ease: 'power2.out' });
    gsap.fromTo(trail0, { width: 0, opacity: 0 }, { width: trail0?.style?.width || 58, opacity: 0.7, duration: 0.6, delay: 1.6, ease: 'power2.out' });
    gsap.fromTo(trail2, { width: 0, opacity: 0 }, { width: trail2?.style?.width || 77, opacity: 0.7, duration: 0.6, delay: 1.6, ease: 'power2.out' });
  } else {
    $$('#worldMap .map-pin').forEach((p, i) => { setTimeout(() => p.classList.add('show-label'), i * 350 + 500); });
  }

  let revealed = 0;
  cards.forEach((card) => {
    card.dataset.ready = '1';
    card.addEventListener('click', () => {
      if (card.classList.contains('revealed')) return;
      card.classList.add('revealed');
      audio.play('click');
      revealed++;
      if (revealed >= 3 && $('#page05 .page-hint')) $('#page05 .page-hint').textContent = '✓ 查原料已完成，👈 左滑进入下一站';
    });
  });
  mountGestureHint(document.getElementById('page05'), 'tap', '点击卡片查看原料来源');
};

// ============================================================
// P4 查岗任务书 — 目录清单 + 开始核实按钮
// ============================================================
window.init_page04 = function () {
  const page = document.getElementById('page04');
  const btn = document.getElementById('btnStartCheck');
  if (!page || page.dataset.ready) return;
  page.dataset.ready = '1';

  if (btn) {
    btn.addEventListener('click', () => {
      audio.play('click');
      window.app && window.app.next();
    });
  }
  mountGestureHint(page, 'swipe-right', '左滑开始第一站');
};

// ============================================================
// 滑块页通用逻辑（P6 / P7 共用）— 含最佳区间反馈
// ============================================================
const SWEET_ZONE_MIN = 42;
const SWEET_ZONE_MAX = 58;

function initSliderPage({ sliderId, feedbackId, hintId, getMsg }) {
  const slider = document.getElementById(sliderId);
  const feedback = document.getElementById(feedbackId);
  const hint = hintId ? document.getElementById(hintId) : null;
  if (!slider || slider.dataset.ready) return;
  slider.dataset.ready = '1';

  let sweetTimer = null;
  let wasInZone = false;

  slider.addEventListener('input', () => {
    const val = parseInt(slider.value);
    if (!window._userData) window._userData = {};
    window._userData[sliderId] = val;
    const { text, color, bgEl, bgColor } = getMsg(val);
    setFeedback(feedback, text, color);
    if (bgEl && bgColor) {
      const bgElement = document.getElementById(bgEl);
      if (bgElement) bgElement.style.background = bgColor;
    }

    // 动态状态标签
    const stateLabels = {
      dough: ['太软', '偏软', '✓ 刚好', '偏硬', '太硬'],
      heat:  ['温度不足', '偏低', '✓ 最佳温度', '偏高', '过热'],
    };
    const type = sliderId === 'doughSlider' ? 'dough' : 'heat';
    const labelId = type === 'dough' ? 'dough-state-label' : 'heat-state-label';
    const labelEl = document.getElementById(labelId);
    if (labelEl) {
      const idx = Math.min(4, Math.floor(val / 20));
      labelEl.textContent = stateLabels[type][idx];
      labelEl.style.color = idx === 2 ? '#5C8A3C' : 'var(--brand-color, #E8380D)';
    }

    const inZone = val >= SWEET_ZONE_MIN && val <= SWEET_ZONE_MAX;
    if (inZone && !wasInZone) {
      wasInZone = true;
      if (navigator.vibrate) navigator.vibrate(80);
      showToast('✓ 刚刚好！', 1500);
      // 提示切换：文字从拖动→左滑
      const hintId = type === 'dough' ? 'doughHint' : 'bakeHint';
      const hintEl = document.getElementById(hintId);
      if (hintEl) hintEl.textContent = type === 'dough' ? '✓ 查工艺已完成，👈 左滑进入下一站' : '✓ 查火候已完成，👈 左滑进入下一站';
    } else if (!inZone && wasInZone) {
      wasInZone = false;
      clearTimeout(sweetTimer);
      sweetTimer = null;
    }
  });
}

function setFeedback(el, text, color) {
  el.textContent = text;
  el.style.color = color;
  if (typeof gsap !== 'undefined') {
    gsap.fromTo(el, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' });
  }
}

// ============================================================
// P6 和面工艺 — 第二站
// ============================================================
window.init_page06 = function () {
  initSliderPage({
    sliderId: 'doughSlider', feedbackId: 'doughFeedback', hintId: 'doughHint',
    getMsg: (val) => {
      if (val < 33) return { text: '面团太软，成品会发黏——再加点力', color: '#B07820', bgEl: 'doughState', bgColor: '#F8E8C0' };
      if (val > 66) return { text: '筋度过强，面包会发柴——松一点', color: '#C03030', bgEl: 'doughState', bgColor: '#C8A060' };
      return { text: '✓ 豪士4年找到的黄金比例，就是这里！', color: '#5C8A3C', bgEl: 'doughState', bgColor: '#E8C870' };
    },
  });
  mountGestureHint(document.getElementById('page06'), 'drag', '拖动滑块找到最佳筋度');
};

// ============================================================
// P7 烘烤火候 — 第三站
// ============================================================
window.init_page07 = function () {
  initSliderPage({
    sliderId: 'bakeSlider', feedbackId: 'bakeFeedback', hintId: null,
    getMsg: (val) => {
      // 渐变色：从浅奶油 → 金黄 → 焦深棕，连续过渡
      const t = val / 100;
      let r, g, b;
      if (t < 0.5) {
        // 低温→金黄：F8EDD0 → C89030
        const s = t / 0.5;
        r = Math.round(0xF8 + (0xC8 - 0xF8) * s);
        g = Math.round(0xED + (0x90 - 0xED) * s);
        b = Math.round(0xD0 + (0x30 - 0xD0) * s);
      } else {
        // 金黄→焦深棕：C89030 → 5C3010
        const s = (t - 0.5) / 0.5;
        r = Math.round(0xC8 + (0x5C - 0xC8) * s);
        g = Math.round(0x90 + (0x30 - 0x90) * s);
        b = Math.round(0x30 + (0x10 - 0x30) * s);
      }
      const bgColor = `rgb(${r},${g},${b})`;
      if (val < 35) return { text: '温度太低，颜色苍白，内心未熟', color: '#B07820', bgEl: 'bakeToast', bgColor };
      if (val > 65) return { text: '太高了，焦了——这批要重做！', color: '#C03030', bgEl: 'bakeToast', bgColor };
      return { text: '✓ 精准控温，表皮微脆内心柔软，这就是豪士的温度', color: '#5C8A3C', bgEl: 'bakeToast', bgColor };
    },
  });
  mountGestureHint(document.getElementById('page07'), 'drag', '拖动滑块调到最佳火候');
};

// ============================================================
// P8 切片包装 — 单卡轮播
// ============================================================
window.init_page08 = function () {
  const track = document.getElementById('pkgTrack');
  const dots = document.querySelectorAll('#pkgDots .pkg-dot');
  const complete = document.getElementById('pkgComplete');
  const hint = document.getElementById('pkgHint');
  const nextBtn = document.getElementById('pkgNextBtn');
  if (!track || track.dataset.ready) return;
  track.dataset.ready = '1';

  let current = 0, startX = 0, hintGone = false;

  function goTo(idx) {
    if (idx < 0 || idx > 2) return;
    current = idx;
    track.style.transform = `translateX(${-current * (100 / 3)}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    if (!hintGone && current > 0) { hint.classList.add('hidden'); hintGone = true; }
    if (current === 2) {
      hint.classList.remove('hidden');
      hint.textContent = '👈 查包装完成，左滑进入下一站';
    }
  }

  track.addEventListener('touchstart', e => { e.stopPropagation(); startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchmove', e => { e.stopPropagation(); }, { passive: true });
  track.addEventListener('touchend', e => {
    e.stopPropagation();
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
  });

  let md = false;
  track.addEventListener('mousedown', e => { e.stopPropagation(); md = true; startX = e.clientX; });
  track.addEventListener('mousemove', e => { e.stopPropagation(); });
  track.addEventListener('mouseup', e => {
    e.stopPropagation();
    if (!md) return; md = false;
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
  });

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      audio.play('click');
      window.app && window.app.next();
    });
  }
  mountGestureHint(document.getElementById('page08'), 'swipe-lr', '左右滑动查看切片流程');
};

// ============================================================
// P9 质检 — SVG 计时器 + 重试上限 + 防卡死
// ============================================================
window.init_page09 = function () {
  const page = document.getElementById('page09');
  if (!page || page.dataset.ready) return;
  page.dataset.ready = '1';

  const breads = Array.from($$('#quizBreads .quiz-bread'));
  const timerEl = document.getElementById('quizTimer');
  const result = document.getElementById('quizResult');
  const retryBtn = document.getElementById('quizRetry');
  let quiz, retryCount = 0, svgCircle;

  if (timerEl) {
    timerEl.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 80 80');
    svg.setAttribute('width', '64');
    svg.setAttribute('height', '64');
    svg.classList.add('quiz-timer-svg');
    const r = 34, cx = 40, cy = 40, circ = 2 * Math.PI * r;
    svg.innerHTML = `<circle class="quiz-timer-bg" cx="${cx}" cy="${cy}" r="${r}"/><circle class="quiz-timer-fg" id="quizCircle" cx="${cx}" cy="${cy}" r="${r}" stroke-dasharray="${circ}" stroke-dashoffset="0" transform="rotate(-90 ${cx} ${cy})"/>`;
    timerEl.appendChild(svg);
    svgCircle = svg.getElementById('quizCircle');
  }

  const startQuiz = () => {
    breads.forEach(b => { b.classList.remove('found', 'wrong'); b.style.pointerEvents = 'auto'; });
    if (result) { result.textContent = ''; result.style.color = ''; }
    if (retryBtn) retryBtn.style.display = 'none';
    if (svgCircle) { svgCircle.style.strokeDashoffset = '0'; svgCircle.classList.remove('urgent'); }

    quiz = new QuizGame({
      breads, badIndices: [2, 4], timeLimit: 10, maxMistakes: 3,
      onPass: ({ found, timeUsed, mistakes }) => {
        let grade, gradeText, gradeTitle;
        if (mistakes === 0 && timeUsed <= 5) { grade = 'S'; gradeText = '👑 天生厂长！眼睛也太尖了'; gradeTitle = '天生厂长'; }
        else if (mistakes <= 1 && timeUsed <= 8) { grade = 'A'; gradeText = '✅ 合格，每一片都查到位了'; gradeTitle = '合格厂长'; }
        else { grade = 'B'; gradeText = '🍞 实习厂长，下次手速再快点'; gradeTitle = '实习厂长'; }
        if (result) { result.innerHTML = gradeText + '<br><span style="font-size:var(--font-sm);opacity:0.6;">✓ 查质检已完成，👈 左滑进入下一站</span>'; gsapPop(result); }
        if (retryBtn) retryBtn.style.display = 'none';
        window._quizScore = { found, timeUsed, mistakes, grade, gradeTitle };
        audio.play('click');
        setTimeout(() => window.app && window.app.next(), 2000);
      },
      onFail: ({ found, mistakes }) => {
        const missed = 2 - found;
        retryCount++;
        if (retryCount >= 3) {
          if (result) { result.innerHTML = '🍞 即使有漏网之鱼，质检团队也会补上这一关'; gsapPop(result); }
          window._quizScore = { found, timeUsed: 10, mistakes, grade: 'B', gradeTitle: '实习厂长' };
          setTimeout(() => window.app && window.app.next(), 2000);
        } else {
          if (result) { result.textContent = `正确答案是第3和第5片！再试一次 (${retryCount}/3)`; gsapPop(result); }
          if (retryBtn) {
            retryBtn.style.display = 'inline-block';
            retryBtn.textContent = retryCount >= 2 ? '最后一次挑战' : '👆 再挑战一次';
          }
        }
      },
      onUpdate: ({ timeLeft, mistakes }) => {
        if (svgCircle) {
          const r = 34, circ = 2 * Math.PI * r;
          svgCircle.style.strokeDashoffset = circ * (1 - timeLeft / 10);
          if (timeLeft <= 3) svgCircle.classList.add('urgent');
        }
        const remaining = 3 - (mistakes || 0);
        if (result && mistakes > 0) { result.textContent = `还剩 ${remaining} 次容错机会`; result.style.color = '#F5B84B'; }
      },
    });
    quiz.start();
  };

  if (retryBtn) retryBtn.addEventListener('click', startQuiz);
  startQuiz();
  mountGestureHint(document.getElementById('page09'), 'tap', '点击选出瑕疵面包');
};

window.leave_page09 = function () {};

function gsapPop(el) {
  if (typeof gsap !== 'undefined') {
    gsap.fromTo(el, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' });
  }
}

// ============================================================
// P10 厂长工牌
// ============================================================
window.init_page10 = function () {
  const badge = document.getElementById('badgeResult');
  const gradeEl = document.getElementById('badgeGrade');
  const rankEl = document.getElementById('badgeRank');
  const titleEl = document.getElementById('badgeTitleText');
  const personalEl = document.getElementById('badgePersonal');
  if (!badge || badge.dataset.ready) return;
  badge.dataset.ready = '1';

  if (typeof gsap !== 'undefined') {
    gsap.fromTo(badge, { scale: 0.5, opacity: 0, rotation: -10 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.8, ease: 'elastic.out(1,0.5)' });
  }

  const quiz = window._quizScore || {};
  const ud = window._userData || {};
  if (gradeEl) gradeEl.textContent = quiz.grade || 'B';
  if (titleEl) titleEl.textContent = quiz.gradeTitle || '实习厂长';

  const quizErrors = quiz.mistakes || 0;
  let rankGrade, rankColor;
  if (quizErrors === 0) { rankGrade = 'S'; rankColor = '#FFD700'; }
  else if (quizErrors === 1) { rankGrade = 'A'; rankColor = '#C0C0C0'; }
  else { rankGrade = 'B'; rankColor = '#CD7F32'; }
  if (rankEl) { rankEl.textContent = rankGrade; rankEl.style.color = rankColor; }

  const bakeVal = ud.bakeSlider;
  let personalMsg;
  if (bakeVal >= 75) personalMsg = '火候调大了，还好不是真的在开炉 😅';
  else if (quiz.grade === 'S') personalMsg = '零失误通关，豪士正式向你发放全职邀请 🎖️';
  else if (quiz.grade === 'A') personalMsg = `${quiz.timeUsed}秒找出${quiz.found}片，每一片都经得起查岗`;
  else if (quiz.grade === 'B') personalMsg = '虽然慢了一点，但诚意满分 🍞';
  else personalMsg = '豪士藜麦吐司，等你来查岗';
  if (personalEl) personalEl.textContent = personalMsg;

  badge.addEventListener('click', () => {
    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf(badge);
      gsap.to(badge, { scale: 0.85, duration: 0.1, yoyo: true, repeat: 1, onComplete: () => {
        audio.play('click');
        setTimeout(() => window.app && window.app.next(), 800);
      }});
    } else {
      badge.style.animation = 'none';
      badge.style.boxShadow = '0 0 60px rgba(245,184,75,0.8), 0 0 120px rgba(0,59,122,0.5)';
      audio.play('click');
      setTimeout(() => window.app && window.app.next(), 1000);
    }
  });
  mountGestureHint(document.getElementById('page10'), 'tap', '点击工牌查看认证');
};

// ============================================================
// P11 工厂探秘视频
// ============================================================
window.init_page11 = function () {
  const btn = document.getElementById('btnWatchLive');
  const card = document.getElementById('videoCard');
  if (!btn || btn.dataset.ready) return;
  btn.dataset.ready = '1';
  if (typeof gsap !== 'undefined') {
    gsap.fromTo(btn, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: 1.5, ease: 'back.out(2)' });
  }
  const openVideo = () => { audio.play('click'); window.open(LIVE_URL, '_blank'); };
  btn.addEventListener('click', openVideo);
  if (card) card.addEventListener('click', openVideo);
};

// ============================================================
// P12 转化页 — GSAP 级联
// ============================================================
window.init_page12 = function () {
  const page = document.getElementById('page12');
  if (!page || page.dataset.ready) return;
  page.dataset.ready = '1';

  if (typeof gsap !== 'undefined') {
    gsap.fromTo('.coupon-card', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' });
    gsap.fromTo('.action-btn', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.15, delay: 0.3, ease: 'power2.out' });
  }

  document.getElementById('btnTmall')?.addEventListener('click', () => { window.open(TMALL_URL, '_blank'); });
  document.getElementById('btnLive2')?.addEventListener('click', () => { window.open(LIVE_URL, '_blank'); });
  document.getElementById('btnShare')?.addEventListener('click', async () => {
    const btn = document.getElementById('btnShare');
    if (!btn) return;
    const orig = btn.textContent;
    const fullContent = '#豪士透明工厂查岗日# 我今天当了一天透明厂长，原来面包是这样做出来的 → ' + window.location.href;
    try {
      await navigator.clipboard.writeText(fullContent);
      btn.textContent = '✅ 已复制！去微博/抖音/小红书发帖吧';
      btn.style.background = 'linear-gradient(135deg, #4CAF50, #388E3C)';
      showToast('✓ 已复制到剪贴板，快去分享吧！', 2000);
      if (typeof gsap !== 'undefined') gsap.fromTo(btn, { scale: 1 }, { scale: 1.05, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out' });
      setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 2500);
    } catch {
      window.prompt('复制话题标签：', fullContent);
    }
  });
};
