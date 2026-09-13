import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  useRemotionEnvironment,
} from "remotion";
import type { Shot, AssetId } from "./model";
export type CoffeeAdProps = {
  shots: Shot[];
  name: string;
  imageSources: Record<AssetId, string>;
};
function ShotFrame({
  shot,
  src,
  index,
}: {
  shot: Shot;
  src: string | null;
  index: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = Math.round(shot.duration * fps);
  const { isRendering } = useRemotionEnvironment();
  const ImageElement = isRendering ? Img : "img";
  const opacity = interpolate(
    frame,
    [0, 12, length - 10, length],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const scale = interpolate(frame, [0, length], [1.03, 1.12]);
  const rise = interpolate(frame, [8, 25], [22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        background: "#111614",
        opacity,
        color: "#fff",
        fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
      }}
    >
      {src ? (
        <ImageElement
          src={src}
          alt={shot.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale})`,
          }}
        />
      ) : (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            fontSize: 38,
            color: "#e6b660",
          }}
        >
          此分镜待补全
        </AbsoluteFill>
      )}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg,rgba(8,15,11,.22),transparent 45%,rgba(8,15,11,.78))",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 60,
          fontSize: 28,
          letterSpacing: 8,
        }}
      >
        朝雾{" "}
        <span style={{ fontSize: 16, letterSpacing: 4, marginLeft: 12 }}>
          CHAO WU
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 60,
          right: 60,
          transform: `translateY(${rise}px)`,
        }}
      >
        <div
          style={{
            fontSize: 17,
            letterSpacing: 5,
            marginBottom: 24,
            color: "#e3e5d4",
          }}
        >
          把 清 晨 留 给 自 己
        </div>
        <div
          style={{
            fontSize: 52,
            lineHeight: 1.55,
            fontWeight: 500,
            textWrap: "balance",
            overflowWrap: "anywhere",
          }}
        >
          {shot.caption}
        </div>
        <div
          style={{ marginTop: 30, width: 64, height: 3, background: "#e7ddc5" }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 35,
          right: 55,
          fontSize: 17,
          letterSpacing: 3,
          color: "#e1ded4",
        }}
      >
        0{index + 1} / 05
      </div>
    </AbsoluteFill>
  );
}
export function CoffeeAd({ shots, imageSources }: CoffeeAdProps) {
  const { fps } = useVideoConfig();
  let from = 0;
  return (
    <AbsoluteFill style={{ background: "#111614" }}>
      {shots.map((shot, index) => {
        const start = from;
        const duration = Math.round(shot.duration * fps);
        from += duration;
        return (
          <Sequence key={shot.id} from={start} durationInFrames={duration}>
            <ShotFrame
              shot={shot}
              index={index}
              src={shot.asset ? imageSources[shot.asset] : null}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
