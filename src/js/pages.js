/* === pages.js — 豪士透明工厂查岗日 12页交互 === */

import audio from './audio.js';
import QuizGame from './quiz.js';
import { generatePoster, downloadPoster } from './poster.js';
import { LIVE_URL, TMALL_URL, OFFICIAL_SITE_URL, TOPIC_TEXT } from './config.js';

// ============================================================
// P1 首屏钩子 — 点击按钮进入
// ============================================================
window.init_page01 = function () {
  const btn = document.getElementById('btnEnter');
  if (!btn || btn.dataset.ready) return;
  btn.dataset.ready = '1';

  btn.addEventListener('click', () => {
    audio.play('click');
    window.app && window.app.next();
  });
};

// ============================================================
// P2 厂长身份确认 — 点击工牌继续
// ============================================================
window.init_page02 = function () {
  const card = document.getElementById('badgeCard');
  if (!card || card.dataset.ready) return;
  card.dataset.ready = '1';

  card.addEventListener('click', () => {
    card.style.animation = 'none';
    card.style.boxShadow = '0 0 60px rgba(245,184,75,0.7), 0 0 120px rgba(0,59,122,0.4)';
    audio.play('click');
    setTimeout(() => window.app && window.app.next(), 800);
  });
};

// ============================================================
// P3 工厂大门 — 滑动开门
// ============================================================
window.init_page03 = function () {
  const gateLeft = document.getElementById('gateLeft');
  const gateRight = document.getElementById('gateRight');
  const hint = document.getElementById('gateHint');
  if (!gateLeft || gateLeft.dataset.ready) return;
  gateLeft.dataset.ready = '1';

  let startX = 0;
  let opened = false;

  const onMove = (e) => {
    if (opened) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const dx = x - startX;
    const maxOffset = 250;
    const offset = Math.max(0, Math.min(maxOffset, Math.abs(dx) * 1.5));

    gateLeft.style.transform = `translateX(-${offset}px)`;
    gateRight.style.transform = `translateX(${offset}px)`;

    if (offset > maxOffset * 0.7) {
      opened = true;
      finishOpen();
    }
  };

  const finishOpen = () => {
    gateLeft.style.transform = 'translateX(-320px)';
    gateRight.style.transform = 'translateX(320px)';
    gateLeft.style.opacity = '0';
    gateRight.style.opacity = '0';
    audio.play('open');
    if (hint) hint.style.display = 'none';
    setTimeout(() => window.app && window.app.next(), 800);
  };

  document.getElementById('page03').addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });
  document.getElementById('page03').addEventListener('touchmove', onMove);
  document.getElementById('page03').addEventListener('mousedown', (e) => {
    startX = e.clientX;
  });
  document.getElementById('page03').addEventListener('mousemove', (e) => {
    if (e.buttons === 1) onMove(e);
  });
};

// ============================================================
// P4 原料查验 — 点击卡片翻开
// ============================================================
window.init_page04 = function () {
  const cards = document.querySelectorAll('#ingredientCards .ingredient-card');
  if (cards.length === 0 || cards[0].dataset.ready) return;

  // 触发轨迹线动画 — GSAP
  if (typeof gsap !== 'undefined') {
    gsap.fromTo('#worldMap .map-trail', { width: 0, opacity: 0 }, { width: '+=0', opacity: 0.7, duration: 0.8, stagger: 0.3, ease: 'power2.out' });
    gsap.fromTo('#worldMap .map-pin', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.35, delay: 0.6, ease: 'back.out(1.7)' });
    gsap.to('#worldMap .map-pin-label', { opacity: 1, duration: 0.3, stagger: 0.35, delay: 1, ease: 'power2.out' });
  } else {
    const trails = document.querySelectorAll('#worldMap .map-trail');
    trails.forEach((t, i) => { setTimeout(() => t.classList.add('animate'), i * 250); });
    const pins = document.querySelectorAll('#worldMap .map-pin');
    pins.forEach((p, i) => { setTimeout(() => p.classList.add('show-label'), i * 350 + 500); });
  }

  let revealed = 0;
  cards.forEach((card) => {
    card.dataset.ready = '1';
    card.addEventListener('click', () => {
      if (card.classList.contains('revealed')) return;
      card.classList.add('revealed');
      audio.play('click');
      revealed++;
      // 翻完3张后可滑动继续
      if (revealed >= 3) {
        const hint = document.querySelector('#page04 .page-hint');
        if (hint) hint.textContent = '原料已查 ✓ 滑动继续';
      }
    });
  });
};

// ============================================================
// P5 卖点标签 — 点击查看解释
// ============================================================
window.init_page05 = function () {
  const tags = document.querySelectorAll('#uspTags .usp-tag');
  const explain = document.getElementById('uspExplain');
  if (tags.length === 0 || tags[0].dataset.ready) return;

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
      const idx = parseInt(tag.dataset.usp);
      tags.forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      if (explain) explain.textContent = explanations[idx] || '';
      audio.play('click');
    });
  });
};

// ============================================================
// P6 和面工艺 — 拖动滑块调筋度
// ============================================================
window.init_page06 = function () {
  const slider = document.getElementById('doughSlider');
  const feedback = document.getElementById('doughFeedback');
  const hint = document.getElementById('doughHint');
  if (!slider || slider.dataset.ready) return;
  slider.dataset.ready = '1';

  slider.addEventListener('input', () => {
    const val = parseInt(slider.value);
    if (!window._userData) window._userData = {};
    window._userData.doughSlider = val;

    if (val <= 30) {
      feedback.textContent = '太软了，厂长不批 👎';
      feedback.style.color = '#e88';
    } else if (val >= 70) {
      feedback.textContent = '硬了，重来一炉 🔄';
      feedback.style.color = '#D42026';
    } else {
      feedback.textContent = '✅ 就这个手感，松软又有嚼劲';
      feedback.style.color = '#4CAF50';
      if (hint) hint.textContent = '手感对了！进烘烤线...';
      slider.disabled = true;
      triggerSloganBeat();
      setTimeout(() => {
        window.app && window.app.next();
        slider.disabled = false;
      }, 1500);
    }
  });
};

// ============================================================
// P7 烘烤火候 — 拖动滑块调温度
// ============================================================
window.init_page07 = function () {
  const slider = document.getElementById('bakeSlider');
  const feedback = document.getElementById('bakeFeedback');
  if (!slider || slider.dataset.ready) return;
  slider.dataset.ready = '1';

  slider.addEventListener('input', () => {
    const val = parseInt(slider.value);
    if (!window._userData) window._userData = {};
    window._userData.bakeSlider = val;

    if (val <= 25) {
      feedback.textContent = '火小了，香气还没出来 🔥';
      feedback.style.color = '#8E8E93';
    } else if (val >= 75) {
      feedback.textContent = '烤过了！厂长喊停 🛑';
      feedback.style.color = '#D42026';
    } else {
      feedback.textContent = '👑 刚好，豪士豪士好吃好吃';
      feedback.style.color = '#4CAF50';
      slider.disabled = true;
      triggerSloganBeat();
      setTimeout(() => {
        window.app && window.app.next();
        slider.disabled = false;
      }, 1500);
    }
  });
};

// ============================================================
// P8 切片包装 — 横滑流水线
// ============================================================
window.init_page08 = function () {
  const wrap = document.getElementById('conveyorWrap');
  if (!wrap || wrap.dataset.ready) return;
  wrap.dataset.ready = '1';

  wrap.addEventListener('scroll', () => {
    const maxScroll = wrap.scrollWidth - wrap.clientWidth;
    if (wrap.scrollLeft >= maxScroll - 10) {
      audio.play('click');
      setTimeout(() => window.app && window.app.next(), 800);
    }
  });
};

// ============================================================
// P9 质检挑战 — 找瑕疵面包
// ============================================================
window.init_page09 = function () {
  const page = document.getElementById('page09');
  if (!page || page.dataset.ready) return;
  page.dataset.ready = '1';

  const breads = Array.from(document.querySelectorAll('#quizBreads .quiz-bread'));
  const timer = document.getElementById('quizTimer');
  const result = document.getElementById('quizResult');
  const retryBtn = document.getElementById('quizRetry');

  let quiz;

  const startQuiz = () => {
    breads.forEach(b => {
      b.classList.remove('found', 'wrong');
      b.style.pointerEvents = 'auto';
    });
    if (result) result.textContent = '';
    if (retryBtn) retryBtn.style.display = 'none';
    if (timer) { timer.textContent = '10'; timer.style.color = ''; timer.style.animation = ''; }

    quiz = new QuizGame({
      breads,
      badIndices: [2, 4],
      timeLimit: 10,
      maxMistakes: 3,
      onPass: ({ found, timeUsed, mistakes }) => {
        let grade, gradeText, gradeTitle;
        if (mistakes === 0 && timeUsed <= 5) {
          grade = 'S'; gradeText = '👑 天生厂长！眼睛也太尖了';
          gradeTitle = '天生厂长';
        } else if (mistakes <= 1 && timeUsed <= 8) {
          grade = 'A'; gradeText = '✅ 合格，每一片都查到位了';
          gradeTitle = '合格厂长';
        } else {
          grade = 'B'; gradeText = '🍞 实习厂长，下次手速再快点';
          gradeTitle = '实习厂长';
        }
        if (result) result.innerHTML = gradeText;
        if (timer) timer.textContent = '✅';
        window._quizScore = { found, timeUsed, mistakes, grade, gradeTitle };
        audio.play('click');
        setTimeout(() => window.app && window.app.next(), 2000);
      },
      onFail: ({ found, mistakes }) => {
        const missed = 2 - found;
        if (result) result.textContent = `漏了${missed}片，失误${mistakes}次 😅 再试一把？`;
        if (timer) { timer.textContent = '⏰'; timer.style.animation = ''; }
        if (retryBtn) retryBtn.style.display = 'inline-block';
        window._quizScore = { found, timeUsed: 10, mistakes, grade: 'F', gradeTitle: '学员' };
      },
      onUpdate: ({ timeLeft, mistakes }) => {
        if (timer) {
          timer.textContent = timeLeft;
          if (timeLeft <= 3) {
            timer.style.animation = 'pulse 0.5s infinite';
            timer.style.color = '#C9212B';
          }
        }
        const remaining = 3 - (mistakes || 0);
        if (result && mistakes > 0) {
          result.textContent = `还剩 ${remaining} 次容错机会`;
          result.style.color = '#F5B84B';
        }
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

// ============================================================
// P10 厂长工牌 — 显示动态成绩
// ============================================================
window.init_page10 = function () {
  const badge = document.getElementById('badgeResult');
  const gradeEl = document.getElementById('badgeGrade');
  const titleEl = document.getElementById('badgeTitleText');
  const personalEl = document.getElementById('badgePersonal');
  if (!badge || badge.dataset.ready) return;
  badge.dataset.ready = '1';

  const quiz = window._quizScore || {};
  const ud = window._userData || {};

  // 显示评级
  if (gradeEl) gradeEl.textContent = quiz.grade || 'B';
  if (titleEl) titleEl.textContent = quiz.gradeTitle || '实习厂长';

  // 个性化文案
  const bakeVal = ud.bakeSlider;
  let personalMsg;
  if (bakeVal && bakeVal >= 75) {
    personalMsg = '火候调大了，还好不是真的在开炉 😅';
  } else if (quiz.grade === 'S') {
    personalMsg = '零失误通关，豪士正式向你发放全职邀请 🎖️';
  } else if (quiz.grade === 'A') {
    personalMsg = `${quiz.timeUsed}秒找出${quiz.found}片，每一片都经得起查岗`;
  } else if (quiz.grade === 'B') {
    personalMsg = '虽然慢了一点，但诚意满分 🍞';
  } else {
    personalMsg = '豪士藜麦吐司，等你来查岗';
  }
  if (personalEl) personalEl.textContent = personalMsg;

  badge.addEventListener('click', () => {
    badge.style.animation = 'none';
    badge.style.boxShadow = '0 0 60px rgba(245,184,75,0.8), 0 0 120px rgba(0,59,122,0.5)';
    audio.play('click');
    setTimeout(() => window.app && window.app.next(), 1000);
  });
};

// ============================================================
// P11 透明工厂直播间
// ============================================================
window.init_page11 = function () {
  const btn = document.getElementById('btnWatchLive');
  if (!btn || btn.dataset.ready) return;
  btn.dataset.ready = '1';

  btn.addEventListener('click', () => {
    audio.play('click');
    window.open(LIVE_URL, '_blank');
  });
};

// ============================================================
// P12 转化页 — 购买/直播/分享
// ============================================================
window.init_page12 = function () {
  const page = document.getElementById('page12');
  if (!page || page.dataset.ready) return;
  page.dataset.ready = '1';

  document.getElementById('btnTmall')?.addEventListener('click', () => {
    window.open(TMALL_URL, '_blank');
  });
  document.getElementById('btnLive2')?.addEventListener('click', () => {
    window.open(LIVE_URL, '_blank');
  });
  document.getElementById('btnShare')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(TOPIC_TEXT);
      const btn = document.getElementById('btnShare');
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = '✅ 已复制！去微博/抖音/小红书发帖吧';
        btn.style.background = 'linear-gradient(135deg, #4CAF50, #388E3C)';
        setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 2500);
      }
    } catch (e) { /* ignore */ }
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
      requestAnimationFrame(() => el.classList.add('pop'));
      setTimeout(() => el.remove(), 900);
    }, i * 350);
  });
}
