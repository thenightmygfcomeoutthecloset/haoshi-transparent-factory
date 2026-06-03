/* === config.js — 豪士透明工厂 外部链接配置 === */
/* 提交比赛前请替换为真实链接 */

export const TMALL_URL = 'https://haoshi.tmall.com';
export const LIVE_URL = 'https://v.douyin.com/W_5x-RAUnG8/';
export const OFFICIAL_SITE_URL = 'https://www.haoshifood.com';
export const TOPIC_TEXT = '#豪士豪士好吃好吃#';

// 页面标签 — 显示在顶部进度条（可自行编辑）
// show: false = 该页不显示进度条
export const PAGE_LABELS = [
  { show: true,  label: '参观券' },                             // P1
  { show: true,  label: '领取工牌' },                       // P2
  { show: true,  label: '第 1/5 站 · 查原料' },            // P3
  { show: true,  label: '王牌产品' },                       // P4
  { show: true,  label: '第 2/5 站 · 查工艺' },            // P5
  { show: true,  label: '第 3/5 站 · 查火候' },            // P6
  { show: true,  label: '第 4/5 站 · 查包装' },            // P7
  { show: true,  label: '第 5/5 站 · 查质检' },            // P8
  { show: true,  label: '认证完成 ✓' },                    // P9
  { show: true,  label: '探秘视频' },                       // P10
  { show: true,  label: '查岗完成' },                       // P11
];

export default {
  TMALL_URL,
  LIVE_URL,
  OFFICIAL_SITE_URL,
  TOPIC_TEXT,
  PAGE_LABELS,
};
