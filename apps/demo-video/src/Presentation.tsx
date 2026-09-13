import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  useCurrentFrame,
  staticFile,
  Easing,
} from "remotion";
import { CoffeeAd, type CoffeeAdProps } from "../../web/src/demo/CoffeeAd";
export const presentationScenes = [
  {
    id: "opening",
    from: 0,
    seconds: 8,
    title: "让好结构，长出新故事。",
    caption: "迁镜 ShotSwift · 从参考的叙事结构，到你的产品短片。",
  },
  {
    id: "input",
    from: 8,
    seconds: 10,
    title: "01  从一个明确的目标开始",
    caption: "载入完整示例：朝雾咖啡，一支关于清晨仪式感的新品短片。",
    screen: "input",
  },
  {
    id: "analysis",
    from: 18,
    seconds: 13,
    title: "02  看懂参考为什么这样讲",
    caption: "开场吸引 → 产品露出 → 过程细节 → 使用场景 → 行动引导。",
    screen: "analysis",
  },
  {
    id: "storyboard",
    from: 31,
    seconds: 13,
    title: "03  把结构适配到自己的产品",
    caption: "每个分镜都有意图、画面与字幕，故事的顺序一目了然。",
    screen: "storyboard",
  },
  {
    id: "edited",
    from: 44,
    seconds: 11,
    title: "灵感交给参考，决定留给你。",
    caption: "改一句字幕，把第一镜从 4 秒调到 5 秒；预览与时间线一起更新。",
    screen: "edited",
  },
  {
    id: "materials",
    from: 55,
    seconds: 12,
    title: "04  给缺失的镜头，一个落点",
    caption: "根据镜头意图补齐使用场景；此处使用已生成的演示图片。",
    screen: "materials-before",
  },
  {
    id: "export",
    from: 67,
    seconds: 7,
    title: "05  预览，调整，然后导出",
    caption: "本机合成当前分镜：选中的素材、字幕、时长和顺序都生效。",
    screen: "export",
  },
  {
    id: "result",
    from: 74,
    seconds: 21,
    title: "一段可以带走的产品故事。",
    caption: "成片示例 · 21 秒 · 图片运镜与中文字幕合成 · 无配音",
  },
  {
    id: "closing",
    from: 95,
    seconds: 5,
    title: "迁镜 ShotSwift",
    caption: "看懂结构 · 编辑故事 · 看见结果",
  },
] as const;
const font = '"Microsoft YaHei", "PingFang SC", sans-serif';
function Brand({ small = false }: { small?: boolean }) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: small ? 12 : 20 }}
    >
      <svg width={small ? 34 : 56} height={small ? 38 : 64} viewBox="0 0 40 44">
        <path d="M4 3v38l12-7V10Zm16 9v19l17-10Z" fill="#fe2c55" />
      </svg>
      <span
        style={{ fontSize: small ? 24 : 40, fontWeight: 600, letterSpacing: 1 }}
      >
        迁镜{" "}
        <span
          style={{
            fontSize: small ? 15 : 23,
            fontWeight: 400,
            letterSpacing: 1,
            color: "#bbc1cb",
          }}
        >
          ShotSwift
        </span>
      </span>
    </div>
  );
}
const ease = (frame: number, start = 0, end = 25) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
function ScreenScene({
  scene,
}: {
  scene: (typeof presentationScenes)[number];
}) {
  const frame = useCurrentFrame();
  const enter = ease(frame);
  const activeMaterial = scene.id === "materials" && frame >= 150;
  const screen = "screen" in scene ? scene.screen : "";
  const src = staticFile(
    `demo/screens/${activeMaterial ? "materials-after" : screen}.png`,
  );
  const zoom = interpolate(frame, [0, scene.seconds * 30], [1, 1.025]);
  return (
    <AbsoluteFill
      style={{
        padding: "55px 80px",
        background: "#111214",
        color: "#eeeef3",
        fontFamily: font,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Brand small />
        <span style={{ fontSize: 17, color: "#8d95a3" }}>
          产品演示 / 预制案例
        </span>
      </div>
      <h1
        style={{
          margin: "32px 0 26px",
          fontSize: 43,
          fontWeight: 500,
          letterSpacing: 1,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 18}px)`,
        }}
      >
        {scene.title}
      </h1>
      <div
        style={{
          position: "absolute",
          top: 213,
          left: 80,
          right: 80,
          height: 731,
          background: "#171a20",
          border: "1px solid #3a3e48",
          borderRadius: 13,
          overflow: "hidden",
          boxShadow: "0 24px 80px #0006",
        }}
      >
        <div
          style={{
            height: 30,
            background: "#24272e",
            borderBottom: "1px solid #393d46",
            display: "flex",
            gap: 7,
            alignItems: "center",
            paddingLeft: 15,
          }}
        >
          {["#fe5f6c", "#d7b661", "#6aaf98"].map((c) => (
            <span
              key={c}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: c,
              }}
            />
          ))}
          <span style={{ fontSize: 11, color: "#9aa3b2", marginLeft: 12 }}>
            迁镜 · 本地演示工作台
          </span>
        </div>
        <div style={{ height: 700, position: "relative", overflow: "hidden" }}>
          <Img
            src={src}
            style={{
              display: "block",
              width: scene.id === "edited" ? "72%" : "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "top",
              transform: `scale(${zoom})`,
              transformOrigin: "50% 45%",
              opacity: enter,
            }}
          />
          {scene.id === "edited" ? (
            <div
              style={{
                position: "absolute",
                right: 42,
                top: 100,
                width: 420,
                padding: "28px 28px 34px",
                border: "1px solid #4d3943",
                borderRadius: 9,
                background: "#292127",
                opacity: ease(frame, 25, 55),
                transform: `translateY(${(1 - ease(frame, 25, 55)) * 20}px)`,
              }}
            >
              <div style={{ fontSize: 20, color: "#ff7894", marginBottom: 25 }}>
                第一镜 · 清晨启幕
              </div>
              <div style={{ fontSize: 17, color: "#a7a0ab", marginBottom: 13 }}>
                改一句字幕
              </div>
              <div style={{ fontSize: 32, lineHeight: 1.7, color: "#f2e9ed" }}>
                为自己，
                <br />
                留一杯咖啡。
              </div>
              <div
                style={{ height: 1, background: "#5a434f", margin: "28px 0" }}
              />
              <div style={{ fontSize: 17, color: "#a7a0ab", marginBottom: 16 }}>
                给开场多一点呼吸
              </div>
              <div style={{ fontSize: 40, color: "#f3e9ee" }}>
                4 秒 <span style={{ fontSize: 25, color: "#fe5679" }}>→</span> 5
                秒
              </div>
              <p style={{ fontSize: 18, color: "#bdb1bb", margin: "25px 0 0" }}>
                总时长同步更新为 21 秒
              </p>
            </div>
          ) : null}
          {scene.id === "materials" ? (
            <div
              style={{
                position: "absolute",
                right: 34,
                bottom: 30,
                padding: "14px 23px",
                background: activeMaterial ? "#244436" : "#46391e",
                border: `1px solid ${activeMaterial ? "#79c8a7" : "#d5b368"}`,
                borderRadius: 7,
                fontSize: 22,
                color: activeMaterial ? "#bce9d4" : "#edd6a5",
              }}
            >
              {activeMaterial ? "✓ 场景已补齐" : "△ 1 处素材缺口"}
            </div>
          ) : null}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 46,
          left: 85,
          right: 85,
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <span style={{ width: 4, height: 34, background: "#fe2c55" }} />
        <p
          style={{ margin: 0, fontSize: 25, lineHeight: 1.5, color: "#c4cad5" }}
        >
          {scene.caption}
        </p>
      </div>
    </AbsoluteFill>
  );
}
function Opening() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: "#111214",
        color: "#f6f4ef",
        fontFamily: font,
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 80, left: 95 }}>
        <Brand />
      </div>
      <div
        style={{
          position: "absolute",
          left: 95,
          top: 295,
          width: 810,
          opacity: ease(f),
          transform: `translateY(${(1 - ease(f)) * 35}px)`,
        }}
      >
        <h1
          style={{
            fontSize: 83,
            fontWeight: 500,
            lineHeight: 1.45,
            letterSpacing: 3,
            margin: 0,
          }}
        >
          让好结构，
          <br />
          长出<span style={{ color: "#fe4268" }}>新故事。</span>
        </h1>
        <p
          style={{
            fontSize: 26,
            color: "#a8afbc",
            lineHeight: 1.9,
            marginTop: 30,
          }}
        >
          有喜欢的参考，也有自己的素材。
          <br />
          从哪里开始，才能把它们变成一支片？
        </p>
        <div
          style={{
            marginTop: 55,
            display: "flex",
            gap: 26,
            fontSize: 21,
            color: "#d2d5de",
          }}
        >
          <span>看懂参考</span>
          <span style={{ color: "#fe2c55" }}>→</span>
          <span>编辑分镜</span>
          <span style={{ color: "#fe2c55" }}>→</span>
          <span>交付短片</span>
        </div>
      </div>
      {["morning", "product", "pour"].map((id, i) => (
        <div
          key={id}
          style={{
            position: "absolute",
            width: 350,
            height: 565,
            left: 1000 + i * 110,
            top: 185 + i * 92,
            borderRadius: 12,
            overflow: "hidden",
            transform: `rotate(${[-11, 0, 11][i]}deg) translateY(${(1 - ease(f, 10 + i * 6, 40 + i * 6)) * 80}px)`,
            opacity: ease(f, 10 + i * 6, 40 + i * 6),
            boxShadow: "0 25px 75px #0008",
            border: "1px solid #ffffff25",
          }}
        >
          <Img
            src={staticFile(`demo/${id}.png`)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 95,
          fontSize: 17,
          color: "#858f9f",
          letterSpacing: 2,
        }}
      >
        中文展示版 / 无配音 / 虚构品牌演示案例
      </div>
    </AbsoluteFill>
  );
}
function Result({ ad }: { ad: CoffeeAdProps }) {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{ background: "#111614", fontFamily: font, color: "#f3eee0" }}
    >
      <div style={{ position: "absolute", left: 90, top: 65 }}>
        <Brand small />
      </div>
      <div
        style={{
          position: "absolute",
          left: 95,
          top: 285,
          width: 870,
          opacity: ease(f),
        }}
      >
        <div style={{ fontSize: 21, letterSpacing: 5, color: "#bcb69f" }}>
          朝雾咖啡 · 成片示例
        </div>
        <h1
          style={{
            fontSize: 66,
            fontWeight: 500,
            lineHeight: 1.55,
            letterSpacing: 2,
            margin: "27px 0",
          }}
        >
          一段可以带走的
          <br />
          产品故事。
        </h1>
        <p style={{ fontSize: 25, color: "#b6bbae", lineHeight: 1.9 }}>
          从清晨情境，到产品细节，
          <br />
          再回到属于自己的片刻。
        </p>
        <div
          style={{
            height: 1,
            background: "#41473c",
            width: 590,
            margin: "40px 0 26px",
          }}
        />
        <div
          style={{ display: "flex", gap: 28, fontSize: 19, color: "#bcc2b4" }}
        >
          <span>21 秒</span>
          <span>5 个分镜</span>
          <span>1080 × 1350</span>
        </div>
        <p style={{ fontSize: 17, color: "#919d8c", marginTop: 27 }}>
          AI 示例图片 + 运镜 + 字幕合成，无配音
        </p>
      </div>
      <div
        style={{
          position: "absolute",
          right: 180,
          top: 68,
          width: 720,
          height: 900,
          overflow: "hidden",
          borderRadius: 13,
          boxShadow: "0 20px 90px #0008",
          border: "1px solid #707461",
        }}
      >
        <div
          style={{
            width: 1080,
            height: 1350,
            transform: "scale(0.6666667)",
            transformOrigin: "top left",
          }}
        >
          <CoffeeAd {...ad} />
        </div>
      </div>
      <p
        style={{
          position: "absolute",
          bottom: 42,
          right: 180,
          width: 720,
          textAlign: "center",
          fontSize: 15,
          color: "#949f8f",
        }}
      >
        与演示中的修改版本一致 · 不是实时 AI 视频生成
      </p>
    </AbsoluteFill>
  );
}
function Closing() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: "#111214",
        fontFamily: font,
        color: "#eeeef4",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          opacity: ease(f),
          transform: `translateY(${(1 - ease(f)) * 25}px)`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 42,
          }}
        >
          <Brand />
        </div>
        <h1
          style={{
            fontSize: 72,
            fontWeight: 500,
            letterSpacing: 4,
            margin: "0 0 38px",
          }}
        >
          看懂结构，编辑故事，看见结果。
        </h1>
        <div
          style={{
            width: 75,
            height: 4,
            background: "#fe2c55",
            margin: "0 auto 37px",
          }}
        />
        <p style={{ fontSize: 24, color: "#aab0bd" }}>
          迁镜 · 样例驱动的视频结构迁移工作台
        </p>
        <p style={{ fontSize: 17, color: "#828a99", marginTop: 85 }}>
          演示分析与补全为预制案例 · 编辑、预览与本地导出真实可用
        </p>
      </div>
    </AbsoluteFill>
  );
}
export function Presentation({ ad }: { ad: CoffeeAdProps }) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#111214" }}>
      {presentationScenes.map((scene) => (
        <Sequence
          key={scene.id}
          from={scene.from * 30}
          durationInFrames={scene.seconds * 30}
        >
          {scene.id === "opening" ? (
            <Opening />
          ) : scene.id === "closing" ? (
            <Closing />
          ) : scene.id === "result" ? (
            <Result ad={ad} />
          ) : (
            <ScreenScene scene={scene} />
          )}
        </Sequence>
      ))}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          height: 3,
          width: `${(frame / 3000) * 100}%`,
          background: "#fe2c55",
        }}
      />
    </AbsoluteFill>
  );
}
