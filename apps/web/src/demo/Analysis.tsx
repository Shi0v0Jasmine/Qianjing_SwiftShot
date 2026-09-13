import { assetUrl, initialProject, type Project } from "./model";
import { Icon } from "./Icons";
const reasons = [
  "先让观众认出自己的生活情境，再引入产品。",
  "让产品承接前一个镜头的需求，而不是突然出现。",
  "给观众看具体过程，让表达落在可见的细节上。",
  "展示使用后的情绪与情境，为节奏留一点空白。",
  "用清晰、轻量的下一步收束故事。",
];
export function Analysis({
  project,
  onNext,
}: {
  project: Project;
  onNext: () => void;
}) {
  return (
    <div className="ds-analysis">
      <div className="ds-analysis-top">
        <div>
          <h2>迁移表达方法，保留你的产品。</h2>
          <p>
            参考结构示意 · 以下拆解为预制案例，不是对当前上传视频的实时分析。
          </p>
        </div>
        <button className="ds-primary" onClick={onNext}>
          查看迁移分镜 <Icon name="arrow" />
        </button>
      </div>
      <div className="ds-analysis-rows">
        <div className="ds-analysis-labels">
          <span>参考的叙事结构</span>
          <span>为什么这样安排</span>
          <span>迁移到朝雾咖啡</span>
        </div>
        {initialProject.shots
          .map(
            (reference) =>
              project.shots.find((shot) => shot.id === reference.id) ??
              reference,
          )
          .map((s, i) => (
            <div className="ds-analysis-row" key={s.id}>
              <div className="ds-role">
                <b>{String(i + 1).padStart(2, "0")}</b>
                <div>
                  <strong>{s.role}</strong>
                  <span>
                    {i * 4}–{i * 4 + 4} 秒 · 参考顺序
                  </span>
                </div>
              </div>
              <p>{reasons[Number(s.id.slice(1)) - 1]}</p>
              <div className="ds-adaptation">
                <img
                  src={assetUrl(s.asset ?? "scene")}
                  alt="迁移后的镜头示意"
                />
                <div>
                  <strong>{s.title}</strong>
                  <span>{s.caption}</span>
                </div>
                <Icon name="arrow" />
              </div>
            </div>
          ))}
      </div>
      <div className="ds-explainer">
        <span className="ds-accent-line" />
        <div>
          <strong>相同的说服顺序，不同的产品故事</strong>
          <p>
            借鉴开场、信息顺序和节奏，不复刻参考中的品牌、人物或具体台词。下一步可调整每个分镜的字幕、时长和素材。
          </p>
        </div>
      </div>
    </div>
  );
}
