/* === pages.js — GSAP 增强 12页交互 === */

import audio from './audio.js';
import QuizGame from './quiz.js';
import { generatePoster, downloadPoster } from './poster.js';
import { LIVE_URL, TMALL_URL, OFFICIAL_SITE_URL, TOPIC_TEXT } from './config.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ============================================================
// P1 首屏 — 金色参观券入场
// ============================================================
window.init_page01 = function () {
  const btn = document.getElementById('btnEnter');
  if (!btn || btn.dataset.ready) return;
  btn.dataset.ready = '1';

  // GSAP 入场
  if (typeof gsap !== 'undefined') {
    gsap.fromTo('#goldenTicket', { y: 60, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'elastic.out(1,0.5)' });
    gsap.fromTo('.p1-hook-text', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.5, ease: 'power2.out' });
    gsap.fromTo('.p1-hook-sub', { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.8, ease: 'power2.out' });
    gsap.fromTo('#btnEnter', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: 1, ease: 'back.out(2)' });
  }

  btn.addEventListener('click', () => {
    audio.play('click');
    window.app && window.app.next();
  });
};

// ============================================================
// P2 厂长身份 — 工牌脉冲
// ============================================================
window.init_page02 = function () {
  const card = document.getElementById('badgeCard');
  if (!card || card.dataset.ready) return;
  card.dataset.ready = '1';

  if (typeof gsap !== 'undefined') {
    gsap.fromTo(card, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(2)' });
    // 脉冲光环
    gsap.to(card, { boxShadow: '0 0 30px rgba(245,184,75,0.5), 0 0 80px rgba(0,59,122,0.3)', duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }

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
// P3 工厂大门 — 开门后左滑进入P4
// ============================================================
window.init_page03 = function () {
  const gateLeft = document.getElementById('gateLeft');
  const gateRight = document.getElementById('gateRight');
  const hint = document.getElementById('gateHint');
  if (!gateLeft || gateLeft.dataset.ready) return;
  gateLeft.dataset.ready = '1';

  let opened = false;
  let autoTimer = null;

  const finishOpen = () => {
    if (opened) return;
    opened = true;
    clearTimeout(autoTimer);
    if (hint) { hint.style.opacity = '0'; hint.style.transition = 'opacity 0.3s'; }

    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf(gateLeft); gsap.killTweensOf(gateRight);
      gsap.to(gateLeft, { x: -320, opacity: 0, duration: 0.4, ease: 'power2.in' });
      gsap.to(gateRight, { x: 320, opacity: 0, duration: 0.4, ease: 'power2.in', onComplete: () => {
        audio.play('open');
        if (window.app) {
          window.app._slideNext = true;
          window.app.next();
        }
      }});
    } else {
      gateLeft.style.transform = 'translateX(-320px)';
      gateRight.style.transform = 'translateX(320px)';
      gateLeft.style.opacity = gateRight.style.opacity = '0';
      audio.play('open');
      setTimeout(() => {
        if (window.app) {
          window.app._slideNext = true;
          window.app.next();
        }
      }, 400);
    }
  };

  // 点击任意位置立刻开门
  const page03 = document.getElementById('page03');
  page03.addEventListener('click', (e) => {
    if (opened) return;
    finishOpen();
  });

  // 1.2 秒后自动开门
  autoTimer = setTimeout(finishOpen, 1200);
};

// ============================================================
// P4 原料查验 + 世界地图 GSAP
// ============================================================
window.init_page04 = function () {
  const cards = $$('#ingredientCards .ingredient-card');
  if (cards.length === 0 || cards[0].dataset.ready) return;

  if (typeof gsap !== 'undefined') {
    gsap.fromTo('#worldMap .map-trail', { width: 0, opacity: 0 }, { width: '+=0', opacity: 0.7, duration: 0.8, stagger: 0.3, ease: 'power2.out' });
    gsap.fromTo('#worldMap .map-pin', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.35, delay: 0.6, ease: 'back.out(1.7)' });
    gsap.to('#worldMap .map-pin-label', { opacity: 1, duration: 0.3, stagger: 0.35, delay: 1, ease: 'power2.out' });
  } else {
    $$('#worldMap .map-trail').forEach((t, i) => { setTimeout(() => t.classList.add('animate'), i * 250); });
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
      if (revealed >= 3 && $('#page04 .page-hint')) $('#page04 .page-hint').textContent = '原料已查 ✓ 滑动继续';
    });
  });
};

// ============================================================
// P5 卖点标签 — GSAP stagger
// ============================================================
window.init_page05 = function () {
  const tags = $$('#uspTags .usp-tag');
  const explain = document.getElementById('uspExplain');
  if (tags.length === 0 || tags[0].dataset.ready) return;

  if (typeof gsap !== 'undefined') {
    gsap.fromTo(tags, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'back.out(1.5)' });
  }

  const explanations = {
    0: '不用撕边，打开就能吃。每一片都是柔软的吐司芯。',
    1: '玻利维亚红藜麦带来的优质植物蛋白，吃得饱也吃得好。',
    2: '不额外添加蔗糖，享受面包本身的自然微甜。',
    3: '不添加人工色素，面包该有的颜色就是好颜色。',
    4: '0反式脂肪酸，对身体的承诺跟面包一样实在。',
    5: '经过近4年反复调试，才找到刚好松软又有嚼劲的口感。',
  };

  tags.forEach((tag) => {
    tag.dataset.ready = '1';
    tag.addEventListener('click', () => {
      tags.forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(tag, { scale: 1 }, { scale: 1.08, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out' });
      }
      if (explain) explain.textContent = explanations[parseInt(tag.dataset.usp)] || '';
      audio.play('click');
    });
  });
};

// ============================================================
// 滑块页通用逻辑（P6 / P7 共用）
// ============================================================
function initSliderPage({ sliderId, feedbackId, hintId, getMsg }) {
  const slider = document.getElementById(sliderId);
  const feedback = document.getElementById(feedbackId);
  const hint = hintId ? document.getElementById(hintId) : null;
  if (!slider || slider.dataset.ready) return;
  slider.dataset.ready = '1';

  slider.addEventListener('input', () => {
    const val = parseInt(slider.value);
    if (!window._userData) window._userData = {};
    window._userData[sliderId] = val;
    const { text, color, advance, hintText, bgEl, bgColor } = getMsg(val);
    setFeedback(feedback, text, color);
    if (bgEl && bgColor) {
      const bgElement = document.getElementById(bgEl);
      if (bgElement) bgElement.style.background = bgColor;
    }
    if (advance) {
      if (hint && hintText) hint.textContent = hintText;
      slider.disabled = true;
      triggerSloganBeat();
      setTimeout(() => { window.app && window.app.next(); slider.disabled = false; }, 1500);
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
// P6 和面工艺 — GSAP 反馈
// ============================================================
window.init_page06 = function () {
  initSliderPage({
    sliderId: 'doughSlider', feedbackId: 'doughFeedback', hintId: 'doughHint',
    getMsg: (val) => {
      if (val < 33) return { text: '面团太软，成品会发黏——再加点力', color: '#B07820', bgEl: 'doughState', bgColor: '#F8E8C0' };
      if (val > 66) return { text: '筋度过强，面包会发柴——松一点', color: '#C03030', bgEl: 'doughState', bgColor: '#C8A060' };
      return { text: '✓ 豪士4年找到的黄金比例，就是这里！', color: '#5C8A3C', bgEl: 'doughState', bgColor: '#E8C870', advance: true, hintText: '手感对了！进烘烤线...' };
    },
  });
};

// ============================================================
// P7 烘烤火候 — GSAP 反馈
// ============================================================
window.init_page07 = function () {
  initSliderPage({
    sliderId: 'bakeSlider', feedbackId: 'bakeFeedback', hintId: null,
    getMsg: (val) => {
      if (val < 35) return { text: '温度太低，颜色苍白，内心未熟', color: '#B07820', bgEl: 'bakeToast', bgColor: '#F8EDD0' };
      if (val > 65) return { text: '太高了，焦了——这批要重做！', color: '#C03030', bgEl: 'bakeToast', bgColor: '#5C3010' };
      return { text: '✓ 220°C，表皮微脆内心柔软，这就是豪士的温度', color: '#5C8A3C', bgEl: 'bakeToast', bgColor: '#C89030', advance: true };
    },
  });
};

// ============================================================
// P8 切片包装
// ============================================================
window.init_page08 = function () {
  const wrap = document.getElementById('conveyorWrap');
  if (!wrap || wrap.dataset.ready) return;
  wrap.dataset.ready = '1';
  let scrollDone = false;
  wrap.addEventListener('scroll', () => {
    if (scrollDone) return;
    if (wrap.scrollLeft >= wrap.scrollWidth - wrap.clientWidth - 10) {
      scrollDone = true;
      audio.play('click');
      setTimeout(() => window.app && window.app.next(), 800);
    }
  });
};

// ============================================================
// P9 质检 — GSAP 计时器脉冲
// ============================================================
window.init_page09 = function () {
  const page = document.getElementById('page09');
  if (!page || page.dataset.ready) return;
  page.dataset.ready = '1';

  const breads = Array.from($$('#quizBreads .quiz-bread'));
  const timer = document.getElementById('quizTimer');
  const result = document.getElementById('quizResult');
  const retryBtn = document.getElementById('quizRetry');
  let quiz;

  const startQuiz = () => {
    breads.forEach(b => { b.classList.remove('found', 'wrong'); b.style.pointerEvents = 'auto'; });
    if (result) { result.textContent = ''; result.style.color = ''; }
    if (retryBtn) retryBtn.style.display = 'none';
    if (timer) { timer.textContent = '10'; timer.style.color = ''; timer.style.animation = ''; }

    quiz = new QuizGame({
      breads, badIndices: [2, 4], timeLimit: 10, maxMistakes: 3,
      onPass: ({ found, timeUsed, mistakes }) => {
        let grade, gradeText, gradeTitle;
        if (mistakes === 0 && timeUsed <= 5) { grade = 'S'; gradeText = '👑 天生厂长！眼睛也太尖了'; gradeTitle = '天生厂长'; }
        else if (mistakes <= 1 && timeUsed <= 8) { grade = 'A'; gradeText = '✅ 合格，每一片都查到位了'; gradeTitle = '合格厂长'; }
        else { grade = 'B'; gradeText = '🍞 实习厂长，下次手速再快点'; gradeTitle = '实习厂长'; }
        if (result) { result.innerHTML = gradeText; gsapPop(result); }
        if (timer) timer.textContent = '✅';
        if (retryBtn) retryBtn.style.display = 'inline-block';
        window._quizScore = { found, timeUsed, mistakes, grade, gradeTitle };
        audio.play('click');
        setTimeout(() => window.app && window.app.next(), 2000);
      },
      onFail: ({ found, mistakes }) => {
        const missed = 2 - found;
        if (result) { result.textContent = `漏了${missed}片，失误${mistakes}次 😅 再试一把？`; gsapPop(result); }
        if (timer) { timer.textContent = '⏰'; timer.style.animation = ''; }
        if (retryBtn) retryBtn.style.display = 'inline-block';
        window._quizScore = { found, timeUsed: 10, mistakes, grade: 'F', gradeTitle: '学员' };
      },
      onUpdate: ({ timeLeft, mistakes }) => {
        if (timer) {
          timer.textContent = timeLeft;
          if (timeLeft <= 3) { timer.style.animation = 'pulse 0.5s infinite'; timer.style.color = '#C9212B'; }
        }
        const remaining = 3 - (mistakes || 0);
        if (result && mistakes > 0) { result.textContent = `还剩 ${remaining} 次容错机会`; result.style.color = '#F5B84B'; }
      },
    });
    quiz.start();
  };

  if (retryBtn) retryBtn.addEventListener('click', startQuiz);
  startQuiz();
};

window.leave_page09 = function () {
  const timerEl = document.getElementById('quizTimer');
  if (timerEl) timerEl.style.animation = '';
};

// GSAP 弹出效果
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
};

// ============================================================
// P11 直播
// ============================================================
window.init_page11 = function () {
  const btn = document.getElementById('btnWatchLive');
  if (!btn || btn.dataset.ready) return;
  btn.dataset.ready = '1';
  if (typeof gsap !== 'undefined') {
    gsap.fromTo(btn, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: 1.5, ease: 'back.out(2)' });
  }
  btn.addEventListener('click', () => { audio.play('click'); window.open(LIVE_URL, '_blank'); });
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
    try {
      await navigator.clipboard.writeText(TOPIC_TEXT);
      btn.textContent = '✅ 已复制！去微博/抖音/小红书发帖吧';
      btn.style.background = 'linear-gradient(135deg, #4CAF50, #388E3C)';
      if (typeof gsap !== 'undefined') gsap.fromTo(btn, { scale: 1 }, { scale: 1.05, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out' });
      setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 2500);
    } catch {
      window.prompt('复制话题标签：', TOPIC_TEXT);
    }
  });
};

// ============================================================
// Slogan 节奏感动效
// ============================================================
function triggerSloganBeat() {
  const words = ['豪士', '豪士', '好吃', '好吃'];
  words.forEach((word, i) => {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'slogan-beat';
      el.textContent = word;
      document.body.appendChild(el);
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(el, { scale: 0, opacity: 0 }, { scale: 1.3, opacity: 1, duration: 0.35, ease: 'back.out(2)', onComplete: () => {
          gsap.to(el, { scale: 1.2, opacity: 0, duration: 0.45, delay: 0.15, ease: 'power2.in', onComplete: () => el.remove() });
        }});
      } else {
        requestAnimationFrame(() => el.classList.add('pop'));
        setTimeout(() => el.remove(), 900);
      }
    }, i * 350);
  });
}
