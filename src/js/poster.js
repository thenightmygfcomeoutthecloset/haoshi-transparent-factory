/* === poster.js — 纯原生 Canvas 2D 毫秒级生成高分辨率厂长档案卡 === */

export function generateInspectorPoster({ certNo, grade, gradeTitle, personalMsg, timeUsed, mistakes }) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 750;
    const height = 1180;
    canvas.width = width;
    canvas.height = height;

    // 1. 背景渐变与底色 (深邃海军蓝配暖金光泽)
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#102060');
    bgGrad.addColorStop(0.5, '#1B3A8C');
    bgGrad.addColorStop(1, '#0A1435');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. 双层金属烫金内边框
    ctx.strokeStyle = '#D4B83C';
    ctx.lineWidth = 3;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    ctx.strokeStyle = 'rgba(197, 160, 40, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(46, 46, width - 92, height - 92);

    // 四角装饰折角
    const drawCorner = (x, y, dx, dy) => {
      ctx.strokeStyle = '#D4B83C';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + dy * 20);
      ctx.lineTo(x, y);
      ctx.lineTo(x + dx * 20, y);
      ctx.stroke();
    };
    drawCorner(52, 52, 1, 1);
    drawCorner(width - 52, 52, -1, 1);
    drawCorner(52, height - 52, 1, -1);
    drawCorner(width - 52, height - 52, -1, -1);

    // 3. 顶标与档名
    ctx.textAlign = 'center';
    ctx.fillStyle = '#D4B83C';
    ctx.font = '600 16px "Courier New", monospace';
    ctx.letterSpacing = '3px';
    ctx.fillText('HORSH TRANSPARENT FACTORY · INSPECTOR ARCHIVE', width / 2, 95);

    ctx.fillStyle = '#FAF8F2';
    ctx.font = '700 34px "Noto Serif SC", "STSong", serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('一日透明厂长 · 结业档案', width / 2, 145);

    ctx.fillStyle = 'rgba(250, 248, 242, 0.65)';
    ctx.font = '14px "LXGW WenKai", sans-serif';
    ctx.fillText(`档案编号：NO. HS-2026-${certNo || '9527'}`, width / 2, 180);

    // 4. 勋章徽记圆盘
    const sealY = 320;
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, sealY, 95, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(212, 184, 60, 0.12)';
    ctx.fill();
    ctx.strokeStyle = '#D4B83C';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 徽记金色字母
    ctx.fillStyle = '#FFD700';
    ctx.font = '900 86px "Playfair Display", serif';
    ctx.fillText(grade || 'S', width / 2, sealY + 30);
    ctx.restore();

    // 评级称号
    ctx.fillStyle = '#FFD700';
    ctx.font = '700 24px "Noto Serif SC", serif';
    ctx.fillText(gradeTitle || '特级督造官', width / 2, 460);

    // 5. 核心查岗数据卡片 (内嵌毛玻璃深色框)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.fillRect(80, 505, width - 160, 240);
    ctx.strokeStyle = 'rgba(212, 184, 60, 0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(80, 505, width - 160, 240);

    // 三列数据
    const colWidth = (width - 160) / 3;
    const stats = [
      { num: `${timeUsed || 3}s`, label: '质检用时' },
      { num: `${218}°C`, label: '把控火候' },
      { num: `${mistakes || 0}次`, label: '质检失误' }
    ];

    stats.forEach((item, idx) => {
      const cx = 80 + colWidth * idx + colWidth / 2;
      ctx.fillStyle = '#FAF8F2';
      ctx.font = '700 32px "Playfair Display", sans-serif';
      ctx.fillText(item.num, cx, 570);

      ctx.fillStyle = 'rgba(250, 248, 242, 0.6)';
      ctx.font = '14px "Noto Serif SC", sans-serif';
      ctx.fillText(item.label, cx, 605);

      if (idx < 2) {
        ctx.strokeStyle = 'rgba(212, 184, 60, 0.2)';
        ctx.beginPath();
        ctx.moveTo(80 + colWidth * (idx + 1), 535);
        ctx.lineTo(80 + colWidth * (idx + 1), 615);
        ctx.stroke();
      }
    });

    // 个性化评语
    ctx.fillStyle = '#EBF0FB';
    ctx.font = '16px "LXGW WenKai", sans-serif';
    ctx.fillText(personalMsg || '真材实料亲自查，豪士吐司放心吃。', width / 2, 680);
    ctx.fillStyle = 'rgba(212, 184, 60, 0.8)';
    ctx.font = '13px "Courier New", monospace';
    ctx.fillText('VERIFIED BY HORSH SMART QUALITY CONTROL SYSTEM', width / 2, 715);

    // 6. 底部品牌印记与Slogan
    ctx.fillStyle = '#FAF8F2';
    ctx.font = '700 26px "Noto Serif SC", serif';
    ctx.letterSpacing = '6px';
    ctx.fillText('豪士豪士 · 好吃好吃', width / 2, 830);

    ctx.fillStyle = 'rgba(250, 248, 242, 0.6)';
    ctx.font = '14px "Noto Serif SC", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('福建漳州 430亩超级透明工厂 · 出品', width / 2, 868);

    // 7. 底部留白提示条
    ctx.fillStyle = 'rgba(212, 184, 60, 0.15)';
    ctx.fillRect(80, 930, width - 160, 150);
    ctx.strokeStyle = 'rgba(212, 184, 60, 0.35)';
    ctx.strokeRect(80, 930, width - 160, 150);

    ctx.fillStyle = '#D4B83C';
    ctx.font = '700 18px "Noto Serif SC", sans-serif';
    ctx.fillText('🎖️ 厂长专享尝鲜特权', width / 2, 980);

    ctx.fillStyle = 'rgba(250, 248, 242, 0.8)';
    ctx.font = '14px "LXGW WenKai", sans-serif';
    ctx.fillText('凭此档案编号，可在豪士官方旗舰店领取今日新鲜出炉试吃装', width / 2, 1020);
    ctx.fillStyle = 'rgba(250, 248, 242, 0.45)';
    ctx.font = '12px sans-serif';
    ctx.fillText('长按图片保存至手机相册 · 晒出你的专属厂长战绩', width / 2, 1055);

    resolve(canvas.toDataURL('image/jpeg', 0.92));
  });
}
