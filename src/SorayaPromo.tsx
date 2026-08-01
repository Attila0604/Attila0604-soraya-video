import React from "react";
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
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

// ---- Timing (30 fps) ----
export const INTRO = 78;
export const TOUR = 540;
export const OUTRO = 100;
export const TRANS = 20;
export const FPS = 30;
export const TOTAL = INTRO + TOUR + OUTRO - 2 * TRANS;
const TOUR_OFFSET = INTRO - TRANS; // globaler Frame-Offset der Tour (für Beat-Sync)
const CONTENT = 0.78; // sichtbarer Anteil des App-Bilds (Rest = graues Feld -> abgeschnitten)
const BEAT = (FPS * 60) / 76; // Musik-Tempo ~76 BPM

const ZODIAC = ["\u2648", "\u2649", "\u264A", "\u264B", "\u264C", "\u264D", "\u264E", "\u264F", "\u2650", "\u2651", "\u2652", "\u2653"];

export type Caption = { text: string; at: number };
export type SorayaProps = {
  brand: string;
  tagline: string;
  cta: string;
  storeLine: string;
  bg: string;
  gold: string;
  text: string;
  captions: Caption[];
  trim: number;
  video: string;
};

export const defaultSorayaProps: SorayaProps = {
  brand: "SORAYA",
  tagline: "Deine Sterne. Dein Weg.",
  cta: "Jetzt entdecken",
  storeLine: "Ab sofort im Google Play Store",
  bg: "#0A0B1E",
  gold: "#E4C77E",
  text: "#F4F1E8",
  captions: [],
  trim: 0,
  video: "app-tour.webm",
};

const beatPulse = (globalFrame: number) => {
  const t = (globalFrame % BEAT) / BEAT;
  return Math.pow(1 - t, 3); // scharfer Anschlag, weicher Abfall
};

// =================== Hintergrund ===================
const AnimatedBackground: React.FC<{ gold: string; bg: string }> = ({ gold, bg }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const pulse = beatPulse(frame);

  const blobs = [
    { c: "#4b2f9e", r: 900, sx: 0.22, sy: 0.18, px: 0, py: 0 },
    { c: "#7a3f95", r: 780, sx: 0.16, sy: 0.24, px: 2, py: 1 },
    { c: "#1f3a8a", r: 820, sx: 0.2, sy: 0.14, px: 4, py: 3 },
    { c: gold, r: 480, sx: 0.12, sy: 0.2, px: 1, py: 5 },
  ];

  const stars = new Array(120).fill(0).map((_, i) => {
    const x = random(`x-${i}`) * width;
    const y = random(`y-${i}`) * height;
    const size = random(`s-${i}`) * 2.3 + 0.4;
    const phase = random(`p-${i}`) * Math.PI * 2;
    const tw = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(frame / 13 + phase));
    return { x, y, size, tw, i };
  });

  // schwebende Partikel (Staub)
  const motes = new Array(26).fill(0).map((_, i) => {
    const bx = random(`mx-${i}`) * width;
    const drift = Math.sin(frame / (60 + random(`md-${i}`) * 40) + i) * 30;
    const speed = 0.35 + random(`ms-${i}`) * 0.5;
    const y = (height - ((frame * speed + random(`mo-${i}`) * height) % (height + 100))) - 50;
    const size = 1.5 + random(`msz-${i}`) * 3;
    const op = 0.15 + 0.35 * (0.5 + 0.5 * Math.sin(frame / 20 + i));
    return { x: bx + drift, y, size, op, i };
  });

  // zwei versetzte Sternschnuppen
  const shooters = [0, 75].map((off, k) => {
    const t = (frame + off) % 150;
    const active = t < 26;
    const sp = interpolate(t, [0, 26], [0, 1]);
    const sx = interpolate(sp, [0, 1], [width * (0.9 - k * 0.3), width * (0.2 - k * 0.1)]);
    const sy = interpolate(sp, [0, 1], [height * (0.1 + k * 0.15), height * (0.45 + k * 0.1)]);
    const op = interpolate(t, [0, 4, 20, 26], [0, 1, 1, 0]);
    return { active, sx, sy, op, k };
  });

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
              opacity: 0.24 + pulse * 0.05,
              filter: "blur(120px)",
            }}
          />
        );
      })}

      {stars.map((s) => (
        <div key={s.i} style={{ position: "absolute", left: s.x, top: s.y, width: s.size, height: s.size, borderRadius: "50%", background: s.i % 9 === 0 ? gold : "#FFFFFF", opacity: s.tw, boxShadow: s.i % 9 === 0 ? `0 0 ${s.size * 3}px ${gold}` : undefined }} />
      ))}

      {motes.map((m) => (
        <div key={`m${m.i}`} style={{ position: "absolute", left: m.x, top: m.y, width: m.size, height: m.size, borderRadius: "50%", background: gold, opacity: m.op, filter: "blur(0.5px)" }} />
      ))}

      {shooters.map((s) =>
        s.active ? (
          <div key={`sh${s.k}`} style={{ position: "absolute", left: s.sx, top: s.sy, width: 170, height: 2, background: `linear-gradient(90deg, transparent, ${gold})`, opacity: s.op, transform: "rotate(30deg)", boxShadow: `0 0 12px ${gold}` }} />
        ) : null
      )}

      <AbsoluteFill style={{ background: "radial-gradient(120% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

// =================== Kinetischer Text ===================
const KineticText: React.FC<{ text: string; size: number; color: string; italic?: boolean; delay?: number }> = ({ text, size, color, italic, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px", maxWidth: 940 }}>
      {words.map((w, i) => {
        const s = spring({ frame: frame - delay - i * 5, fps, config: { damping: 200 }, durationInFrames: 34 });
        return (
          <span key={i} style={{ fontFamily: serif, fontSize: size, fontWeight: 600, fontStyle: italic ? "italic" : "normal", color, opacity: s, transform: `translateY(${(1 - s) * 34}px)`, display: "inline-block" }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

// =================== Intro ===================
const Intro: React.FC<{ brand: string; tagline: string; gold: string; text: string }> = ({ brand, tagline, gold, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 45 });
  const shimmer = interpolate(frame % 80, [0, 40, 80], [-200, 200, 200]);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
      <div style={{ opacity: rise, transform: `translateY(${(1 - rise) * 40}px) scale(${0.9 + rise * 0.1})` }}>
        <div style={{ fontFamily: serif, fontSize: 156, fontWeight: 600, letterSpacing: 16, color: text, backgroundImage: `linear-gradient(105deg, ${text} 40%, ${gold} 50%, ${text} 60%)`, backgroundSize: "200% 100%", backgroundPositionX: shimmer, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {brand}
        </div>
      </div>
      <div style={{ width: interpolate(rise, [0, 1], [0, 160]), height: 1, background: gold, margin: "22px 0 30px" }} />
      <KineticText text={tagline} size={54} color={gold} italic delay={22} />
    </AbsoluteFill>
  );
};

// =================== Umkreisende Sternzeichen + Ring ===================
const OrbitLayer: React.FC<{ gold: string; frame: number }> = ({ gold, frame }) => {
  const rot = frame * 0.25;
  const rx = 470;
  const ry = 690;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* faint rotierender Ring */}
      <div style={{ position: "absolute", width: rx * 2, height: ry * 2, borderRadius: "50%", border: `1px solid ${gold}`, opacity: 0.14, transform: `rotate(${rot}deg)` }} />
      <div style={{ position: "absolute", width: rx * 1.5, height: ry * 1.5, borderRadius: "50%", border: `1px solid ${gold}`, opacity: 0.1, transform: `rotate(${-rot * 0.7}deg)` }} />
      {ZODIAC.map((g, i) => {
        const a = (i / 12) * Math.PI * 2 + (rot * Math.PI) / 180;
        const x = Math.cos(a) * rx;
        const y = Math.sin(a) * ry;
        const depth = 0.5 + 0.5 * Math.sin(a); // vorne heller
        return (
          <div key={i} style={{ position: "absolute", transform: `translate(${x}px, ${y}px)`, fontSize: 40, color: gold, opacity: 0.18 + depth * 0.32 }}>
            {g}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// =================== App-Tour ===================
const Tour: React.FC<{ captions: Caption[]; trim: number; video: string; gold: string; text: string }> = ({ captions, trim, video, gold, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gFrame = frame + TOUR_OFFSET;
  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 30 });
  const pulse = beatPulse(gFrame);
  const screenW = 560;
  const screenH = 1212;
  const trimFrames = Math.round(trim * fps);

  const items = captions.map((c) => ({ text: c.text, appear: Math.max(0, Math.round((c.at - trim) * fps)) }));

  const pushIn = interpolate(frame, [0, TOUR], [0.95, 1.08]);
  const driftX = Math.sin(frame / 62) * 26;
  const rot = Math.sin(frame / 84) * 1.4;
  const tiltY = Math.sin(frame / 46) * 3.2;
  const tiltX = Math.cos(frame / 60) * 1.8;
  const float = Math.sin(frame / 26) * 8;

  let punch = 0;
  for (const it of items) {
    const d = frame - it.appear;
    if (d >= 0 && d < 18) punch = Math.max(punch, 0.06 * (1 - d / 18));
  }
  const scale = (0.94 + enter * 0.06) * (pushIn + punch + pulse * 0.012);
  const glow = 24 + punch * 900 + pulse * 26;
  const clipH = Math.round(screenH * CONTENT);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
      <OrbitLayer gold={gold} frame={frame} />

      {/* Caption */}
      <div style={{ height: 168, marginBottom: 26, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", zIndex: 3 }}>
        <div style={{ fontFamily: sans, fontSize: 24, letterSpacing: 7, color: gold, textTransform: "uppercase", marginBottom: 16, opacity: enter }}>✦ Soraya</div>
        <div style={{ position: "relative", height: 96, width: 960 }}>
          {items.map((it, i) => {
            const end = i < items.length - 1 ? items[i + 1].appear : TOUR;
            const local = frame - it.appear;
            const op = interpolate(frame, [it.appear, it.appear + 12, end - 12, end], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const reveal = spring({ frame: local, fps, config: { damping: 200 }, durationInFrames: 26 });
            const underline = interpolate(local, [4, 24], [0, 280], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={i} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: op }}>
                <div style={{ textAlign: "center", fontFamily: serif, fontSize: 72, fontWeight: 600, color: text, transform: `translateY(${(1 - reveal) * 28}px)` }}>{it.text}</div>
                <div style={{ width: op > 0 ? underline : 0, height: 2, background: gold, marginTop: 14, boxShadow: `0 0 12px ${gold}` }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Spotlight */}
      <div style={{ position: "absolute", width: 1000, height: 1000, borderRadius: "50%", background: `radial-gradient(circle, ${gold}22 0%, transparent 60%)`, top: "50%", left: "50%", transform: `translate(-50%,-50%) scale(${1 + punch * 3 + pulse * 0.15})`, opacity: 0.55 + punch * 4, filter: "blur(30px)" }} />

      {/* Handy */}
      <div style={{ perspective: 1600, zIndex: 2 }}>
        <div
          style={{
            width: screenW + 34,
            height: screenH + 34,
            borderRadius: 68,
            padding: 17,
            background: "linear-gradient(160deg, #2a2c44, #0d0e1c)",
            boxShadow: `0 44px 100px rgba(0,0,0,0.6), 0 0 ${glow}px ${gold}44`,
            opacity: enter,
            transform: `translateX(${driftX}px) translateY(${(1 - enter) * 60 + float}px) rotateY(${tiltY}deg) rotateX(${tiltX}deg) rotateZ(${rot}deg) scale(${scale})`,
            transformStyle: "preserve-3d",
          }}
        >
          <div style={{ width: screenW, height: screenH, borderRadius: 52, overflow: "hidden", position: "relative", border: `1px solid ${gold}44`, background: "#0A0B1E" }}>
            {/* nur oberer (grau-freier) Teil des App-Bilds */}
            <div style={{ position: "absolute", top: 0, left: 0, width: screenW, height: clipH, overflow: "hidden" }}>
              <OffthreadVideo src={staticFile(video)} trimBefore={trimFrames} muted style={{ width: screenW, height: screenH, objectFit: "cover" }} />
            </div>
            {/* weiche Kante zum dunklen Bereich */}
            <div style={{ position: "absolute", left: 0, right: 0, top: clipH - 60, height: 90, background: "linear-gradient(to bottom, transparent, #0A0B1E)" }} />
            {/* Notch */}
            <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", width: 150, height: 30, borderRadius: 18, background: "#000" }} />
            {/* Glanzreflex */}
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(115deg, transparent 40%, ${gold}18 50%, transparent 60%)`, backgroundSize: "300% 100%", backgroundPositionX: `${interpolate(frame % 120, [0, 120], [-100, 200])}%` }} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// =================== Outro ===================
const Outro: React.FC<{ brand: string; cta: string; storeLine: string; gold: string; text: string }> = ({ brand, cta, storeLine, gold, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 40 });
  const pulse = 1 + Math.sin(frame / 12) * 0.03;
  const glow = 30 + Math.sin(frame / 12) * 18;
  const shimmer = interpolate(frame % 80, [0, 40, 80], [-200, 200, 200]);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
      <div style={{ fontFamily: serif, fontSize: 128, fontWeight: 600, letterSpacing: 10, opacity: rise, transform: `translateY(${(1 - rise) * 30}px)`, color: text, backgroundImage: `linear-gradient(105deg, ${text} 40%, ${gold} 50%, ${text} 60%)`, backgroundSize: "200% 100%", backgroundPositionX: shimmer, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        {brand}
      </div>
      <div style={{ marginTop: 8 }}>
        <KineticText text={cta} size={58} color={text} delay={14} />
      </div>
      <div style={{ marginTop: 46, padding: "24px 56px", borderRadius: 999, border: `1.5px solid ${gold}`, color: gold, fontFamily: sans, fontSize: 36, letterSpacing: 3, textTransform: "uppercase", opacity: interpolate(frame, [26, 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `scale(${pulse})`, boxShadow: `0 0 ${glow}px ${gold}66` }}>
        {storeLine}
      </div>
    </AbsoluteFill>
  );
};

// =================== Haupt-Komposition ===================
export const SorayaPromo: React.FC<SorayaProps> = ({ brand, tagline, cta, storeLine, bg, gold, text, captions, trim, video }) => {
  const timing = springTiming({ config: { damping: 200 }, durationInFrames: TRANS });
  return (
    <AbsoluteFill>
      <Audio src={staticFile("music.mp3")} volume={0.85} />
      <AnimatedBackground gold={gold} bg={bg} />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={INTRO}>
          <Intro brand={brand} tagline={tagline} gold={gold} text={text} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={TOUR}>
          <Tour captions={captions} trim={trim} video={video} gold={gold} text={text} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={OUTRO}>
          <Outro brand={brand} cta={cta} storeLine={storeLine} gold={gold} text={text} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
