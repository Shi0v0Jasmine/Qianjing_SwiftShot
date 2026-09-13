import { assetUrl, type Project, type AssetId } from "./model";
import { Icon } from "./Icons";
export function Materials({
  project,
  onPick,
  onFill,
  onNext,
}: {
  project: Project;
  onPick: (id: string) => void;
  onFill: (id: string, asset: AssetId) => void;
  onNext: () => void;
}) {
  const gaps = project.shots.filter((s) => !s.asset);
  return (
    <div className="ds-materials">
      <div className="ds-material-summary">
        <div>
          <h2>
            {gaps.length
              ? `${gaps.length} 个分镜，需要一个画面。`
              : "每个分镜，都有了自己的画面。"}
          </h2>
          <p>
            {gaps.length
              ? "先确认镜头意图，再选择能讲清这件事的素材。"
              : "可以继续替换素材，或进入预览检查整体节奏。"}
          </p>
        </div>
        <span
          className={gaps.length ? "ds-status warning" : "ds-status success"}
        >
          {gaps.length ? `△ ${gaps.length} 处待补全` : "✓ 素材已齐全"}
        </span>
      </div>
      <div className="ds-material-list">
        {project.shots.map((s, i) => (
          <div
            key={s.id}
            className={`ds-material-row ${!s.asset ? "is-gap" : ""}`}
          >
            <span className="ds-number">{String(i + 1).padStart(2, "0")}</span>
            <img
              src={assetUrl(s.asset ?? "scene")}
              alt={s.asset ? s.title : "补全候选构图"}
            />
            <div className="ds-material-description">
              <strong>
                {s.title}
                <span>{s.role}</span>
              </strong>
              <p>{s.intent}</p>
              <small>
                {s.asset
                  ? "预制示例图片 · 可更换"
                  : "缺口：需要咖啡融入日常的场景镜头"}
              </small>
            </div>
            <div className="ds-material-actions">
              {s.asset ? (
                <>
                  <span className="ds-status success">✓ 已匹配</span>
                  <button className="ds-secondary" onClick={() => onPick(s.id)}>
                    更换素材
                  </button>
                </>
              ) : (
                <>
                  <span className="ds-status warning">△ 缺少素材</span>
                  <button
                    className="ds-primary"
                    onClick={() => onFill(s.id, "scene")}
                  >
                    <Icon name="spark" size={16} />
                    使用预制补全
                  </button>
                  <button className="ds-text-link" onClick={() => onPick(s.id)}>
                    从素材库选择
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="ds-explainer">
        <Icon name="spark" />
        <div>
          <strong>让补全有依据</strong>
          <p>
            示例提示词：清晨窗边的咖啡与笔记本，温暖自然光，安静的生活感，与前后镜头的色调一致。此处直接使用已生成的示例图片，不调用实时生成服务。
          </p>
        </div>
      </div>
      <footer className="ds-footer">
        <p>
          {gaps.length
            ? "补齐所有镜头后即可导出。"
            : "分镜字幕、时长、顺序与选中素材将用于当前版本导出。"}
        </p>
        <button
          className="ds-primary"
          onClick={onNext}
          disabled={gaps.length > 0}
        >
          预览完整短片 <Icon name="arrow" />
        </button>
      </footer>
    </div>
  );
}
