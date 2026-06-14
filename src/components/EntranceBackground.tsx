import { PenguinMark } from "@/components/icons";

/**
 * Decorative animated ocean scene behind the entrance: a deep gradient sky with
 * soft aurora glow, luminous flowing wave ribbons, and bobbing icebergs with a
 * couple of penguins. Pure CSS/SVG, no dependencies. Movement is disabled under
 * `prefers-reduced-motion` (see index.css).
 */

// One wave silhouette, 4 periods across a 2880-wide viewBox so a -50% scroll
// (one container width) loops seamlessly. preserveAspectRatio="none" lets it
// stretch to any width.
const WAVE_PATH =
  "M0 110 Q 180 74 360 110 T 720 110 T 1080 110 T 1440 110 T 1800 110 T 2160 110 T 2520 110 T 2880 110 L2880 220 L0 220 Z";

function WaveRibbon({
  from,
  to,
  opacity,
  duration,
  reverse,
  className,
}: {
  from: string;
  to: string;
  opacity: number;
  duration: string;
  reverse?: boolean;
  className?: string;
}) {
  const gradId = `wave-${from.replace("#", "")}`;
  return (
    <svg
      viewBox="0 0 2880 220"
      preserveAspectRatio="none"
      className={`wave-flow absolute bottom-0 left-0 ${className ?? ""}`}
      style={{ opacity, animationDuration: duration, animationDirection: reverse ? "reverse" : "normal" }}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <path d={WAVE_PATH} fill={`url(#${gradId})`} />
    </svg>
  );
}

function Iceberg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 96" width="1em" height="1em" className={className} style={style} aria-hidden>
      <polygon points="60,8 106,76 14,76" fill="#dceefc" opacity="0.96" />
      <polygon points="60,8 60,76 106,76" fill="#9fcdf0" opacity="0.9" />
      <polygon points="60,8 44,40 60,50" fill="#f3faff" opacity="0.95" />
      <polygon points="14,76 106,76 98,88 22,88" fill="#5ba6dd" opacity="0.5" />
    </svg>
  );
}

export function EntranceBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Deep gradient sky + glows */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 540px at 18% -10%, rgba(34,211,238,0.16), transparent 60%)," +
            "radial-gradient(1000px 600px at 92% 8%, rgba(99,102,241,0.16), transparent 55%)," +
            "linear-gradient(180deg, #0a1326 0%, #0a0f1e 55%, #070b16 100%)",
        }}
      />
      {/* faint dot grid for the console-instrument feel */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(#7dd3fc 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%)",
        }}
      />
      {/* aurora ribbon */}
      <div
        className="ocean-aurora absolute -top-1/4 left-1/5 h-[55vh] w-[60vw] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.22), rgba(99,102,241,0.10) 45%, transparent 70%)",
          animationDuration: "12s",
        }}
      />

      {/* Bobbing icebergs with penguins near the waterline */}
      <div className="ocean-bob absolute bottom-[15%] left-[14%] text-[120px] drop-shadow-[0_8px_24px_rgba(56,189,248,0.25)]" style={{ animationDuration: "9s" }}>
        <div className="relative leading-none">
          <Iceberg />
          <PenguinMark className="absolute bottom-[26%] left-1/2 -translate-x-1/2 text-[#0b1220]" style={{ fontSize: "32px" }} />
        </div>
      </div>
      <div className="ocean-bob absolute bottom-[19%] right-[15%] text-[88px] drop-shadow-[0_6px_18px_rgba(56,189,248,0.2)]" style={{ animationDuration: "11s", animationDelay: "1.5s" }}>
        <div className="relative leading-none">
          <Iceberg />
          <PenguinMark className="absolute bottom-[28%] left-1/2 -translate-x-1/2 text-[#0b1220]" style={{ fontSize: "22px" }} />
        </div>
      </div>
      <div className="ocean-bob absolute bottom-[11%] left-[62%] text-[64px] opacity-80" style={{ animationDuration: "13s", animationDelay: "0.7s" }}>
        <Iceberg />
      </div>

      {/* Luminous flowing wave ribbons (back to front) */}
      <WaveRibbon from="#1e40af" to="#0a0f1e" opacity={0.55} duration="38s" className="h-52" />
      <WaveRibbon from="#2563eb" to="#0b1530" opacity={0.6} duration="26s" reverse className="h-44" />
      <WaveRibbon from="#22d3ee" to="#0e2240" opacity={0.7} duration="18s" className="h-32" />
    </div>
  );
}
