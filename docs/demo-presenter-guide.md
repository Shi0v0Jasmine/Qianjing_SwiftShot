# 演示操作与视频制作指南

## 启动

在 Windows 双击仓库根目录的「启动演示.cmd」。首次启动需要 Node.js 与网络安装依赖；本机已装好依赖后可离线运行。命令窗口保持打开，在浏览器访问 http://127.0.0.1:4173。

也可以在项目根目录运行：

```powershell
npm run setup
npm run build
npm run demo
```

视频渲染优先使用本机 Chrome/Edge；可通过 SHOTSWIFT_BROWSER 指定浏览器可执行文件。如果没有本机浏览器，先在 apps/demo-video 执行 npx remotion browser ensure 下载 Remotion 渲染浏览器。

## 三分钟现场操作

1. 打开“项目输入”，介绍朝雾咖啡与预制案例。
2. 点击“打开完整示例”，说明五段结构的作用。
3. 点击“查看迁移分镜”，把第一镜字幕改成“为自己，留一杯咖啡。”，时长从 4 秒改成 5 秒。
4. 可演示上下移动分镜、撤销或更换素材；最终恢复想交付的顺序。
5. 进入“素材补全”，指出使用场景缺口，点击“使用预制补全”。明确此处为预先生成的图片。
6. 进入“预览导出”，播放 21 秒短片，点击“导出当前版本 MP4”。本机渲染期间进度可见。
7. 完成后点击“下载视频”。继续修改后，页面会提示旧导出不是当前版本。
8. 下次演示前用“重置示例”恢复初始项目。

本版的图片是静态素材，通过运镜与字幕形成短片。brief 输入保存项目意图，不实时改写固定分析。所有预制内容均有标注。

## 展示视频

最终文件：deliverables/ShotSwift-demo-zh.mp4。规格为 1920×1080、30 fps、100 秒、无音轨。随附封面、字幕脚本与源码。

```powershell
cd apps/demo-video
npm run studio
npm run render:sample
npm run render
npm run still
```

Studio 预览在 http://localhost:3001。CoffeeAd 是咖啡案例短片；ShotSwiftPresentation 是中文产品展示片。修改 src/Presentation.tsx 可调整章节、标题、节奏；咖啡分镜默认值在 src/Root.tsx。

## 原版工作流

新版首页和侧栏保留“原版工作流”入口（?mode=live）。原版 API 不由本演示服务托管。需要真实上传或 provider 功能时，按 codebase-runbook.md 启动原 API，再在 apps/web 运行 npm run dev，通过 http://127.0.0.1:5173/?mode=live 进入。演示页面与原版后端职责分别保留。

## 常见问题

- 端口占用：先打开已有 http://127.0.0.1:4173，避免重复启动。也可用 SHOTSWIFT_DEMO_PORT 配置其他端口。
- 预览正常但导出失败：确认通过启动脚本运行了本地服务，并检查命令窗口；只有静态网页部署时不能进行本机导出。
- 项目还原：项目编辑保存在当前浏览器、当前站点的 localStorage；不同端口不共享。JSON 备份包含所有分镜数据。
- 导出版本：下载链接对应点击导出时的数据；修改后重新导出才能获得新版本。
- 演示服务重启：已生成文件仍在 deliverables/renders，但内存中的任务状态会清空，页面提示重新导出。

## 用户研究

交付中包含内部验证记录与用户研究提纲。没有把内部走查冒充真实访谈，也没有声称已验证 KANO 分类、提效百分比或投放表现。
