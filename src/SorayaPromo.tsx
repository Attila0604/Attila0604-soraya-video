import React from "react";
import {
  AbsoluteFill,
  Sequence,
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

// ---- Props (editable via GitHub Action inputs / input-props.json) ----
export type SorayaProps = {
  brand: string;
  tagline: string;
  cta: string;
  storeLine: string;
  bg: string;
  gold: string;
  text: string;
};

export const defaultSorayaProps: SorayaProps = {
  brand: "SORAYA",
  tagline: "Deine Sterne. Dein Weg.",
  cta: "Jetzt entdecken",
  storeLine: "Ab sofort im Google Play Store",
  bg: "#0A0B1E",
  gold: "#E4C77E",
  text: "#F4F1E8",
};

const ZODIAC = ["\u2648", "\u2649", "\u264A", "\u264B", "\u264C", "\u264D", "\u264E", "\u264F", "\u2650", "\u2651", "\u2652", "\u2653"];

// ---------- Background: deterministic starfield + soft nebula ----------
const Starfield: React.FC<{ gold: string }> = ({ gold }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const stars = new Array(140).fill(0).map((_, i) => {
    const x = random(`x-${i}`) * width;
    const y = random(`y-${i}`) * height;
    const size = random(`s-${i}`) * 2.6 + 0.4;
    const phase = random(`p-${i}`) * Math.PI * 2;
    const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(frame / 14 + phase));
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

// ---------- Rotating zodiac ring ----------
const ZodiacRing: React.FC<{ gold: string }> = ({ gold }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const appear = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 60 });
  const rotate = interpolate(frame, [0, 630], [0, 40]);
  const radius = 430;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          width: radius * 2,
          height: radius * 2,
          transform: `rotate(${rotate}deg) scale(${0.8 + appear * 0.2})`,
          opacity: appear * 0.55,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `1px solid ${gold}`,
            opacity: 0.35,
          }}
        />
        {ZODIAC.map((glyph, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const x = radius + Math.cos(angle) * radius - 26;
          const y = radius + Math.sin(angle) * radius - 26;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: 52,
                height: 52,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 40,
                color: gold,
                transform: `rotate(${-rotate}deg)`,
              }}
            >
              {glyph}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Wordmark ----------
const Wordmark: React.FC<{ brand: string; gold: string; text: string }> = ({ brand, gold, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 45 });
  const letterSpacing = interpolate(rise, [0, 1], [40, 18]);
  const shimmer = interpolate(frame % 90, [0, 45, 90], [-200, 200, 200]);
  return (
    <div
      style={{
        transform: `translateY(${(1 - rise) * 40}px)`,
        opacity: rise,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: serif,
          fontSize: 150,
          fontWeight: 600,
          letterSpacing,
          color: text,
          position: "relative",
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
      <div
        style={{
          width: 120,
          height: 1,
          background: gold,
          margin: "18px auto 0",
          opacity: rise,
        }}
      />
    </div>
  );
};

// ---------- Generic fade/rise wrapper ----------
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

const centered: React.CSSProperties = {
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
};

export const SorayaPromo: React.FC<SorayaProps> = ({
  brand,
  tagline,
  cta,
  storeLine,
  bg,
  gold,
  text,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fadeOut = interpolate(frame, [durationInFrames - 25, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 20%, #171838 0%, ${bg} 60%, #05060F 100%)`, opacity: fadeOut }}>
      <Starfield gold={gold} />
      <ZodiacRing gold={gold} />

      {/* Scene 1: Wordmark + tagline */}
      <Sequence from={0} durationInFrames={200}>
        <AbsoluteFill style={centered}>
          <Wordmark brand={brand} gold={gold} text={text} />
          <Sequence from={55}>
            <Reveal>
              <div
                style={{
                  fontFamily: serif,
                  fontSize: 54,
                  fontStyle: "italic",
                  color: gold,
                  marginTop: 34,
                  letterSpacing: 2,
                }}
              >
                {tagline}
              </div>
            </Reveal>
          </Sequence>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Features */}
      <Sequence from={200} durationInFrames={230}>
        <AbsoluteFill style={{ ...centered, gap: 40, padding: 90 }}>
          {[
            { t: "Tägliches Horoskop", d: "Pers\u00f6nlich auf dein Geburtsbild berechnet" },
            { t: "Synastrie", d: "Wie eure Sterne zueinander stehen" },
            { t: "Deutung im Chat", d: "Frag Soraya \u2013 jederzeit, ganz privat" },
          ].map((f, i) => (
            <Sequence key={i} from={i * 28}>
              <Reveal>
                <div
                  style={{
                    width: 820,
                    padding: "34px 44px",
                    borderRadius: 26,
                    border: `1px solid ${gold}55`,
                    background: "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(6px)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontFamily: serif, fontSize: 60, color: text, fontWeight: 600 }}>
                    {f.t}
                  </div>
                  <div style={{ fontFamily: sans, fontSize: 34, color: `${text}BB`, marginTop: 10, fontWeight: 300 }}>
                    {f.d}
                  </div>
                </div>
              </Reveal>
            </Sequence>
          ))}
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: CTA */}
      <Sequence from={430} durationInFrames={200}>
        <AbsoluteFill style={centered}>
          <Reveal>
            <div style={{ fontFamily: serif, fontSize: 72, color: text, fontWeight: 600, textAlign: "center" }}>
              {cta}
            </div>
          </Reveal>
          <Sequence from={22}>
            <Reveal>
              <div
                style={{
                  marginTop: 44,
                  padding: "24px 56px",
                  borderRadius: 999,
                  border: `1.5px solid ${gold}`,
                  color: gold,
                  fontFamily: sans,
                  fontSize: 38,
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
