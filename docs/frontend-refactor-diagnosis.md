# 前端架构诊断报告（迁镜 ShotSwift，warehouse/20260625-frontdev）

本报告基于对 `apps/web` 目录下全部源码文件的实际阅读（App.tsx、main.tsx、config.ts、components/WorkspaceViews.tsx、components/VideoBlockCanvas.tsx、components/AppShell.tsx、components/InspectorPanel.tsx、components/StatusBadge.tsx、components/Toast.tsx、api/client.ts、api/videoAnalysisApi.ts、types.ts、data/workflow.ts、mocks/mockVideoAnalysis.ts，以及 package.json、tsconfig.json、docs/codebase-runbook.md）写成，所有结论都能对应到具体文件和行号，不是猜测。按照约定，这次只诊断问题、不动代码，也不涉及 VideoBlockCanvas.tsx（也就是"无限画布"）内部的实现，只会说明它和外部代码的接口关系。

## 结论先说

现在这套前端能跑起来、功能是齐的，但代码组织方式几乎没有分层：一个 App 级别的状态对象、一个 2762 行的巨型文件装了五个页面、业务逻辑和界面代码焊在一起、同样的工具函数被复制粘贴了两份、类型定义分裂在两个文件里、还有确认存在但完全没人用的死代码。这些问题不是"能不能跑"的问题，而是"改一个地方容易牵连另一个地方、新人接手成本很高、长期会越改越乱"的问题。下面按证据逐条说明，最后给出重构方向的初步框架，具体方案留到下一步单独确认。

## 现在的架构实际长什么样

前端是 React 19 + TypeScript + Vite 搭建的单页应用，没有使用任何路由库（比如 React Router）。所谓"页面切换"其实是 `App.tsx` 里一个叫 `activeStep` 的字符串状态（值是 `input`、`analysis`、`migration`、`gap-fill`、`demo` 五种之一），靠一连串 `if (activeStep === "xxx") return <XxxView />` 手写出来的分支来决定显示哪个页面，这段分支代码全部写在 `components/WorkspaceViews.tsx` 里。

`App.tsx`（139 行）是全局状态的唯一持有者：当前步骤、选中的画布块、整条工作流跑出来的结果对象 `workflowResult`、画布块数组 `blocks`、项目名称，一共五组 `useState`。这些状态和对应的修改函数（`onStepChange`、`onUpdateBlock`、`onWorkflowPatch` 等）会作为二十多个 props 一次性传给 `WorkspaceViews`，再由 `WorkspaceViews` 按需转发给五个子视图。这种写法在 React 里叫"prop drilling"（属性逐层传递）：状态明明只有一处定义，但要经过好几层组件转手才能传到真正用到它的地方，中间每一层都要跟着声明一遍这些 props 的类型。目前的规模下它还能维持，但每新增一个字段，App.tsx、WorkspaceViews.tsx 的 props 类型、以及最终用到它的子视图，三个地方都要同步改。

## 具体问题清单

### 一个文件装了五个页面：WorkspaceViews.tsx（2762 行）

这个文件里既有真正的路由分发逻辑（前面提到的 if 分支），也有五个页面各自的完整实现：`InputView`（上传页，约 284 行）、`FigmaSampleAnalysisView`（样例解析页，约 380 行）、`StructureMigrationView`（结构迁移页，约 537 行）、`GapFillView`（缺口补全页，约 94 行）、`DemoView`（演示页，约 407 行），此外还有一个 `LegacyDemoView`（约 88 行以上）。这些页面组件之间没有任何文件边界，全部挤在同一个 .tsx 文件里，中间穿插着二十多个格式化函数、图标组件（`PlayIcon`、`PauseIcon`、`ShareIcon` 等都是内联在这个文件里的 SVG 组件）和状态文案映射表。这样带来的直接后果是：改动任何一个页面时，编辑器要在一个 2762 行的文件里定位代码；Git 上两个人同时改不同页面很容易在同一个文件里产生冲突；而且没有文件名可以直接告诉你"缺口补全页的代码在哪"，只能靠搜索函数名。

### 死代码：确实存在，但没人用

`components/InspectorPanel.tsx`（62 行）在整个 `src` 目录里，除了它自己的文件之外没有被任何地方引用或渲染——也就是说这是一个写好了但从未接入界面的组件。更值得注意的是，`docs/codebase-runbook.md` 第 50 行仍然把它标注为"右侧检查面板"，写得好像它在正常工作，这说明文档已经和实际代码脱节了。另外，`WorkspaceViews.tsx` 里的 `LegacyDemoView`（第 2674 行开始）同样没有被路由分支引用到（`demo` 步骤走的是 `DemoView`），是历史遗留下来但已经不会被执行的代码。这两处死代码本身不影响运行，但会让阅读代码的人误以为它们在起作用，增加理解成本。

### 同一段逻辑复制了两份

`readTextAssets`（把上传文件里的文本类文件读出来）和 `getTargetDurationSeconds`（从一段文案里解析出目标时长）这两个函数，在 `api/videoAnalysisApi.ts`（第 42 行、59 行）和 `components/WorkspaceViews.tsx`（第 327 行、320 行）里各自独立写了一遍，代码逻辑基本一致。这是典型的"没有共享工具层"导致的复制粘贴：以后如果这个解析规则要改（比如时长单位从秒改成支持分钟），必须记得同时改两个文件，很容易漏改一处导致两边行为不一致。

### 界面代码里直接写业务逻辑和网络请求

`WorkspaceViews.tsx` 里统计到 36 处 `useState`、8 处 `try/catch`、9 处对后端接口的直接调用（`analyzeV2Pipeline`、`uploadMaterialFiles`、`createV2ScriptSession` 等）。也就是说，每个页面组件自己管理自己的上传状态、加载状态、错误状态，自己在事件处理函数里直接 `await` 调后端接口、自己写 try/catch。这些逻辑没有被抽成独立的"数据请求钩子"（React 里常见的做法是写成 `useXxx` 这样的自定义 hook，把请求、加载状态、错误处理封装起来，页面组件只管展示结果）。现在的写法下，页面组件同时承担"发请求、处理业务规则、渲染界面"三件事，任何一件出问题都要在几百行的组件函数里排查。

### 类型定义分裂在两个文件里

`src/types.ts`（410 行）定义了从上传文件、样例分析、结构蓝图到画布块、V2 流水线结果在内的二十多个类型，是一个没有按业务域拆分的平铺列表。与此同时，`src/api/client.ts`（565 行）自己又额外定义了十几个以 `V2` 开头的类型（`V2ScriptSession`、`V2CanvasSession`、`V2CanvasRevalidateResult` 等），这些类型描述的其实也是业务数据结构，理应和 `types.ts` 放在一起，但因为是"跟着接口函数顺手定义的"，就留在了 client.ts 里。结果是同一类"V2 相关类型"要去两个文件里找，没有单一可信来源。

### 没有测试、没有代码规范检查、没有路由/状态管理/请求库

`apps/web/package.json` 里的依赖只有 `react`、`react-dom`、`lucide-react`（图标库）三个运行时依赖，没有 React Router 之类的路由库、没有 Redux/Zustand/Jotai 之类的状态管理库、没有 React Query/SWR 之类的数据请求库；`devDependencies` 里也没有 ESLint 之类的代码规范工具；`src` 目录下没有找到任何 `.test.` 或 `.spec.` 文件，`package.json` 的 `scripts` 里也没有测试命令。这意味着现在项目里所有"页面切换""状态更新""接口调用"的逻辑都是纯手写的，没有工具帮忙约束写法一致性，也没有自动化测试兜底——改代码之后有没有改坏别的页面，只能靠人工点一遍界面来确认。

### 一个 6444 行的全局样式文件

`src/styles.css` 有 6444 行，是唯一的样式文件，没有使用 CSS Modules、CSS-in-JS 或 Tailwind 这类能把样式和组件绑定在一起、避免命名冲突的方案。所有页面的样式都写在同一个全局命名空间里，这意味着如果两个页面不小心用了同名的 class，样式会互相污染；而且这个文件本身太大，很难判断哪些样式规则现在还有页面在用、哪些是已经废弃视图（比如上面提到的 LegacyDemoView）留下的死样式。

### Git 里全部文件显示"modified"，但其实是换行符问题

顺带确认了一下：当前 `git status` 显示几乎所有文件都被修改过，我抽查了 `App.tsx` 的 diff，发现改动是每一行都变了，但内容完全没变——原因是这些文件同时存在 CRLF（Windows 换行）和 LF（Unix 换行）两种换行符，而仓库没有配置统一的换行符规则（`core.autocrlf` 未设置）。这不是代码逻辑问题，但会导致以后任何一次真正的代码改动，在 Git 对比里都会被淹没在大量"假变更"里，看不清楚真正改了什么。建议在正式重构前先用 `.gitattributes` 统一换行符，一次性提交，后面的改动才能看出干净的 diff。

## 这些问题为什么值得现在处理

以上问题目前不影响功能演示，但会直接影响接下来"整体架构重构"这件事本身的风险和成本。文件越大、状态传递层级越多，重构时越容易漏改一处引用；没有测试意味着重构后无法自动验证有没有改坏原有功能，只能靠人工点一遍所有页面；类型和逻辑分裂在多处，意味着重构时必须先梳理清楚"这个类型/这段逻辑真正的来源在哪"，否则容易改了一处、漏了复制的另一处。换句话说，现在这些结构性问题，正是决定下一步重构方案要优先解决什么、以什么顺序解决的依据。

## 重构方向的初步框架（供确认，非最终方案）

这里只列出方向性的思路，具体到"文件夹怎么分、每个 hook 叫什么名字、状态管理用什么方案"这些细节，会放在下一步的重构方案里详细讨论并请你确认。大方向包括：把 `WorkspaceViews.tsx` 按现有的五个页面拆成五个独立文件（每个页面一个文件夹，界面代码和该页面专属的辅助函数放在一起）；把直接写在页面组件里的接口调用和状态管理逻辑，抽成独立的数据请求层（自定义 hook），页面组件只负责展示传进来的数据和触发操作，不直接管理请求细节；把分裂在 `types.ts` 和 `api/client.ts` 里的类型定义合并、按业务域重新分组；清理确认无用的 `InspectorPanel.tsx` 和 `LegacyDemoView`；评估是否需要引入一个更明确的状态管理方式来替代现在"全局状态放在 App.tsx、逐层传递"的做法；样式方面评估是否要拆分成按页面/组件划分的样式文件。`VideoBlockCanvas.tsx`（无限画布）本身保持不动，重构时只需要保证它现在对外暴露的 props 接口（`blocks`、`canvasSession`、`selectedBlockId`、`onUpdateBlock` 等）不被破坏。

## 下一步

这份报告只做诊断，不涉及具体的目标文件结构和分阶段实施步骤。如果诊断内容和你的判断一致，下一步可以在此基础上出一份具体的重构方案（目标目录结构、每一步先改什么后改什么、怎么保证改的过程中界面不崩），确认后再开始动代码。
