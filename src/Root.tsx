import { Composition } from "remotion";
import { SorayaPromo, defaultSorayaProps } from "./SorayaPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="SorayaPromo"
      component={SorayaPromo}
      durationInFrames={630}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={defaultSorayaProps}
    />
  );
};
