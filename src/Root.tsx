import { Composition, staticFile } from "remotion";
import {
  SorayaPromo,
  defaultSorayaProps,
  SorayaProps,
  Shot,
  computeDuration,
} from "./SorayaPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="SorayaPromo"
      component={SorayaPromo}
      fps={30}
      width={1080}
      height={1920}
      durationInFrames={computeDuration(0)}
      defaultProps={defaultSorayaProps}
      calculateMetadata={async ({ props }) => {
        let shots: Shot[] = [];
        try {
          const res = await fetch(staticFile("shots/manifest.json"));
          shots = (await res.json()) as Shot[];
        } catch (e) {
          shots = [];
        }
        const nextProps: SorayaProps = { ...props, shots };
        return { props: nextProps, durationInFrames: computeDuration(shots.length) };
      }}
    />
  );
};
