import { Composition, staticFile } from "remotion";
import { SorayaPromo, defaultSorayaProps, SorayaProps, Caption, TOTAL } from "./SorayaPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="SorayaPromo"
      component={SorayaPromo}
      fps={30}
      width={1080}
      height={1920}
      durationInFrames={TOTAL}
      defaultProps={defaultSorayaProps}
      calculateMetadata={async ({ props }) => {
        let captions: Caption[] = [];
        let trim = 0;
        try {
          const res = await fetch(staticFile("tour.json"));
          const data = (await res.json()) as { trim: number; items: Caption[] };
          captions = data.items ?? [];
          trim = data.trim ?? 0;
        } catch (e) {
          captions = [];
          trim = 0;
        }
        const nextProps: SorayaProps = { ...props, captions, trim };
        return { props: nextProps, durationInFrames: TOTAL };
      }}
    />
  );
};
