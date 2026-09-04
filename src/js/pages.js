/* === pages.js — 7幕沉浸式工坊漫游 交互驱动逻辑 === */

import audio from './audio.js';
import haptic from './haptic.js';
import { LIVE_URL, TMALL_URL } from './config.js';
import confetti from 'canvas-confetti';
import { generateInspectorPoster } from './poster.js';

// 全局临时状态存储
window._userData = {
  certNo: String(Math.floor(Math.random() * 9000) + 1000),
  doughVal: 50,
  bakeTemp: 218,
  quizTime: 3,
  quizMistakes: 0,
  grade: 'S',
  gradeTitle: '特级督造官',
  personalMsg: '零失误通关，豪士正式向你发放全职厂长邀请 🎖️'
};

// ============================================================
// ACT 1: 金色参观券 · 序章入厂
// ============================================================
window.init_act01 = function () {
  const handle = document.getElementById('tearHandle');
  const track = document.getElementById('tearTrack');
  const btnEnter = document.getElementById('btnEnterDirect');
  const ticketNo = document.getElementById('ticketNoText');

  if (ticketNo) ticketNo.textContent = `NO. ${window._userData.certNo}`;
  if (!handle || handle.dataset.ready) return;
  handle.dataset.ready = '1';

  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  let maxDrag = 0;

  const onStart = (e) => {
    isDragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    maxDrag = track.clientWidth - handle.clientWidth - 8;
    haptic.tick();
  };

  const onMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const dx = Math.max(0, Math.min(clientX - startX, maxDrag));
    currentX = dx;
    handle.style.transform = `translateX(${dx}px)`;
    if (Math.random() < 0.15) haptic.tick();
  };

  const onEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    if (currentX >= maxDrag * 0.7) {
      // 成功撕开
      handle.style.transform = `translateX(${maxDrag}px)`;
      finishAct1();
    } else {
      // 回弹
      handle.style.transition = 'transform 0.3s ease';
      handle.style.transform = 'translateX(0px)';
      setTimeout(() => { handle.style.transition = ''; }, 300);
    }
  };

  const finishAct1 = () => {
    haptic.impact();
    audio.play('tear');
    window.app && window.app.next();
  };

  handle.addEventListener('touchstart', onStart, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('touchend', onEnd);

  handle.addEventListener('mousedown', onStart);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onEnd);

  if (btnEnter) {
    btnEnter.addEventListener('click', finishAct1);
  }
};

// ============================================================
// ACT 2: 厂长任命 · 掌纹激活
// ============================================================
window.init_act02 = function () {
  const scanner = document.getElementById('fingerprintScanner');
  const stamp = document.getElementById('stampSeal');
  const btnNext = document.getElementById('btnAct2Next');
  if (!scanner || scanner.dataset.ready) return;
  scanner.dataset.ready = '1';

  let pressTimer = null;
  let isActivated = false;

  const triggerActivation = () => {
    if (isActivated) return;
    isActivated = true;
    haptic.impact();
    scanner.classList.remove('pressing');
    scanner.style.borderColor = '#2D7D4F';
    scanner.style.background = 'rgba(45, 125, 79, 0.2)';
    scanner.innerHTML = '<span style="font-size:36px;color:#2D7D4F;">✓</span>';

    // 印章盖下
    if (stamp) {
      stamp.classList.add('stamped');
      audio.play('stamp');
    }

    const title = document.getElementById('act2Status');
    if (title) title.innerHTML = '🎖️ 厂长身份激活成功 · 录入完毕';

    if (btnNext) {
      btnNext.style.display = 'flex';
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(btnNext, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'back.out(2)' });
      }
    }
  };

  const startPress = () => {
    if (isActivated) return;
    scanner.classList.add('pressing');
    haptic.tick();
    pressTimer = setTimeout(() => {
      triggerActivation();
    }, 600);
  };

  const endPress = () => {
    scanner.classList.remove('pressing');
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  };

  scanner.addEventListener('touchstart', startPress, { passive: true });
  scanner.addEventListener('touchend', endPress);
  scanner.addEventListener('mousedown', startPress);
  scanner.addEventListener('mouseup', endPress);
  scanner.addEventListener('click', () => {
    if (!isActivated) triggerActivation();
  });

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      audio.play('click');
      window.app && window.app.next();
    });
  }
};

// ============================================================
// ACT 3: 第一站 · 查原料 (地球溯源罗盘)
// ============================================================
window.init_act03 = function () {
  const cards = document.querySelectorAll('.macro-card');
  const needle = document.getElementById('compassNeedle');
  const detailTitle = document.getElementById('originDetailTitle');
  const detailDesc = document.getElementById('originDetailDesc');
  const btnNext = document.getElementById('btnAct3Next');
  if (cards.length === 0 || cards[0].dataset.ready) return;
  cards[0].dataset.ready = '1';

  const originData = [
    {
      angle: -45,
      title: '玻利维亚 · 安第斯红藜麦',
      desc: '海拔 4000m 原生高原谷物，晶莹胚芽圈清晰可见，高蛋白低热量营养之王。'
    },
    {
      angle: 40,
      title: '法国 · 乐斯福活性酵母',
      desc: '源自法国百年酵母世家，活性极高，自然慢发酵赋予吐司均匀细密蜂窝微气孔。'
    },
    {
      angle: -85,
      title: '加拿大 · 黄金高筋春小麦',
      desc: '北纬 50° 阳光黑土孕育，13.5% 蛋白质含量，麦香醇厚，筋道松软回弹。'
    }
  ];

  cards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      haptic.tick();
      audio.play('flip');

      const data = originData[idx];
      if (needle) needle.style.transform = `rotate(${data.angle}deg)`;
      if (detailTitle) detailTitle.textContent = data.title;
      if (detailDesc) detailDesc.textContent = data.desc;
    });
  });

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      audio.play('click');
      window.app && window.app.next();
    });
  }
};

// ============================================================
// ACT 4: 第二站 · 查工艺 (揉出透明手套膜)
// ============================================================
window.init_act04 = function () {
  const slider = document.getElementById('doughSliderNew');
  const ball = document.getElementById('doughBallVisual');
  const feedback = document.getElementById('doughFeedbackNew');
  const badge = document.getElementById('membraneBadge');
  const btnNext = document.getElementById('btnAct4Next');
  if (!slider || slider.dataset.ready) return;
  slider.dataset.ready = '1';

  let hasWon = false;

  slider.addEventListener('input', () => {
    const val = parseInt(slider.value);
    window._userData.doughVal = val;

    // 面团形状根据滑块伸缩
    const scaleX = 1 + (val / 100) * 0.8;
    const scaleY = 1 - (val / 100) * 0.35;
    if (ball) ball.style.transform = `scale(${scaleX}, ${scaleY})`;

    if (val < 40) {
      if (feedback) feedback.textContent = '面团偏软 · 筋膜未充分醒发';
      if (feedback) feedback.style.color = '#B07820';
      if (badge) badge.classList.remove('show');
      if (ball) ball.classList.remove('stretched');
    } else if (val > 62) {
      if (feedback) feedback.textContent = '用力过度 · 筋膜破裂发硬';
      if (feedback) feedback.style.color = '#C03030';
      if (badge) badge.classList.remove('show');
      if (ball) ball.classList.remove('stretched');
    } else {
      // 黄金手套膜区间 42% - 58%
      if (feedback) feedback.textContent = '✓ 4年研发黄金筋度：透光手套膜达成！';
      if (feedback) feedback.style.color = '#2D7D4F';
      if (badge) badge.classList.add('show');
      if (ball) ball.classList.add('stretched');

      if (!hasWon) {
        hasWon = true;
        haptic.success();
        audio.play('ding');
        if (btnNext) {
          btnNext.style.display = 'flex';
          if (typeof gsap !== 'undefined') {
            gsap.fromTo(btnNext, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'back.out(2)' });
          }
        }
      }
    }
  });

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      audio.play('click');
      window.app && window.app.next();
    });
  }
};

// ============================================================
// ACT 5: 第三站 · 查火候 (360°烤箱旋钮与美拉德反应)
// ============================================================
window.init_act05 = function () {
  const knob = document.getElementById('ovenKnob');
  const tempText = document.getElementById('ovenTempDisplay');
  const toastSlice = document.getElementById('ovenToastSlice');
  const glow = document.getElementById('ovenGlowHeat');
  const feedback = document.getElementById('bakeFeedbackNew');
  const btnNext = document.getElementById('btnAct5Next');
  if (!knob || knob.dataset.ready) return;
  knob.dataset.ready = '1';

  let currentTemp = 160;
  let hasPassed = false;

  const updateBake = (temp) => {
    currentTemp = Math.max(120, Math.min(260, temp));
    window._userData.bakeTemp = currentTemp;
    if (tempText) tempText.textContent = `${currentTemp.toFixed(1)}°C`;

    // 旋转指针
    const angle = ((currentTemp - 120) / (260 - 120)) * 260 - 130;
    knob.style.transform = `rotate(${angle}deg)`;

    // 热浪光晕
    const heatAlpha = ((currentTemp - 120) / 140) * 0.7;
    if (glow) glow.style.background = `radial-gradient(circle, rgba(255, 100, 20, ${heatAlpha}) 0%, rgba(200, 30, 0, ${heatAlpha * 0.6}) 100%)`;

    // 吐司美拉德反应颜色过渡
    if (currentTemp < 205) {
      if (toastSlice) {
        toastSlice.style.background = '#FAF0D8';
        toastSlice.style.borderColor = '#E2CEA8';
      }
      if (feedback) feedback.textContent = '火候不足 · 表皮苍白未熟';
      if (feedback) feedback.style.color = '#B07820';
    } else if (currentTemp > 230) {
      if (toastSlice) {
        toastSlice.style.background = '#6B3714';
        toastSlice.style.borderColor = '#4A2008';
      }
      if (feedback) feedback.textContent = '火候过大 · 面包微焦';
      if (feedback) feedback.style.color = '#C03030';
    } else {
      // 黄金火候 215 - 225°C
      if (toastSlice) {
        toastSlice.style.background = '#DFA642';
        toastSlice.style.borderColor = '#A26815';
      }
      if (feedback) feedback.textContent = '✓ 218°C 恒温烘焙：表皮微脆内心软糯！';
      if (feedback) feedback.style.color = '#2D7D4F';

      if (!hasPassed) {
        hasPassed = true;
        haptic.success();
        audio.play('ding');
        if (btnNext) {
          btnNext.style.display = 'flex';
          if (typeof gsap !== 'undefined') {
            gsap.fromTo(btnNext, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'back.out(2)' });
          }
        }
      }
    }
  };

  // 滑块或拖动旋钮
  let isKnobDragging = false;
  let knobStartY = 0;

  knob.addEventListener('touchstart', (e) => {
    isKnobDragging = true;
    knobStartY = e.touches[0].clientY;
    haptic.tick();
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isKnobDragging) return;
    const dy = knobStartY - e.touches[0].clientY;
    updateBake(currentTemp + dy * 0.4);
    knobStartY = e.touches[0].clientY;
    if (Math.random() < 0.25) haptic.tick();
  }, { passive: true });

  window.addEventListener('touchend', () => { isKnobDragging = false; });

  // 快捷微调按钮支持
  const btnInc = document.getElementById('btnTempInc');
  const btnDec = document.getElementById('btnTempDec');
  if (btnInc) btnInc.addEventListener('click', () => { haptic.tick(); updateBake(currentTemp + 10); });
  if (btnDec) btnDec.addEventListener('click', () => { haptic.tick(); updateBake(currentTemp - 10); });

  updateBake(180);

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      audio.play('click');
      window.app && window.app.next();
    });
  }
};

// ============================================================
// ACT 6: 第四站 · 查质检 (传送带 10 秒眼力挑战)
// ============================================================
window.init_act06 = function () {
  const breads = document.querySelectorAll('.inspect-bread-item');
  const timerEl = document.getElementById('inspectTimerSec');
  const timerCircle = document.getElementById('inspectTimerCircle');
  const resultEl = document.getElementById('inspectResultMsg');
  const btnNext = document.getElementById('btnAct6Next');
  if (breads.length === 0 || breads[0].dataset.ready) return;
  breads[0].dataset.ready = '1';

  let foundCount = 0;
  let mistakes = 0;
  let timeLeft = 10;
  let timerId = null;
  let isDone = false;

  const totalLength = 2 * Math.PI * 26; // r=26

  timerId = setInterval(() => {
    if (isDone) { clearInterval(timerId); return; }
    timeLeft--;
    if (timerEl) timerEl.textContent = timeLeft;
    if (timerCircle) {
      const offset = totalLength * (1 - timeLeft / 10);
      timerCircle.style.strokeDashoffset = offset;
    }
    if (timeLeft <= 0) {
      clearInterval(timerId);
      endQuiz(false);
    }
  }, 1000);

  breads.forEach((item) => {
    item.addEventListener('click', () => {
      if (isDone) return;
      const isBad = item.dataset.bad === 'true';

      if (isBad) {
        if (!item.classList.contains('selected-bad')) {
          item.classList.add('selected-bad');
          item.innerHTML += '<span style="position:absolute;color:#2D7D4F;font-size:24px;font-weight:900;">✓</span>';
          foundCount++;
          haptic.impact();
          audio.play('ding');

          if (foundCount >= 2) {
            clearInterval(timerId);
            endQuiz(true);
          }
        }
      } else {
        mistakes++;
        window._userData.quizMistakes = mistakes;
        haptic.warning();
        audio.play('alert');
        item.classList.add('selected-good');
        setTimeout(() => item.classList.remove('selected-good'), 400);
        if (resultEl) resultEl.textContent = `⚠️ 这是合格面包！已记录 ${mistakes} 次失误`;
      }
    });
  });

  const endQuiz = (passed) => {
    isDone = true;
    const timeUsed = 10 - timeLeft;
    window._userData.quizTime = timeUsed;
    const grade = (passed && mistakes === 0 && timeUsed <= 6) ? 'S' : 'A';
    window._userData.grade = grade;
    window._userData.gradeTitle = grade === 'S' ? '特级督造官' : '资深厂长';

    if (resultEl) {
      resultEl.innerHTML = passed
        ? `🎖️ 质检通过！用时 <strong>${timeUsed}s</strong>，评定为 <strong>${grade}级厂长</strong>`
        : '质检结束！已由全自动智能检测系统复核通过';
      resultEl.style.color = '#2D7D4F';
    }

    haptic.success();
    audio.play('fanfare');

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#D4B83C', '#1B3A8C', '#2D7D4F']
    });

    if (btnNext) {
      btnNext.style.display = 'flex';
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(btnNext, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'back.out(2)' });
      }
    }
  };

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      audio.play('click');
      window.app && window.app.next();
    });
  }
};

// ============================================================
// ACT 7: 终章授勋 · 厂长档案与专享尝鲜
// ============================================================
window.init_act07 = function () {
  const certEl = document.getElementById('finalCertNo');
  const gradeEl = document.getElementById('finalGradeLetter');
  const titleEl = document.getElementById('finalGradeTitle');
  const timeEl = document.getElementById('finalStatTime');
  const tempEl = document.getElementById('finalStatTemp');
  const msgEl = document.getElementById('finalPersonalMsg');

  const btnPoster = document.getElementById('btnSavePoster');
  const btnTmall = document.getElementById('btnToTmall');
  const modal = document.getElementById('posterModal');
  const modalImg = document.getElementById('posterImgPreview');
  const modalClose = document.getElementById('posterModalClose');

  const ud = window._userData;
  if (certEl) certEl.textContent = ud.certNo;
  if (gradeEl) gradeEl.textContent = ud.grade;
  if (titleEl) titleEl.textContent = ud.gradeTitle;
  if (timeEl) timeEl.textContent = `${ud.quizTime}s`;
  if (tempEl) tempEl.textContent = `${ud.bakeTemp.toFixed(0)}°C`;
  if (msgEl) msgEl.textContent = ud.personalMsg;

  // 礼花爆发
  setTimeout(() => {
    confetti({
      particleCount: 60,
      spread: 75,
      origin: { y: 0.5 },
      colors: ['#FFD700', '#D4B83C', '#1B3A8C', '#FAF8F2']
    });
  }, 400);

  if (btnPoster && !btnPoster.dataset.ready) {
    btnPoster.dataset.ready = '1';
    btnPoster.addEventListener('click', async () => {
      haptic.impact();
      audio.play('click');
      const dataUrl = await generateInspectorPoster({
        certNo: ud.certNo,
        grade: ud.grade,
        gradeTitle: ud.gradeTitle,
        personalMsg: ud.personalMsg,
        timeUsed: ud.quizTime,
        mistakes: ud.quizMistakes
      });
      if (modalImg) modalImg.src = dataUrl;
      if (modal) modal.classList.add('active');
    });
  }

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      if (modal) modal.classList.remove('active');
    });
  }

  if (btnTmall && !btnTmall.dataset.ready) {
    btnTmall.dataset.ready = '1';
    btnTmall.addEventListener('click', () => {
      haptic.impact();
      audio.play('click');
      window.open(TMALL_URL, '_blank');
    });
  }
};
