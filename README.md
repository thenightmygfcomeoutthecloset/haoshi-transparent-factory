# 豪士透明工厂查岗日 — 这届年轻人，连面包都要亲自查岗

> 全国大学生广告艺术大赛（大广赛）互动类参赛作品 · 线上互动 H5

[![License: MulanPSL2](https://img.shields.io/badge/License-MulanPSL2-blue.svg)](LICENSE)
[![Vite 5](https://img.shields.io/badge/Vite-5.x-646CFF.svg)](https://vitejs.dev/)
[![GSAP 3](https://img.shields.io/badge/GSAP-3.12-green.svg)](https://greensock.com/gsap/)

## 🍞 作品简介

本项目围绕豪士面包「用别样形式玩转豪士透明工厂」命题展开，通过“一日透明厂长”的角色扮演叙事，带领用户以第一视角深度查岗豪士漳州超级工厂的五大核心工序（原料、和面、烘烤、包装、质检）。

- **体验链接**：[https://thenightmygfcomeoutthecloset.github.io/haoshi-transparent-factory/](https://thenightmygfcomeoutthecloset.github.io/haoshi-transparent-factory/)
- **设计基准**：640 × 1008 px 移动端视口自适应，支持手机全屏与桌面等比居中渲染
- **视觉风格**：复古绅士·精英督察（PANTONE 288C 专蓝 + PANTONE 873C 专金 + 霞鹜文楷/思源宋体）

---

## 🎮 核心互动关卡

1. **入场金色参观券**：复古纸质撕票入场交互与微光粒子氛围
2. **厂长任命**：动态任命工牌与实体印章盖章音效
3. **查岗任务书**：5 大核心车间查岗关卡清单
4. **第一站 · 查原料**：世界原料航线轨迹汇聚动画（法国酵母、玻利维亚红藜麦、加拿大高筋小麦 ➔ 漳州超级工厂）
5. **第二站 · 查工艺**：和面面团筋度滑动条交互（触觉震动 + 黄金区间反馈）
6. **第三站 · 查火候**：温控滑动条动态计算 RGB 颜色插值烘焙控温
7. **第四站 · 查包装**：无边吐司 3-Step 流程切片手势轮播
8. **第五站 · 查质检**：6 选 2 瑕疵品排查限时小游戏（10秒倒计时圆环 + 容错机制）
9. **一日厂长认证**：根据查岗表现动态判定 S/A/B 级厂长证书 + 金色礼花粒子庆祝
10. **工厂探秘视频**：模拟直播间弹幕与探秘视频直达
11. **社交裂变转化**：一键复制社交平台查岗话题与天猫官方旗舰店外练

---

## 🛠 技术架构

- **构建工具**：[Vite 5](https://vitejs.dev/)
- **动画引擎**：GSAP 3 (Timeline / Stagger / Easing) + Web Animations
- **特效增强**：`canvas-confetti` 礼花粒子系统
- **音频系统**：轻量级 Web Audio / HTML5 Audio 统一管理器（支持微信 JSBridge 环境解锁与无手势静默降级）
- **触控系统**：跨端统一手势引擎（滑动判定、防冲突拦截器、iOS 300ms 点击延迟消除）

---

## 🚀 本地开发与构建

### 1. 克隆与安装依赖
```bash
git clone https://github.com/thenightmygfcomeoutthecloset/haoshi-transparent-factory.git
cd haoshi-transparent-factory
npm install
```

### 2. 启动本地开发服务
```bash
npm run dev
```
开发服务器将运行在 `http://localhost:3000` 并自动打开浏览器。

### 3. 构建发布
```bash
npm run build
```
构建产物输出至 `dist/` 目录，已针对 GitHub Pages / EdgeOne Pages 静态托管及本地运行进行双端兼容。
