import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  assets,
  assetUrl,
  cloneProject,
  readProject,
  parseProject,
  steps,
  totalSeconds,
  projectSignature,
  type Project,
  type Shot,
  type AssetId,
} from "./model";
import { Icon } from "./Icons";
import { ProjectInput } from "./ProjectInput";
import { Analysis } from "./Analysis";
import { Storyboard } from "./Storyboard";
import { Materials } from "./Materials";
import "./demo.css";
const Preview = lazy(() => import("./Preview"));
const subtitles = [
  "从一个明确的创作目标开始。",
  "看懂参考的顺序，再写自己的故事。",
  "把参考的叙事结构，变成你的产品故事。",
  "让每个镜头，都有合适的画面。",
  "看一遍，调一遍，再交付。",
];
type ExportJob = {
  id: string;
  state: "rendering" | "complete" | "error";
  progress: number;
  url?: string;
  error?: string;
  signature: string;
};
function saveFile(data: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function DemoApp() {
  const [project, setProject] = useState(readProject);
  const [history, setHistory] = useState<Shot[][]>([]);
  const [toast, setToast] = useState("");
  const [saveStatus, setSaveStatus] = useState("已保存到本机");
  const [modal, setModal] = useState<"assets" | "preview" | "reset" | null>(
    null,
  );
  const [job, setJob] = useState<ExportJob | null>(null);
  const [exportError, setExportError] = useState("");
  const [starting, setStarting] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const currentSignature = projectSignature(project);
  const gaps = project.shots.filter((s) => !s.asset).length;
  useEffect(() => {
    try {
      localStorage.setItem("shotswift-demo-v1", JSON.stringify(project));
      setSaveStatus("已保存到本机");
    } catch {
      setSaveStatus("本机存储不可用，请下载项目备份");
    }
  }, [project]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (modal && !dialog?.open) dialog?.showModal();
    else if (!modal && dialog?.open) dialog?.close();
  }, [modal]);
  useEffect(() => {
    if (!job || job.state !== "rendering") return;
    let cancelled = false;
    const controller = new AbortController();
    const poll = async () => {
      try {
        const res = await fetch(`/demo-api/jobs/${job.id}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw Error("无法获取导出状态");
        const result = await res.json();
        if (!cancelled)
          setJob((prev) => (prev ? { ...prev, ...result } : null));
      } catch (e) {
        if (!cancelled)
          setJob((prev) =>
            prev
              ? {
                  ...prev,
                  state: "error",
                  error: e instanceof Error ? e.message : "导出服务连接中断",
                }
              : null,
          );
      }
    };
    const timer = setInterval(poll, 1500);
    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(timer);
    };
  }, [job?.id, job?.state]);
  const go = (step: number) => {
    setProject((p) => ({ ...p, step }));
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const editShots = (fn: (s: Shot[]) => Shot[]) => {
    setHistory((h) => [...h.slice(-19), structuredClone(project.shots)]);
    setProject((p) => ({ ...p, shots: fn(p.shots) }));
  };
  const patch = (part: Partial<Shot>) =>
    editShots((shots) =>
      shots.map((s) => (s.id === project.selected ? { ...s, ...part } : s)),
    );
  const move = (id: string, to: number) => {
    editShots((shots) => {
      const list = [...shots];
      const index = list.findIndex((s) => s.id === id);
      if (index < 0 || to < 0 || to >= list.length) return shots;
      const [shot] = list.splice(index, 1);
      list.splice(to, 0, shot);
      return list;
    });
    setToast("分镜顺序已更新");
  };
  const fill = (id: string, asset: AssetId) => {
    editShots((shots) => shots.map((s) => (s.id === id ? { ...s, asset } : s)));
    setToast("已使用预制素材，动态预览已更新");
  };
  const pick = (id: string) => {
    setProject((p) => ({ ...p, selected: id }));
    setModal("assets");
  };
  const startExport = async () => {
    setStarting(true);
    setExportError("");
    try {
      const response = await fetch("/demo-api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: project.name, shots: project.shots }),
      });
      const data = await response
        .json()
        .catch(() => ({
          error: "导出服务未启动，请使用项目根目录的「启动演示.cmd」。",
        }));
      if (!response.ok) throw Error(data.error ?? "导出未能启动");
      setJob({ ...data, signature: currentSignature });
    } catch (e) {
      setExportError(
        e instanceof Error
          ? e.message
          : "无法连接导出服务，请使用「启动演示.cmd」。",
      );
    } finally {
      setStarting(false);
    }
  };
  const exportBusy = starting || job?.state === "rendering";
  return (
    <div className="ds-app">
      <a className="ds-skip" href="#ds-main">
        跳到主要内容
      </a>
      <aside className="ds-sidebar">
        <button
          className="ds-brand"
          onClick={() => go(0)}
          aria-label="迁镜首页"
        >
          <span className="ds-brand-mark">
            <svg viewBox="0 0 40 44" aria-hidden="true">
              <path d="M4 3v38l12-7V10Zm16 9v19l17-10Z" fill="currentColor" />
            </svg>
          </span>
          <span>
            迁镜<small>ShotSwift</small>
          </span>
        </button>
        <div className="ds-project-name">
          <small>当前项目</small>
          <strong>{project.name || "未命名项目"}</strong>
        </div>
        <nav aria-label="创作流程">
          {steps.map((step, i) => (
            <button
              key={step}
              aria-current={project.step === i ? "step" : undefined}
              className={project.step === i ? "active" : ""}
              onClick={() => go(i)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              {step}
            </button>
          ))}
        </nav>
        <div className="ds-sidebar-bottom">
          <span>
            <i /> 演示项目
          </span>
          <button onClick={() => setModal("reset")}>
            <Icon name="reset" size={16} />
            重置示例
          </button>
          <button onClick={() => importRef.current?.click()}>
            <Icon name="file" size={16} />
            恢复项目备份
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".json,application/json"
            hidden
            aria-label="恢复项目备份文件"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              if (file.size > 50000) {
                setToast("备份文件过大，请选择迁镜项目 JSON。");
                return;
              }
              const restored = parseProject(await file.text());
              if (!restored) {
                setToast("无法读取项目，请选择有效的迁镜 JSON 备份。");
                return;
              }
              setProject(restored);
              setHistory([]);
              setToast("项目备份已恢复");
            }}
          />
          <a href="?mode=live">原版工作流 ↗</a>
        </div>
      </aside>
      <main id="ds-main" className="ds-main">
        <header className="ds-header">
          <div>
            <h1>{steps[project.step]}</h1>
            <p>{subtitles[project.step]}</p>
          </div>
          <div className="ds-header-actions">
            <span className="ds-saved">
              <Icon name="check" size={15} />
              {saveStatus}
            </span>
            {project.step > 0 ? (
              <button
                className="ds-primary"
                onClick={() => setModal("preview")}
              >
                <Icon name="play" size={17} />
                预览短片
              </button>
            ) : null}
          </div>
        </header>
        {project.step === 0 ? (
          <ProjectInput
            project={project}
            onChange={(part) => setProject((p) => ({ ...p, ...part }))}
            onStart={() => go(1)}
          />
        ) : null}
        {project.step === 1 ? (
          <Analysis project={project} onNext={() => go(2)} />
        ) : null}
        {project.step === 2 ? (
          <Storyboard
            project={project}
            onSelect={(selected) => setProject((p) => ({ ...p, selected }))}
            onPatch={patch}
            onMove={move}
            onPick={() => pick(project.selected)}
            onPreview={() => setModal("preview")}
            onNext={() => go(3)}
            onBack={() => go(1)}
            canUndo={history.length > 0}
            onUndo={() => {
              const prior = history[history.length - 1];
              if (prior) {
                setProject((p) => ({ ...p, shots: prior }));
                setHistory((h) => h.slice(0, -1));
                setToast("已撤销上次修改");
              }
            }}
          />
        ) : null}
        {project.step === 3 ? (
          <Materials
            project={project}
            onFill={fill}
            onPick={pick}
            onNext={() => go(4)}
          />
        ) : null}
        {project.step === 4 ? (
          <div className="ds-export">
            <section className="ds-preview-stage">
              <div className="ds-preview-player">
                <Suspense
                  fallback={<div className="ds-loading">正在加载预览…</div>}
                >
                  <Preview project={project} />
                </Suspense>
              </div>
              <span className="ds-fine">
                动态预览 · 图片运镜与字幕合成 · 无配音
              </span>
            </section>
            <section className="ds-export-panel">
              <span className="ds-export-kicker">你的故事，已经有了形状。</span>
              <h2>{project.name}</h2>
              <p>从参考的表达顺序，到属于你的产品短片。</p>
              <dl>
                <div>
                  <dt>总时长</dt>
                  <dd>{totalSeconds(project.shots)} 秒</dd>
                </div>
                <div>
                  <dt>画面</dt>
                  <dd>1080 × 1350 · 4:5</dd>
                </div>
                <div>
                  <dt>格式</dt>
                  <dd>MP4 · 30 fps · 无音轨</dd>
                </div>
                <div>
                  <dt>素材</dt>
                  <dd>{5 - gaps} / 5 已分配</dd>
                </div>
              </dl>
              {gaps ? (
                <div className="ds-notice">
                  还有 {gaps} 处素材缺口。
                  <button className="ds-text-link" onClick={() => go(3)}>
                    前往补全 →
                  </button>
                </div>
              ) : null}
              <button
                className="ds-primary ds-full"
                disabled={gaps > 0 || exportBusy}
                onClick={startExport}
              >
                <Icon name="download" />
                {starting
                  ? "正在连接导出服务…"
                  : job?.state === "rendering"
                    ? `正在导出 ${Math.round(job.progress * 100)}%`
                    : "导出当前版本 MP4"}
              </button>
              {job?.state === "rendering" ? (
                <>
                  <progress
                    aria-label="导出进度"
                    value={job.progress}
                    max={1}
                  />
                  <p className="ds-fine">
                    本机正在合成。可以继续浏览，当前导出使用点击时的版本。
                  </p>
                </>
              ) : null}
              {job?.state === "complete" && job.url ? (
                <div className="ds-export-success">
                  <strong>✓ 视频已生成</strong>
                  <p>
                    {job.signature === currentSignature
                      ? "与当前分镜版本一致。"
                      : "这是上次导出的版本；分镜已修改，请重新导出。"}
                  </p>
                  <a
                    className="ds-secondary"
                    href={job.url}
                    download={`${project.name || "shotswift"}.mp4`}
                  >
                    <Icon name="download" size={17} />
                    下载
                    {job.signature === currentSignature ? "视频" : "上次版本"}
                  </a>
                </div>
              ) : null}
              {exportError || job?.state === "error" ? (
                <div className="ds-error" role="alert">
                  {exportError || job?.error || "导出失败，可重试。"}
                </div>
              ) : null}
              <div className="ds-export-secondary">
                <button className="ds-secondary" onClick={() => go(2)}>
                  继续编辑
                </button>
                <button
                  className="ds-secondary"
                  onClick={() =>
                    saveFile(
                      JSON.stringify(project, null, 2),
                      "shotswift-project.json",
                      "application/json",
                    )
                  }
                >
                  下载项目备份
                </button>
              </div>
              <p className="ds-fine">
                演示素材由 AI
                预先生成；分析采用固定案例。字幕、时长、镜头顺序与素材选择会真实影响预览和导出。
              </p>
            </section>
          </div>
        ) : null}
      </main>
      <div className={`ds-toast ${toast ? "visible" : ""}`} role="status">
        {toast}
      </div>
      <dialog
        ref={dialogRef}
        className={`ds-dialog ${modal === "preview" ? "ds-preview-dialog" : ""}`}
        onCancel={() => setModal(null)}
        onClose={() => setModal(null)}
      >
        <div className="ds-dialog-heading">
          <h2>
            {modal === "assets"
              ? "为这个镜头选择画面"
              : modal === "preview"
                ? "当前分镜预览"
                : "重置演示项目"}
          </h2>
          <button
            className="ds-icon-button"
            onClick={() => setModal(null)}
            aria-label="关闭弹窗"
          >
            <Icon name="close" />
          </button>
        </div>
        {modal === "assets" ? (
          <>
            <p>预制示例图片 · 选择后会立即应用到当前分镜</p>
            <div className="ds-asset-grid">
              {assets.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    fill(project.selected, a.id);
                    setModal(null);
                  }}
                >
                  <img src={assetUrl(a.id)} alt={a.title} />
                  <strong>{a.title}</strong>
                  <small>{a.detail}</small>
                </button>
              ))}
            </div>
          </>
        ) : modal === "preview" ? (
          <>
            <div className="ds-modal-player">
              <Suspense
                fallback={<div className="ds-loading">正在加载预览…</div>}
              >
                <Preview project={project} />
              </Suspense>
            </div>
            <p>
              {gaps
                ? `还有 ${gaps} 处缺口，预览中会显示待补全提示。`
                : "字幕、顺序和时长均来自当前分镜。"}{" "}
              无配音。
            </p>
          </>
        ) : modal === "reset" ? (
          <>
            <p>项目将恢复初始案例，当前编辑会被替换。可以先下载项目备份。</p>
            <div className="ds-dialog-buttons">
              <button
                className="ds-secondary"
                onClick={() =>
                  saveFile(
                    JSON.stringify(project, null, 2),
                    "shotswift-project.json",
                    "application/json",
                  )
                }
              >
                下载备份
              </button>
              <button className="ds-secondary" onClick={() => setModal(null)}>
                继续编辑
              </button>
              <button
                className="ds-primary"
                onClick={() => {
                  setProject(cloneProject());
                  setHistory([]);
                  setModal(null);
                  setToast("示例已重置");
                }}
              >
                重置示例
              </button>
            </div>
          </>
        ) : null}
      </dialog>
    </div>
  );
}
