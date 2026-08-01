import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Img,
  staticFile,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  random,
} from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadSans } from "@remotion/google-fonts/Jost";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

// ---- Timing (Frames bei 30 fps) ----
export const INTRO = 75; // 2.5 s Marken-Intro
export const PER_SHOT = 96; // 3.2 s pro App-Screen
export const OUTRO = 96; // 3.2 s Call-to-Action

export type Shot = { file: string; caption: string };

export type SorayaProps = {
  brand: string;
  tagline: string;
  cta: string;
  storeLine: string;
  bg: string;
  gold: string;
  text: string;
  shots: Shot[];
};

export const defaultSorayaProps: SorayaProps = {
  brand: "SORAYA",
  tagline: "Deine Sterne. Dein Weg.",
  cta: "Jetzt entdecken",
  storeLine: "Ab sofort im Google Play Store",
  bg: "#0A0B1E",
  gold: "#E4C77E",
  text: "#F4F1E8",
  shots: [],
};

// ---------- Hintergrund: Sternenhimmel ----------
const Starfield: React.FC<{ gold: string }> = ({ gold }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const stars = new Array(120).fill(0).map((_, i) => {
    const x = random(`x-${i}`) * width;
    const y = random(`y-${i}`) * height;
    const size = random(`s-${i}`) * 2.4 + 0.4;
    const phase = random(`p-${i}`) * Math.PI * 2;
    const twinkle = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(frame / 14 + phase));
    return { x, y, size, twinkle, i };
  });
  return (
    <AbsoluteFill>
      {stars.map((s) => (
        <div
          key={s.i}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: s.i % 9 === 0 ? gold : "#FFFFFF",
            opacity: s.twinkle,
            boxShadow: s.i % 9 === 0 ? `0 0 ${s.size * 3}px ${gold}` : undefined,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// ---------- Wortmarke (Intro) ----------
const Wordmark: React.FC<{ brand: string; gold: string; text: string }> = ({ brand, gold, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 45 });
  const shimmer = interpolate(frame % 90, [0, 45, 90], [-200, 200, 200]);
  return (
    <div style={{ transform: `translateY(${(1 - rise) * 40}px)`, opacity: rise, textAlign: "center" }}>
      <div
        style={{
          fontFamily: serif,
          fontSize: 150,
          fontWeight: 600,
          letterSpacing: interpolate(rise, [0, 1], [40, 18]),
          color: text,
          backgroundImage: `linear-gradient(105deg, ${text} 40%, ${gold} 50%, ${text} 60%)`,
          backgroundSize: "200% 100%",
          backgroundPositionX: shimmer,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {brand}
      </div>
      <div style={{ width: 120, height: 1, background: gold, margin: "18px auto 0" }} />
    </div>
  );
};

// ---------- Handy-Rahmen mit App-Screenshot ----------
const PhoneShot: React.FC<{ shot: Shot; gold: string; text: string }> = ({ shot, gold, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 30 });
  // sanftes Schweben (schneidet nichts ab), kein Zoom-Crop mehr
  const float = Math.sin(frame / 26) * 7;
  const screenW = 560;
  const screenH = 1212;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
      <div
        style={{
          opacity: enter,
          transform: `translateY(${(1 - enter) * -20}px)`,
          fontFamily: serif,
          fontSize: 66,
          fontWeight: 600,
          color: text,
          marginBottom: 46,
          textAlign: "center",
          maxWidth: 900,
        }}
      >
        {shot.caption}
      </div>

      <div
        style={{
          width: screenW + 34,
          height: screenH + 34,
          borderRadius: 68,
          padding: 17,
          background: "linear-gradient(160deg, #2a2c44, #0d0e1c)",
          boxShadow: `0 40px 90px rgba(0,0,0,0.55), 0 0 60px ${gold}22`,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 60 + float}px) scale(${0.94 + enter * 0.06})`,
        }}
      >
        <div
          style={{
            width: screenW,
            height: screenH,
            borderRadius: 52,
            overflow: "hidden",
            position: "relative",
            border: `1px solid ${gold}44`,
            background: "#000",
          }}
        >
          <Img
            src={staticFile(`shots/${shot.file}`)}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
          />
          <div
            style={{
              position: "absolute",
              top: 14,
              left: "50%",
              transform: "translateX(-50%)",
              width: 150,
              height: 30,
              borderRadius: 18,
              background: "#000",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Reveal: React.FC<{ delay?: number; children: React.ReactNode; y?: number }> = ({
  delay = 0,
  children,
  y = 30,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 40 });
  return <div style={{ opacity: s, transform: `translateY(${(1 - s) * y}px)` }}>{children}</div>;
};

const centered: React.CSSProperties = { justifyContent: "center", alignItems: "center", flexDirection: "column" };

export const SorayaPromo: React.FC<SorayaProps> = ({
  brand,
  tagline,
  cta,
  storeLine,
  bg,
  gold,
  text,
  shots,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fadeOut = interpolate(frame, [durationInFrames - 25, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
  });
  const outroStart = INTRO + shots.length * PER_SHOT;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 90% at 50% 15%, #171838 0%, ${bg} 60%, #05060F 100%)`,
        opacity: fadeOut,
      }}
    >
      <Starfield gold={gold} />

      <Sequence from={0} durationInFrames={INTRO}>
        <AbsoluteFill style={centered}>
          <Wordmark brand={brand} gold={gold} text={text} />
          <Sequence from={40}>
            <Reveal>
              <div style={{ fontFamily: serif, fontSize: 52, fontStyle: "italic", color: gold, marginTop: 30 }}>
                {tagline}
              </div>
            </Reveal>
          </Sequence>
        </AbsoluteFill>
      </Sequence>

      {shots.map((shot, i) => (
        <Sequence key={i} from={INTRO + i * PER_SHOT} durationInFrames={PER_SHOT}>
          <PhoneShot shot={shot} gold={gold} text={text} />
        </Sequence>
      ))}

      <Sequence from={outroStart} durationInFrames={OUTRO}>
        <AbsoluteFill style={centered}>
          <Reveal>
            <div style={{ fontFamily: serif, fontSize: 108, fontWeight: 600, color: text }}>{brand}</div>
          </Reveal>
          <Sequence from={16}>
            <Reveal>
              <div style={{ fontFamily: serif, fontSize: 60, color: text, marginTop: 10 }}>{cta}</div>
            </Reveal>
          </Sequence>
          <Sequence from={30}>
            <Reveal>
              <div
                style={{
                  marginTop: 44,
                  padding: "22px 52px",
                  borderRadius: 999,
                  border: `1.5px solid ${gold}`,
                  color: gold,
                  fontFamily: sans,
                  fontSize: 36,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  boxShadow: `0 0 40px ${gold}44`,
                }}
              >
                {storeLine}
              </div>
            </Reveal>
          </Sequence>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
