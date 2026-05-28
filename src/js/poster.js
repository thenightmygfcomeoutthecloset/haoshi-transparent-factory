/* === poster.js — P14 Canvas 厂长工牌海报 === */

/**
 * 生成厂长专属工牌海报
 */
async function generatePoster(options) {
  const { canvas, badgeSrc, productSrc, userName = '一日透明厂长', score = 2, timeUsed = 0 } = options;

  const ctx = canvas.getContext('2d');
  const W = canvas.width = 640;
  const H = canvas.height = 1008;

  // ① 背景：奶白色 → 面包暖黄
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#FFF8EA');
  grad.addColorStop(0.4, '#FFE8B8');
  grad.addColorStop(0.7, '#F5B84B');
  grad.addColorStop(1, '#003B7A');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 顶部装饰线（豪士蓝）
  ctx.fillStyle = '#003B7A';
  ctx.fillRect(0, 0, W, 8);

  const loadImg = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  try {
    // ② 产品图
    const productSrcToUse = productSrc || './assets/images/工厂2.png';
    if (productSrcToUse) {
      const product = await loadImg(productSrcToUse);
      const pw = 380;
      const ph = (product.height / product.width) * pw;
      ctx.globalAlpha = 0.9;
      ctx.drawImage(product, (W - pw) / 2, 140, pw, ph);
      ctx.globalAlpha = 1;
    }

    // ③ 工牌卡片区域
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    roundRect(ctx, 60, 440, W - 120, 340, 24);
    ctx.fill();

    // ④ 标题
    ctx.fillStyle = '#003B7A';
    ctx.font = '900 34px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('一日透明厂长', W / 2, 510);

    ctx.font = '700 20px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText(userName, W / 2, 550);

    // ⑤ 成绩
    ctx.fillStyle = '#5B3217';
    ctx.font = '16px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText(`质检通过 · 发现 ${score} 片 · 用时 ${timeUsed}s`, W / 2, 600);

    // 三项指标
    const metrics = [
      { label: '好 事 值', value: '★★★★★' },
      { label: '安 心 值', value: '★★★★★' },
      { label: '新 鲜 值', value: '★★★★★' },
    ];
    ctx.font = '14px "PingFang SC","Microsoft YaHei",sans-serif';
    metrics.forEach((m, i) => {
      const x = W / 2 - 120 + i * 120;
      ctx.fillStyle = '#003B7A';
      ctx.fillText(m.label, x, 650);
      ctx.fillStyle = '#F5B84B';
      ctx.fillText(m.value, x, 672);
    });

    // ⑥ 底部品牌
    ctx.fillStyle = '#FFF';
    ctx.font = '900 28px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('豪士豪士，好吃好吃', W / 2, 900);

    ctx.font = '16px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('豪士藜麦吐司 · 把好事做透明', W / 2, 940);

    // 底部装饰线
    ctx.fillStyle = '#F5B84B';
    ctx.fillRect(0, H - 8, W, 8);

    return canvas.toDataURL('image/png');
  } catch (err) {
    // 图片加载失败时用纯色占位
    ctx.fillStyle = '#FFF8EA';
    ctx.font = '24px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('你的专属厂长工牌', W / 2, H / 2);
    return canvas.toDataURL('image/png');
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function downloadPoster(dataURL, filename = '豪士厂长工牌.png') {
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export { generatePoster, downloadPoster };
