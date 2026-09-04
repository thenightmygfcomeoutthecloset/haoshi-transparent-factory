/* === config.js — 豪士透明工厂 外部链接配置 === */
/* 提交比赛前请替换为真实链接 */

export const TMALL_URL = 'https://haoshi.tmall.com';
export const LIVE_URL = 'https://v.douyin.com/W_5x-RAUnG8/';

export const ACT_LABELS = [
  { id: 'act01', name: '参观券', title: '金色参观券', hud: 'LOG 01/07 · TICKET' },
  { id: 'act02', name: '厂长任命', title: '一日厂长任命', hud: 'LOG 02/07 · APPOINTMENT' },
  { id: 'act03', name: '查原料', title: '第一站 · 查原料', hud: 'LOG 03/07 · INGREDIENTS' },
  { id: 'act04', name: '查工艺', title: '第二站 · 查工艺', hud: 'LOG 04/07 · KNEADING' },
  { id: 'act05', name: '查火候', title: '第三站 · 查火候', hud: 'LOG 05/07 · BAKING' },
  { id: 'act06', name: '查质检', title: '第四站 · 查质检', hud: 'LOG 06/07 · QUALITY' },
  { id: 'act07', name: '厂长档案', title: '终章 · 厂长荣誉档案', hud: 'LOG 07/07 · DOSSIER' },
];

export const PAGE_LABELS = ACT_LABELS.map(act => ({ show: true, label: act.name }));

export default { TMALL_URL, LIVE_URL, ACT_LABELS, PAGE_LABELS };
