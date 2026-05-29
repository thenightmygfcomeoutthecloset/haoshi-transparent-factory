/* === quiz.js — P9 质检小游戏逻辑 === */

class QuizGame {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container — 装面包的父容器
   * @param {HTMLElement[]} options.breads — 6 片面包元素
   * @param {number[]} options.badIndices — 不合格面包的索引 (0-based, 2个)
   * @param {number} options.timeLimit — 限时秒数, 默认 10
   * @param {Function} options.onPass — 通关回调
   * @param {Function} options.onFail — 失败回调
   * @param {Function} options.onUpdate — 状态更新回调 ({ found, total, timeLeft })
   */
  constructor(options = {}) {
    this.breads = options.breads || [];
    this.badIndices = options.badIndices || [];
    this.timeLimit = options.timeLimit || 10;
    this.maxMistakes = options.maxMistakes || 3;
    this.onPass = options.onPass || (() => {});
    this.onFail = options.onFail || (() => {});
    this.onUpdate = options.onUpdate || (() => {});

    this.found = 0;          // 已找到的坏面包数
    this.totalBad = this.badIndices.length;
    this.mistakes = 0;        // 错误点击次数
    this.timeLeft = this.timeLimit;
    this.running = false;
    this.timer = null;
    this._clicked = new Set(); // 已点击的面包索引（防重复）

    this._onClick = this._onClick.bind(this);
  }

  start() {
    this.found = 0;
    this.mistakes = 0;
    this.timeLeft = this.timeLimit;
    this._clicked.clear();
    this.running = true;

    // 绑定点击
    this.breads.forEach((el, i) => {
      el.addEventListener('click', this._onClick);
      el.style.pointerEvents = 'auto';
      el.classList.remove('found', 'wrong');
    });

    // 倒计时
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.onUpdate({ found: this.found, total: this.totalBad, timeLeft: this.timeLeft });

      if (this.timeLeft <= 0) {
        this._end(false);
      }
    }, 1000);

    this.onUpdate({ found: this.found, total: this.totalBad, timeLeft: this.timeLeft });
  }

  _onClick(e) {
    const idx = this.breads.indexOf(e.currentTarget);
    if (idx === -1 || this._clicked.has(idx)) return;
    this._clicked.add(idx);

    if (this.badIndices.includes(idx)) {
      this.found++;
      e.currentTarget.classList.add('found');
      if (this.found >= this.totalBad) {
        this._end(true);
      }
    } else {
      this.mistakes++;
      e.currentTarget.classList.add('wrong');
      // 错误次数达到上限直接失败
      if (this.mistakes >= this.maxMistakes) {
        this._end(false);
        return;
      }
    }

    this.onUpdate({ found: this.found, total: this.totalBad, timeLeft: this.timeLeft, mistakes: this.mistakes });
  }

  _end(passed) {
    if (!this.running) return;
    this.running = false;
    clearInterval(this.timer);

    this.breads.forEach(el => {
      el.removeEventListener('click', this._onClick);
    });

    if (passed) {
      this.onPass({ found: this.found, timeUsed: this.timeLimit - this.timeLeft, mistakes: this.mistakes });
    } else {
      this.onFail({ found: this.found, timeUsed: this.timeLimit - this.timeLeft, mistakes: this.mistakes });
    }
  }

  reset() {
    clearInterval(this.timer);
    this.running = false;
    this._clicked.clear();
    this.breads.forEach(el => {
      el.removeEventListener('click', this._onClick);
      el.classList.remove('found', 'wrong');
    });
  }
}

export default QuizGame;
