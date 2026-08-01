import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  random,
} from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";
import { loadFont as loadSerif } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadSans } from "@remotion/google-fonts/Jost";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

// ---- Timing (Frames bei 30 fps) ----
export const INTRO = 78;
export const PER_SHOT = 100;
export const OUTRO = 100;
export const TRANS = 20; // Überblend-Dauer

// Gesamtlänge: Segmente = 1 Intro + n Shots + 1 Outro; Übergänge = n+1
export const computeDuration = (n: number) => INTRO + n * PER_SHOT + OUTRO - (n + 1) * TRANS;

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

// =================== Hintergrund ===================
const AnimatedBackground: React.FC<{ gold: string; bg: string }> = ({ gold, bg }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // driftende Aurora-Blobs
  const blobs = [
    { c: "#4b2f9e", r: 900, sx: 0.22, sy: 0.18, px: 0, py: 0 },
    { c: "#7a3f95", r: 780, sx: 0.16, sy: 0.24, px: 2, py: 1 },
    { c: "#1f3a8a", r: 820, sx: 0.2, sy: 0.14, px: 4, py: 3 },
    { c: gold, r: 500, sx: 0.12, sy: 0.2, px: 1, py: 5 },
  ];

  const stars = new Array(110).fill(0).map((_, i) => {
    const x = random(`x-${i}`) * width;
    const y = random(`y-${i}`) * height;
    const size = random(`s-${i}`) * 2.3 + 0.4;
    const phase = random(`p-${i}`) * Math.PI * 2;
    const tw = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(frame / 13 + phase));
    return { x, y, size, tw, i };
  });

  // Sternschnuppe alle ~150 Frames
  const cycle = 150;
  const t = frame % cycle;
  const shootActive = t < 26;
  const sp = interpolate(t, [0, 26], [0, 1]);
  const sx = interpolate(sp, [0, 1], [width * 0.85, width * 0.15]);
  const sy = interpolate(sp, [0, 1], [height * 0.12, height * 0.5]);
  const shootOpacity = interpolate(t, [0, 4, 20, 26], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ background: `radial-gradient(130% 100% at 50% 10%, #141636 0%, ${bg} 55%, #05060F 100%)` }}>
      {blobs.map((b, i) => {
        const cx = width / 2 + Math.sin(frame / (70 + b.px * 10)) * width * b.sx;
        const cy = height / 2 + Math.cos(frame / (80 + b.py * 10)) * height * b.sy;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx - b.r / 2,
              top: cy - b.r / 2,
              width: b.r,
              height: b.r,
              borderRadius: "50%",
              background: b.c,
              opacity: 0.28,
              filter: "blur(120px)",
            }}
          />
        );
      })}

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
            opacity: s.tw,
            boxShadow: s.i % 9 === 0 ? `0 0 ${s.size * 3}px ${gold}` : undefined,
          }}
        />
      ))}

      {shootActive && (
        <div
          style={{
            position: "absolute",
            left: sx,
            top: sy,
            width: 160,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${gold})`,
            opacity: shootOpacity,
            transform: "rotate(30deg)",
            boxShadow: `0 0 12px ${gold}`,
          }}
        />
      )}

      {/* Vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(120% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

// =================== Kinetischer Text ===================
const KineticText: React.FC<{
  text: string;
  size: number;
  color: string;
  italic?: boolean;
  delay?: number;
}> = ({ text, size, color, italic, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px", maxWidth: 940 }}>
      {words.map((w, i) => {
        const s = spring({ frame: frame - delay - i * 5, fps, config: { damping: 200 }, durationInFrames: 34 });
        return (
          <span
            key={i}
            style={{
              fontFamily: serif,
              fontSize: size,
              fontWeight: 600,
              fontStyle: italic ? "italic" : "normal",
              color,
              opacity: s,
              transform: `translateY(${(1 - s) * 34}px)`,
              display: "inline-block",
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

// =================== Intro ===================
const Intro: React.FC<{ brand: string; tagline: string; gold: string; text: string }> = ({
  brand,
  tagline,
  gold,
  text,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 45 });
  const shimmer = interpolate(frame % 80, [0, 40, 80], [-200, 200, 200]);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
      <div style={{ opacity: rise, transform: `translateY(${(1 - rise) * 40}px) scale(${0.9 + rise * 0.1})` }}>
        <div
          style={{
            fontFamily: serif,
            fontSize: 156,
            fontWeight: 600,
            letterSpacing: 16,
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
      </div>
      <div style={{ width: interpolate(rise, [0, 1], [0, 160]), height: 1, background: gold, margin: "22px 0 30px" }} />
      <div style={{ marginTop: 6 }}>
        <KineticText text={tagline} size={54} color={gold} italic delay={22} />
      </div>
    </AbsoluteFill>
  );
};

// =================== Handy mit Screenshot ===================
const PhoneShot: React.FC<{ shot: Shot; gold: string; text: string }> = ({ shot, gold, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 32 });
  const float = Math.sin(frame / 26) * 8;
  const tiltY = Math.sin(frame / 42) * 4;
  const tiltX = Math.cos(frame / 55) * 2;
  const screenW = 560;
  const screenH = 1212;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
      {/* Eyebrow + Caption */}
      <div style={{ opacity: enter, transform: `translateY(${(1 - enter) * -18}px)`, marginBottom: 40, textAlign: "center" }}>
        <div style={{ fontFamily: sans, fontSize: 26, letterSpacing: 6, color: gold, textTransform: "uppercase", marginBottom: 14 }}>
          ✦ Soraya
        </div>
        <KineticText text={shot.caption} size={64} color={text} />
      </div>

      {/* Phone mit 3D-Kippung */}
      <div style={{ perspective: 1500 }}>
        <div
          style={{
            width: screenW + 34,
            height: screenH + 34,
            borderRadius: 68,
            padding: 17,
            background: "linear-gradient(160deg, #2a2c44, #0d0e1c)",
            boxShadow: `0 44px 100px rgba(0,0,0,0.6), 0 0 70px ${gold}22`,
            opacity: enter,
            transform: `translateY(${(1 - enter) * 70 + float}px) rotateY(${tiltY}deg) rotateX(${tiltX}deg) scale(${0.92 + enter * 0.08})`,
            transformStyle: "preserve-3d",
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
            {/* Glanzreflex */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(115deg, transparent 40%, ${gold}18 50%, transparent 60%)`,
                backgroundSize: "300% 100%",
                backgroundPositionX: `${interpolate(frame % 120, [0, 120], [-100, 200])}%`,
              }}
            />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// =================== Outro / CTA ===================
const Outro: React.FC<{ brand: string; cta: string; storeLine: string; gold: string; text: string }> = ({
  brand,
  cta,
  storeLine,
  gold,
  text,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 40 });
  const pulse = 1 + Math.sin(frame / 12) * 0.03;
  const glow = 30 + Math.sin(frame / 12) * 18;
  const shimmer = interpolate(frame % 80, [0, 40, 80], [-200, 200, 200]);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
      <div
        style={{
          fontFamily: serif,
          fontSize: 128,
          fontWeight: 600,
          letterSpacing: 10,
          opacity: rise,
          transform: `translateY(${(1 - rise) * 30}px)`,
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
      <div style={{ marginTop: 8 }}>
        <KineticText text={cta} size={58} color={text} delay={14} />
      </div>
      <div
        style={{
          marginTop: 46,
          padding: "24px 56px",
          borderRadius: 999,
          border: `1.5px solid ${gold}`,
          color: gold,
          fontFamily: sans,
          fontSize: 36,
          letterSpacing: 3,
          textTransform: "uppercase",
          opacity: interpolate(frame, [26, 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `scale(${pulse})`,
          boxShadow: `0 0 ${glow}px ${gold}66`,
        }}
      >
        {storeLine}
      </div>
    </AbsoluteFill>
  );
};

// =================== Haupt-Komposition ===================
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
  const timing = springTiming({ config: { damping: 200 }, durationInFrames: TRANS });
  const slideDirs = ["from-right", "from-left"] as const;

  const children: React.ReactNode[] = [];
  children.push(
    <TransitionSeries.Sequence key="intro" durationInFrames={INTRO}>
      <Intro brand={brand} tagline={tagline} gold={gold} text={text} />
    </TransitionSeries.Sequence>
  );
  if (shots.length > 0) {
    children.push(
      <TransitionSeries.Transition key="t-in" presentation={slide({ direction: "from-bottom" })} timing={timing} />
    );
    shots.forEach((shot, i) => {
      children.push(
        <TransitionSeries.Sequence key={`s-${i}`} durationInFrames={PER_SHOT}>
          <PhoneShot shot={shot} gold={gold} text={text} />
        </TransitionSeries.Sequence>
      );
      if (i < shots.length - 1) {
        children.push(
          <TransitionSeries.Transition
            key={`t-${i}`}
            presentation={slide({ direction: slideDirs[i % 2] })}
            timing={timing}
          />
        );
      }
    });
  }
  children.push(<TransitionSeries.Transition key="t-out" presentation={fade()} timing={timing} />);
  children.push(
    <TransitionSeries.Sequence key="outro" durationInFrames={OUTRO}>
      <Outro brand={brand} cta={cta} storeLine={storeLine} gold={gold} text={text} />
    </TransitionSeries.Sequence>
  );

  return (
    <AbsoluteFill>
      <AnimatedBackground gold={gold} bg={bg} />
      <TransitionSeries>{children}</TransitionSeries>
    </AbsoluteFill>
  );
};
