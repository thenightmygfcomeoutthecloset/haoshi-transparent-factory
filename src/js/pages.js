/* === pages.js — 各页面交互逻辑 === */

import audio from './audio.js';
import QuizGame from './quiz.js';
import { generatePoster, downloadPoster } from './poster.js';

// ============================================================
// P1 品牌邀请函 — 点击信封拆开
// ============================================================
window.init_page01 = function () {
  const scene = document.getElementById('envelopeScene');
  const page = document.getElementById('page01');
  if (!scene || scene.dataset.ready) return;
  scene.dataset.ready = '1';

  scene.addEventListener('click', () => {
    if (scene.classList.contains('opened')) return;
    scene.classList.add('opened');
    audio.play('open');

    // 1.5s 后光芒散尽，翻页
    setTimeout(() => {
      page && page.classList.add('fade-out');
      setTimeout(() => {
        window.app && window.app.next();
        page && page.classList.remove('fade-out');
      }, 800);
    }, 1200);
  });
};

// ============================================================
// P2 工厂大门 — 手指导航滑开大门
// ============================================================
window.init_page02 = function () {
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

    // 计算偏移比例
    const maxOffset = 250; // px
    const offset = Math.max(0, Math.min(maxOffset, Math.abs(dx) * 1.5));

    gateLeft.style.transform = `translateX(-${offset}px)`;
    gateRight.style.transform = `translateX(${offset}px)`;

    // 门开到 80% 以上自动完成
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

    setTimeout(() => {
      window.app && window.app.next();
    }, 800);
  };

  // Touch
  document.getElementById('page02').addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });
  document.getElementById('page02').addEventListener('touchmove', onMove);

  // Mouse
  document.getElementById('page02').addEventListener('mousedown', (e) => {
    startX = e.clientX;
  });
  document.getElementById('page02').addEventListener('mousemove', (e) => {
    if (e.buttons === 1) onMove(e); // left button held
  });
};

// ============================================================
// P3 全球原料地图 — 点击像素地图上的光点
// ============================================================
window.init_page03 = function () {
  const dots = document.querySelectorAll('#pixelMap .pixel-dot');
  const cards = document.querySelectorAll('#mapContainer .map-card');
  const btnNext = document.getElementById('mapBtnNext');
  let clickedCount = 0;

  if (dots.length === 0 || dots[0].dataset.ready) return;

  dots.forEach((dot, i) => {
    dot.dataset.ready = '1';
    dot.addEventListener('click', () => {
      // 关闭其他卡片
      cards.forEach(c => c.classList.remove('show'));
      // 显示当前卡片
      const card = document.querySelector(`[data-card="${dot.dataset.dot}"]`);
      if (card) {
        card.classList.add('show');
        audio.play('click');
      }
      // 标记已点击
      dot.classList.add('clicked');
      // 记录已点击
      if (!dot.dataset.clicked) {
        dot.dataset.clicked = '1';
        clickedCount++;
      }
      // 四个点完出现下一站按钮
      if (clickedCount >= 4 && btnNext) {
        btnNext.classList.add('show');
      }
    });
  });

  // 下一站按钮
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      audio.play('click');
      window.app && window.app.next();
    });
  }
};

// ============================================================
// P4 原料档案室 — 上滑推进
// ============================================================
window.init_page04 = function () {
  const page = document.getElementById('page04');
  if (!page || page.dataset.ready) return;
  page.dataset.ready = '1';

  let startY = 0;

  page.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
  });

  page.addEventListener('touchend', (e) => {
    const dy = startY - e.changedTouches[0].clientY;
    if (dy > 50) {
      // 上滑超过阈值 → 翻页
      window.app && window.app.next();
    }
  });
};

// ============================================================
// P5 和面车间 — 拖拽滑块调筋度
// ============================================================
window.init_page05 = function () {
  const slider = document.getElementById('doughSlider');
  const state = document.getElementById('doughState');
  const feedback = document.getElementById('doughFeedback');
  const hint = document.getElementById('doughHint');
  if (!slider || slider.dataset.ready) return;
  slider.dataset.ready = '1';

  slider.addEventListener('input', () => {
    const val = parseInt(slider.value);

    if (val <= 35) {
      // 太软
      state.style.background = '#f0d8c0';
      state.style.width = '240px';
      state.style.height = '80px';
      state.style.borderRadius = '30%';
      feedback.textContent = '筋度太低，面团塌陷了...😟';
      feedback.style.color = '#e88';
    } else if (val >= 66) {
      // 太硬
      state.style.background = '#d4a860';
      state.style.width = '160px';
      state.style.height = '130px';
      state.style.borderRadius = '20%';
      feedback.textContent = '筋度太高，面包会发硬！😰';
      feedback.style.color = '#D42026';
    } else {
      // 刚刚好！
      state.style.background = '#F4D3A0';
      state.style.width = '200px';
      state.style.height = '120px';
      state.style.borderRadius = '50%';
      state.style.boxShadow = '0 0 30px rgba(244,169,64,0.5)';
      feedback.textContent = '✨ 黄金筋度！就是这个感觉！';
      feedback.style.color = '#4CAF50';

      // 1.5s 后自动翻页
      if (hint) hint.textContent = '完美！面团正在进入发酵室...';
      slider.disabled = true;
      setTimeout(() => {
        window.app && window.app.next();
        slider.disabled = false;
      }, 1500);
    }
  });
};

// ============================================================
// P6 发酵室 — 点击加速发酵
// ============================================================
window.init_page06 = function () {
  const page = document.getElementById('page06');
  const balls = document.querySelectorAll('#doughBalls .dough-ball');
  const timer = document.getElementById('fermentTimer');
  if (!page || page.dataset.ready) return;
  page.dataset.ready = '1';

  let fermented = false;

  page.addEventListener('click', () => {
    if (fermented) return;

    // 加速：缩小动画周期
    balls.forEach(b => b.classList.add('fast'));
    if (timer) timer.textContent = '⏩ 加速发酵中...';

    // 2s 后完成
    setTimeout(() => {
      fermented = true;
      balls.forEach(b => {
        b.classList.remove('fast');
        b.style.transform = 'scale(1.5)';
        b.style.background = '#E8C06A';
      });
      if (timer) timer.textContent = '✅ 发酵完成！';
      audio.play('click');

      setTimeout(() => window.app && window.app.next(), 1000);
    }, 2000);
  });
};

// ============================================================
// P7 烘烤线 — 拖拽滑块调温度
// ============================================================
window.init_page07 = function () {
  const slider = document.getElementById('bakeSlider');
  const toast = document.getElementById('bakeToast');
  const feedback = document.getElementById('bakeFeedback');
  if (!slider || slider.dataset.ready) return;
  slider.dataset.ready = '1';

  slider.addEventListener('input', () => {
    const val = parseInt(slider.value);

    if (val <= 30) {
      toast.style.background = '#f8e8d0';
      feedback.textContent = '温度太低，面包还是生的...🥶';
      feedback.style.color = '#8E8E93';
    } else if (val >= 70) {
      toast.style.background = '#5a3020';
      feedback.textContent = '🔥 烤焦啦！厂长扣工资！';
      feedback.style.color = '#D42026';
      // 彩蛋动画
      toast.style.animation = 'shake 0.5s';
      setTimeout(() => { toast.style.animation = ''; }, 500);
    } else {
      // 完美的金黄色
      toast.style.background = 'linear-gradient(180deg, #E8C06A, #D4A850)';
      toast.style.boxShadow = '0 0 30px rgba(244,169,64,0.4)';
      feedback.textContent = '✨ 220°C，完美金黄色！';
      feedback.style.color = '#4CAF50';

      slider.disabled = true;
      setTimeout(() => {
        window.app && window.app.next();
        slider.disabled = false;
      }, 1500);
    }
  });
};

// ============================================================
// P8 切片包装 — 横向滚动浏览流水线
// ============================================================
window.init_page08 = function () {
  const wrap = document.getElementById('conveyorWrap');
  if (!wrap || wrap.dataset.ready) return;
  wrap.dataset.ready = '1';

  // 滚动到末尾时自动翻页
  wrap.addEventListener('scroll', () => {
    const maxScroll = wrap.scrollWidth - wrap.clientWidth;
    if (wrap.scrollLeft >= maxScroll - 10) {
      audio.play('click');
      setTimeout(() => window.app && window.app.next(), 800);
    }
  });
};

// ============================================================
// P9 质检挑战 — 找不合格面包
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
    // 重置面包状态
    breads.forEach(b => {
      b.classList.remove('found', 'wrong');
      b.style.pointerEvents = 'auto';
    });
    if (result) result.textContent = '';
    if (retryBtn) retryBtn.style.display = 'none';
    if (timer) timer.textContent = '10';

    quiz = new QuizGame({
      breads,
      badIndices: [2, 4],
      timeLimit: 10,
      onPass: ({ found, timeUsed }) => {
        if (result) result.innerHTML = `🎉 合格厂长！${timeUsed}秒找到${found}片`;
        if (timer) timer.textContent = '✅';
        // 存储成绩供 P10 使用
        window._quizScore = { found, timeUsed };
        audio.play('click');
        setTimeout(() => window.app && window.app.next(), 1500);
      },
      onFail: ({ found }) => {
        if (result) result.textContent = `只找到 ${found} 片，再试一次吧 😥`;
        if (timer) timer.textContent = '⏰';
        if (retryBtn) retryBtn.style.display = 'inline-block';
      },
      onUpdate: ({ timeLeft }) => {
        if (timer) {
          timer.textContent = timeLeft;
          if (timeLeft <= 3) {
            timer.style.animation = 'pulse 0.5s infinite';
            timer.style.color = '#C9212B';
          } else {
            timer.style.color = '';
          }
        }
      },
    });

    quiz.start();
  };

  // 重试按钮
  if (retryBtn) {
    retryBtn.addEventListener('click', startQuiz);
  }

  startQuiz();
};

window.leave_page09 = function () {
  // 离开页面时清理计时器
  const timerEl = document.getElementById('quizTimer');
  if (timerEl) timerEl.style.animation = '';
};

// ============================================================
// P10 质检结果 / 徽章
// ============================================================
window.init_page10 = function () {
  const badge = document.getElementById('badgeElement');
  const scoreEl = document.getElementById('badgeScore');
  if (!badge || badge.dataset.ready) return;
  badge.dataset.ready = '1';

  // 显示成绩
  if (window._quizScore && scoreEl) {
    const { found, timeUsed } = window._quizScore;
    scoreEl.textContent = `${timeUsed}秒找到${found}片 · 完美`;
  }

  let clicked = false;
  badge.addEventListener('click', () => {
    if (clicked) return;
    clicked = true;
    badge.style.animation = 'none';
    badge.style.boxShadow = '0 0 60px rgba(244,169,64,0.8), 0 0 120px rgba(212,32,38,0.3)';
    audio.play('click');
    setTimeout(() => window.app && window.app.next(), 1200);
  });
};

// ============================================================
// P11 360° 产品展示 — 拖拽旋转
// ============================================================
window.init_page11 = function () {
  const product = document.getElementById('product3d');
  const container = document.getElementById('productRotate');
  if (!product || product.dataset.ready) return;
  product.dataset.ready = '1';

  let startX = 0;
  let currentRotate = 0;

  container.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });

  container.addEventListener('touchmove', (e) => {
    const dx = e.touches[0].clientX - startX;
    currentRotate += dx * 0.5;
    product.style.transform = `rotateY(${currentRotate}deg)`;
    startX = e.touches[0].clientX;
  });

  // Mouse
  container.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      currentRotate += dx * 0.5;
      product.style.transform = `rotateY(${currentRotate}deg)`;
      startX = ev.clientX;
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
};

// ============================================================
// P12 透明工厂直播间 — 点击跳转
// ============================================================
window.init_page12 = function () {
  const phone = document.getElementById('livePhone');
  if (!phone || phone.dataset.ready) return;
  phone.dataset.ready = '1';

  phone.addEventListener('click', () => {
    audio.play('click');
    // 跳转到真正的直播间（占位链接）
    window.open('https://www.haoshifood.com/live', '_blank');
  });
};

// ============================================================
// P13 Slogan 动画 — 点击任意位置继续
// ============================================================
window.init_page13 = function () {
  const page = document.getElementById('page13');
  if (!page || page.dataset.ready) return;
  page.dataset.ready = '1';

  // 动画是 CSS 自动播放的，只需要点击翻页
  page.addEventListener('click', () => {
    window.app && window.app.next();
  });
};

// ============================================================
// P14 专属海报 — Canvas 合成
// ============================================================
window.init_page14 = function () {
  const btnGen = document.getElementById('btnGenerate');
  const btnDl = document.getElementById('btnDownload');
  const canvas = document.getElementById('posterCanvas');
  if (!btnGen || btnGen.dataset.ready) return;
  btnGen.dataset.ready = '1';

  btnGen.addEventListener('click', async () => {
    btnGen.textContent = '⏳ 生成中...';
    btnGen.disabled = true;

    const { found = 2, timeUsed = 0 } = window._quizScore || {};
    const dataURL = await generatePoster({
      canvas,
      badgeSrc: '',
      productSrc: '',
      score: found,
      timeUsed,
    });

    btnGen.style.display = 'none';
    btnDl.style.display = 'inline-block';
    audio.play('click');

    // 把结果存下来供下载
    btnDl._dataURL = dataURL;
    btnGen.disabled = false;
    btnGen.textContent = '📸 生成海报';
  });

  btnDl.addEventListener('click', () => {
    if (btnDl._dataURL) {
      downloadPoster(btnDl._dataURL);
    }
  });
};

// ============================================================
// P15 尾页 — 行动号召按钮
// ============================================================
window.init_page15 = function () {
  const page = document.getElementById('page15');
  if (!page || page.dataset.ready) return;
  page.dataset.ready = '1';

  document.getElementById('btnBuy')?.addEventListener('click', () => {
    window.open('https://www.haoshifood.com/buy', '_blank');
  });

  document.getElementById('btnLive2')?.addEventListener('click', () => {
    window.open('https://www.haoshifood.com/live', '_blank');
  });

  document.getElementById('btnSite')?.addEventListener('click', () => {
    window.open('https://www.haoshifood.com', '_blank');
  });

  // 话题复制
  document.getElementById('actionTags')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('#豪士豪士好吃好吃# @豪士官方旗舰店');
      const el = document.getElementById('actionTags');
      const orig = el.textContent;
      el.textContent = '✅ 已复制！去微博/抖音/小红书发帖吧';
      setTimeout(() => { el.textContent = orig; }, 2000);
    } catch (e) {
      // clipboard 不可用则忽略
    }
  });
};
