import type { Project } from "./model";
import { assetUrl } from "./model";
import { Icon } from "./Icons";
export function ProjectInput({
  project,
  onChange,
  onStart,
}: {
  project: Project;
  onChange: (p: Partial<Project>) => void;
  onStart: () => void;
}) {
  return (
    <div className="ds-input-layout">
      <section className="ds-brief">
        <h2>一个参考，一段新的故事。</h2>
        <p className="ds-lead">
          从叙事结构出发，把零散素材变成可编辑的产品短片。
        </p>
        <label>
          项目名称
          <input
            value={project.name}
            maxLength={40}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </label>
        <label>
          想传达什么？
          <textarea
            rows={4}
            maxLength={400}
            value={project.brief}
            onChange={(e) => onChange({ brief: e.target.value })}
          />
        </label>
        <label>
          给谁看？
          <input
            value={project.audience}
            maxLength={120}
            onChange={(e) => onChange({ audience: e.target.value })}
          />
        </label>
        <button
          className="ds-primary"
          onClick={onStart}
          disabled={!project.name.trim() || !project.brief.trim()}
        >
          打开完整示例 <Icon name="arrow" />
        </button>
        <p className="ds-fine">
          示例分析与素材已准备好，无需配置
          API。当前输入用于项目记录；分析采用固定案例。
        </p>
        <a className="ds-text-link" href="?mode=live">
          使用自己的视频？进入原版工作流 <span>↗</span>
        </a>
      </section>
      <section className="ds-case">
        <img
          className="ds-case-hero"
          src={assetUrl("morning")}
          alt="阳光下的咖啡与笔记本"
        />
        <div className="ds-case-caption">
          <span>本次演示案例</span>
          <h3>朝雾咖啡</h3>
          <p>把清晨留给自己。</p>
        </div>
        <div className="ds-case-bottom">
          <span>5 个分镜</span>
          <span>20 秒初稿</span>
          <span>1 处素材缺口</span>
        </div>
      </section>
      <div className="ds-provenance">
        <Icon name="file" />
        <span>
          虚构品牌 · AI 生成示例图片 · 结构分析为预制教学案例 · 本机保存
        </span>
      </div>
    </div>
  );
}
