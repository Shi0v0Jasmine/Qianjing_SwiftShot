import { Composition, staticFile } from "remotion";
import { CoffeeAd, type CoffeeAdProps } from "../../web/src/demo/CoffeeAd";
import { completeProject, totalSeconds } from "../../web/src/demo/model";
import { Presentation } from "./Presentation";
const p = completeProject();
p.shots[0].caption = "为自己，留一杯咖啡。";
p.shots[0].duration = 5;
export const adProps: CoffeeAdProps = {
  name: p.name,
  shots: p.shots,
  imageSources: {
    morning: staticFile("demo/morning.png"),
    product: staticFile("demo/product.png"),
    pour: staticFile("demo/pour.png"),
    scene: staticFile("demo/scene.png"),
  },
};
export function Root() {
  return (
    <>
      <Composition
        id="CoffeeAd"
        component={CoffeeAd}
        durationInFrames={630}
        width={1080}
        height={1350}
        fps={30}
        defaultProps={adProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.round(totalSeconds(props.shots) * 30),
        })}
      />
      <Composition
        id="ShotSwiftPresentation"
        component={Presentation}
        durationInFrames={3000}
        width={1920}
        height={1080}
        fps={30}
        defaultProps={{ ad: adProps }}
      />
    </>
  );
}
