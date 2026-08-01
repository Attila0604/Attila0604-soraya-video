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
        let video = "app-tour.mp4";
        try {
          const res = await fetch(staticFile("tour.json"));
          const data = (await res.json()) as { trim: number; items: Caption[]; video?: string };
          captions = data.items ?? [];
          trim = data.trim ?? 0;
          video = data.video ?? "app-tour.mp4";
        } catch (e) {
          captions = [];
        }
        const nextProps: SorayaProps = { ...props, captions, trim, video };
        return { props: nextProps, durationInFrames: TOTAL };
      }}
    />
  );
};
