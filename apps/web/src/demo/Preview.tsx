import { Player } from "@remotion/player";
import { CoffeeAd } from "./CoffeeAd";
import { assetUrl, totalSeconds, type Project } from "./model";
export default function Preview({ project }: { project: Project }) {
  return (
    <Player
      component={CoffeeAd}
      inputProps={{
        shots: project.shots,
        name: project.name,
        imageSources: {
          morning: assetUrl("morning"),
          product: assetUrl("product"),
          pour: assetUrl("pour"),
          scene: assetUrl("scene"),
        },
      }}
      durationInFrames={Math.round(totalSeconds(project.shots) * 30)}
      initialFrame={20}
      fps={30}
      compositionWidth={1080}
      compositionHeight={1350}
      controls
      loop
      showVolumeControls={false}
      style={{ width: "100%", aspectRatio: "4/5", borderRadius: 8 }}
      acknowledgeRemotionLicense
    />
  );
}
