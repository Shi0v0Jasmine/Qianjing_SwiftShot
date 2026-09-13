export const steps = [
  "项目输入",
  "样例解析",
  "分镜编辑",
  "素材补全",
  "预览导出",
] as const;
export type AssetId = "morning" | "product" | "pour" | "scene";
export type Shot = {
  id: string;
  role: string;
  title: string;
  intent: string;
  caption: string;
  duration: number;
  asset: AssetId | null;
};
export type Project = {
  version: 1;
  name: string;
  brief: string;
  audience: string;
  step: number;
  selected: string;
  shots: Shot[];
};
export const assets: { id: AssetId; title: string; detail: string }[] = [
  { id: "morning", title: "清晨的一杯", detail: "情境 · 静物" },
  { id: "product", title: "朝雾咖啡包装", detail: "产品 · 特写" },
  { id: "pour", title: "咖啡倾注", detail: "过程 · 细节" },
  { id: "scene", title: "窗边的片刻", detail: "场景 · 预制补全" },
];
export const initialProject: Project = {
  version: 1,
  name: "朝雾咖啡 · 新品短片",
  brief:
    "为朝雾咖啡制作一支温暖、克制的新品短片。沿用参考的叙事顺序，突出清晨仪式感，让观众想为自己冲一杯。",
  audience: "喜欢咖啡、希望留一点时间给自己的年轻上班族",
  step: 0,
  selected: "s1",
  shots: [
    {
      id: "s1",
      role: "Hook",
      title: "清晨启幕",
      intent: "用熟悉的清晨情境建立共鸣，让观众愿意继续看。",
      caption: "今天，从一杯好咖啡开始。",
      duration: 4,
      asset: "morning",
    },
    {
      id: "s2",
      role: "产品露出",
      title: "产品登场",
      intent: "从生活情境自然过渡到产品，让观众记住朝雾。",
      caption: "朝雾咖啡，把清晨留给自己。",
      duration: 4,
      asset: "product",
    },
    {
      id: "s3",
      role: "过程证明",
      title: "看见细节",
      intent: "用冲泡过程承接产品信息，让画面有具体细节。",
      caption: "慢慢注入，等香气醒来。",
      duration: 4,
      asset: "pour",
    },
    {
      id: "s4",
      role: "使用场景",
      title: "片刻留白",
      intent: "呈现产品进入日常生活的场景，给情绪一个落点。",
      caption: "再忙，也留一刻给自己。",
      duration: 4,
      asset: null,
    },
    {
      id: "s5",
      role: "行动引导",
      title: "记住朝雾",
      intent: "以品牌和轻量行动建议收束，避免突兀的强推销。",
      caption: "明天的第一杯，试试朝雾。",
      duration: 4,
      asset: "product",
    },
  ],
};
export const cloneProject = (): Project => structuredClone(initialProject);
export const completeProject = (): Project => ({
  ...cloneProject(),
  step: 4,
  shots: initialProject.shots.map((s) => ({ ...s, asset: s.asset ?? "scene" })),
});
export const totalSeconds = (shots: Shot[]) =>
  shots.reduce((sum, s) => sum + s.duration, 0);
export const assetUrl = (id: AssetId) => `/demo/${id}.png`;
export const projectSignature = (p: Project) =>
  JSON.stringify({ name: p.name, shots: p.shots });
export function parseProject(text: string): Project | null {
  try {
    const raw = JSON.parse(text);
    if (
      raw?.version !== 1 ||
      typeof raw.name !== "string" ||
      typeof raw.brief !== "string" ||
      typeof raw.audience !== "string" ||
      !Number.isInteger(raw.step) ||
      raw.step < 0 ||
      raw.step > 4 ||
      !Array.isArray(raw.shots) ||
      raw.shots.length !== 5
    )
      return null;
    if (new Set(raw.shots.map((s: Shot) => s.id)).size !== 5) return null;
    if (
      !raw.shots.every(
        (s: Shot) =>
          initialProject.shots.some((x) => x.id === s.id) &&
          typeof s.caption === "string" &&
          s.caption.length <= 80 &&
          typeof s.title === "string" &&
          typeof s.role === "string" &&
          typeof s.intent === "string" &&
          Number.isFinite(s.duration) &&
          Number.isInteger(s.duration * 2) &&
          s.duration >= 2 &&
          s.duration <= 8 &&
          (s.asset === null || assets.some((a) => a.id === s.asset)),
      )
    )
      return null;
    return {
      ...raw,
      name: raw.name.slice(0, 40),
      brief: raw.brief.slice(0, 400),
      audience: raw.audience.slice(0, 120),
      selected: raw.shots.some((s: Shot) => s.id === raw.selected)
        ? raw.selected
        : "s1",
    };
  } catch {
    return null;
  }
}
export function readProject(): Project {
  try {
    return (
      parseProject(localStorage.getItem("shotswift-demo-v1") ?? "null") ??
      cloneProject()
    );
  } catch {
    return cloneProject();
  }
}
