/* === gesture.js — 手势识别 (touch + mouse) === */

class Gesture {
  constructor(element, options = {}) {
    this.el = element;
    this.threshold = options.threshold || 50;
    this.handlers = {
      swipeLeft: [],
      swipeRight: [],
      swipeUp: [],
      swipeDown: [],
      tap: [],
    };

    this._startX = 0;
    this._startY = 0;
    this._startTarget = null;
    this._moved = false;
    this._active = false;

    this._onStart = this._onStart.bind(this);
    this._onMove = this._onMove.bind(this);
    this._onEnd = this._onEnd.bind(this);

    this.el.addEventListener('touchstart', this._onStart, { passive: false });
    this.el.addEventListener('touchmove', this._onMove, { passive: false });
    this.el.addEventListener('touchend', this._onEnd);

    this.el.addEventListener('mousedown', this._onStart);
    this.el.addEventListener('mousemove', this._onMove);
    this.el.addEventListener('mouseup', this._onEnd);
  }

  onSwipeLeft(fn) { this.handlers.swipeLeft.push(fn); }
  onSwipeRight(fn) { this.handlers.swipeRight.push(fn); }
  onSwipeUp(fn) { this.handlers.swipeUp.push(fn); }
  onSwipeDown(fn) { this.handlers.swipeDown.push(fn); }
  onTap(fn) { this.handlers.tap.push(fn); }

  _getPos(e) {
    if (e.touches && e.touches.length) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  _onStart(e) {
    const pos = this._getPos(e);
    this._startX = pos.x;
    this._startY = pos.y;
    this._startTarget = e.target;
    this._moved = false;
    this._active = true;
  }

  _onMove(e) {
    if (!this._active) return;
    const pos = this._getPos(e);
    const dx = pos.x - this._startX;
    const dy = pos.y - this._startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      this._moved = true;
    }
  }

  _onEnd(e) {
    if (!this._active) return;
    this._active = false;

    // 滑块控件不拦截
    const target = this._startTarget;
    if (target) {
      const el = target.closest ? target : target.parentElement;
      if (el && el.closest && el.closest('input[type=range]')) {
        return;
      }
    }

    const pos = e.changedTouches ? e.changedTouches[0] : e;
    const dx = (pos.clientX || pos.x) - this._startX;
    const dy = (pos.clientY || pos.y) - this._startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (!this._moved && absDx < 10 && absDy < 10) {
      this._fire('tap');
      return;
    }

    // P7 包装页：根据轮播 step 限制翻页
    if (target && target.closest && target.closest('#page08 .glass-card')) {
      const step = typeof window._pkgStep === 'function' ? window._pkgStep() : 2;
      // 左滑：step1/2 → 只切轮播不翻页；step3 → 翻下一页
      if (dx < 0 && step < 2) return;
      // 右滑：step1 → 翻上一页；step2/3 → 只切轮播不翻页
      if (dx > 0 && step > 0) return;
    }

    if (absDx > absDy && absDx >= this.threshold) {
      this._fire(dx > 0 ? 'swipeRight' : 'swipeLeft');
    } else if (absDy > absDx && absDy >= this.threshold) {
      this._fire(dy > 0 ? 'swipeDown' : 'swipeUp');
    }
  }

  _fire(type) {
    this.handlers[type].forEach(fn => fn());
  }

  destroy() {
    this.el.removeEventListener('touchstart', this._onStart);
    this.el.removeEventListener('touchmove', this._onMove);
    this.el.removeEventListener('touchend', this._onEnd);
    this.el.removeEventListener('mousedown', this._onStart);
    this.el.removeEventListener('mousemove', this._onMove);
    this.el.removeEventListener('mouseup', this._onEnd);
  }
}

export default Gesture;
