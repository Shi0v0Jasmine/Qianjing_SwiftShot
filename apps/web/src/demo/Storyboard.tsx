import type { Project, Shot } from "./model";
import { assetUrl, totalSeconds } from "./model";
import { Icon } from "./Icons";
export function Storyboard({
  project,
  onSelect,
  onPatch,
  onMove,
  onPick,
  onPreview,
  onNext,
  onBack,
  canUndo,
  onUndo,
}: {
  project: Project;
  onSelect: (id: string) => void;
  onPatch: (patch: Partial<Shot>) => void;
  onMove: (id: string, to: number) => void;
  onPick: () => void;
  onPreview: () => void;
  onNext: () => void;
  onBack: () => void;
  canUndo: boolean;
  onUndo: () => void;
}) {
  const selected =
    project.shots.find((s) => s.id === project.selected) ?? project.shots[0];
  const index = project.shots.indexOf(selected);
  const total = totalSeconds(project.shots);
  let accumulated = 0;
  return (
    <>
      <div className="ds-editor-grid">
        <section className="ds-board">
          <div className="ds-structure-strip">
            {project.shots.map((s) => (
              <span key={s.id}>{s.role}</span>
            ))}
          </div>
          <div className="ds-board-meta">
            <span>拖动卡片调整顺序，也可使用右侧上下移按钮</span>
            <span>
              总时长 <b>{total} 秒</b>
            </span>
          </div>
          <div className="ds-shots">
            {project.shots.map((s, i) => (
              <button
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", s.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/plain");
                  if (project.shots.some((x) => x.id === id)) onMove(id, i);
                }}
                onClick={() => onSelect(s.id)}
                aria-pressed={s.id === selected.id}
                aria-label={`选择分镜 ${i + 1} ${s.title}`}
                className={`ds-shot ${s.id === selected.id ? "selected" : ""} ${s.asset ? "" : "missing"}`}
                key={s.id}
              >
                <div className="ds-shot-title">
                  <b>{String(i + 1).padStart(2, "0")}</b>
                  <strong>{s.title}</strong>
                  <span>{s.duration}s</span>
                </div>
                <div className="ds-shot-image">
                  <img
                    src={assetUrl(s.asset ?? "scene")}
                    alt={s.asset ? s.title : "待补全镜头的构图示意"}
                  />
                  {!s.asset ? (
                    <span className="ds-missing-label">
                      △ 缺少素材 · 构图示意
                    </span>
                  ) : null}
                </div>
                <p>{s.caption}</p>
              </button>
            ))}
          </div>
          <div className="ds-timeline">
            <div className="ds-timeline-tools">
              <button
                className="ds-icon-button"
                aria-label="播放分镜预览"
                onClick={onPreview}
              >
                <Icon name="play" />
              </button>
              <span>00:00 / 00:{String(total).padStart(2, "0")}</span>
              <span className="ds-timeline-right">字幕与时长可编辑</span>
            </div>
            <div className="ds-ruler">
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((v) => (
                <span key={v}>{+(total * v).toFixed(1)}s</span>
              ))}
            </div>
            <div className="ds-tracks">
              {project.shots.map((s, i) => {
                const start = accumulated;
                accumulated += s.duration;
                return (
                  <button
                    key={s.id}
                    className={s.id === selected.id ? "selected" : ""}
                    style={{ flex: s.duration }}
                    onClick={() => onSelect(s.id)}
                    aria-label={`时间线分镜 ${i + 1}，${start} 秒开始`}
                  >
                    <img src={assetUrl(s.asset ?? "scene")} alt="" />
                    <span>
                      <strong>
                        {String(i + 1).padStart(2, "0")} {s.title}
                      </strong>
                      <small>{s.duration} 秒</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
        <aside className="ds-inspector">
          <div className="ds-inspector-heading">
            <h2>选中分镜 {String(index + 1).padStart(2, "0")}</h2>
            <button
              className="ds-icon-button"
              aria-label="撤销上次修改"
              disabled={!canUndo}
              onClick={onUndo}
            >
              <Icon name="reset" size={17} />
            </button>
          </div>
          <div className="ds-inspector-body">
            <label>
              分镜意图<div className="ds-readonly">{selected.intent}</div>
            </label>
            <label>
              字幕文案
              <textarea
                key={selected.id}
                maxLength={80}
                rows={4}
                value={selected.caption}
                onChange={(e) => onPatch({ caption: e.target.value })}
              />
              <small>{selected.caption.length} / 80 字</small>
            </label>
            <label>
              时长
              <div className="ds-duration">
                <input
                  aria-label="分镜时长"
                  type="number"
                  min={2}
                  max={8}
                  step={0.5}
                  value={selected.duration}
                  onChange={(e) => {
                    const value = e.target.valueAsNumber;
                    if (Number.isFinite(value) && value >= 2 && value <= 8)
                      onPatch({ duration: Math.round(value * 2) / 2 });
                  }}
                />
                <span>秒</span>
              </div>
              <small>每镜 2–8 秒，可按 0.5 秒调整</small>
            </label>
            <label>
              已分配素材
              {selected.asset ? (
                <div className="ds-assigned">
                  <img src={assetUrl(selected.asset)} alt="当前分镜素材" />
                  <button className="ds-secondary" onClick={onPick}>
                    更换素材
                  </button>
                </div>
              ) : (
                <button className="ds-gap-pick" onClick={onPick}>
                  △ 选择素材补全
                </button>
              )}
            </label>
            <div className="ds-order">
              <button
                className="ds-secondary"
                disabled={index === 0}
                onClick={() => onMove(selected.id, index - 1)}
              >
                <Icon name="up" size={16} />
                上移
              </button>
              <button
                className="ds-secondary"
                disabled={index === project.shots.length - 1}
                onClick={() => onMove(selected.id, index + 1)}
              >
                <Icon name="down" size={16} />
                下移
              </button>
            </div>
            <p className="ds-fine">预制演示素材 · 修改会同步到动态预览</p>
          </div>
        </aside>
      </div>
      <footer className="ds-footer">
        <button className="ds-secondary" onClick={onBack}>
          <Icon name="back" />
          返回解析
        </button>
        <button className="ds-primary" onClick={onNext}>
          确认分镜，匹配素材 <Icon name="arrow" />
        </button>
      </footer>
    </>
  );
}
