import { RISK_LABEL, type RiskLevel } from "@/lib/uv";
import { useEffect, useState } from "react";

interface Props {
  uv: number | null;
  risk: RiskLevel;
  loading?: boolean;
}

export const UVOrb = ({ uv, risk, loading }: Props) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (uv == null) return;
    const target = uv;
    const start = performance.now();
    const duration = 900;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [uv]);

  return (
    <div className="relative flex items-center justify-center w-72 h-72 sm:w-80 sm:h-80 mx-auto animate-float-orb">
      {/* Pulsing rings */}
      <span className="absolute inset-0 rounded-full glass animate-pulse-ring" />
      <span className="absolute inset-4 rounded-full glass animate-pulse-ring [animation-delay:0.6s]" />

      {/* Main glass orb */}
      <div className="relative w-60 h-60 sm:w-64 sm:h-64 rounded-full glass-strong flex flex-col items-center justify-center overflow-hidden">
        {/* Inner glow */}
        <div
          className="absolute inset-2 rounded-full opacity-60 blur-2xl"
          style={{ background: "radial-gradient(circle at 30% 30%, hsl(0 0% 100% / 0.6), transparent 70%)" }}
        />
        {/* Highlight */}
        <div className="absolute top-4 left-8 w-20 h-10 rounded-full bg-white/30 blur-xl" />

        <div className="relative z-10 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-white/80 mb-1">UV Index</p>
          <p className="text-7xl sm:text-8xl font-extralight text-white text-shadow-glow tabular-nums">
            {loading || uv == null ? "—" : display.toFixed(1)}
          </p>
          <p className="mt-2 text-sm font-medium uppercase tracking-widest text-white/90">
            {RISK_LABEL[risk]}
          </p>
        </div>
      </div>
    </div>
  );
};