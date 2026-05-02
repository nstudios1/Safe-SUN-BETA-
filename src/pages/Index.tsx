import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin, RefreshCw, LogIn, LogOut, Loader2, Sun,
  Umbrella, Glasses, Shirt, Clock, Droplets, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchUV, getCurrentPosition, getRiskLevel, RISK_TIPS, type UVData } from "@/lib/uv";
import { UVOrb } from "@/components/UVOrb";
import { TipCard } from "@/components/TipCard";

const TIP_ICONS = [Umbrella, Glasses, Shirt, Clock, Droplets, Sparkles];

const Index = () => {
  const { user } = useAuth();
  const [data, setData] = useState<UVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const risk = getRiskLevel(data?.uv);
  const tips = RISK_TIPS[risk];

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const pos = await getCurrentPosition();
      const uv = await fetchUV(pos.coords.latitude, pos.coords.longitude);
      setData(uv);
    } catch (e: any) {
      const msg = e?.code === 1
        ? "Location access denied. Showing default view."
        : e?.message ?? "Failed to load UV data";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
  };

  const updatedAt = useMemo(() => {
    if (!data) return "";
    return new Date(data.fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, [data]);

  return (
    <>
      <div className="uv-bg" data-risk={risk} />

      <main className="min-h-screen px-4 py-6 sm:py-10 max-w-2xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl glass flex items-center justify-center">
              <Sun className="w-5 h-5 text-white" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white tracking-tight">UVie</h1>
              <p className="text-xs text-white/70">Real-time UV monitor</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              disabled={loading}
              aria-label="Refresh"
              className="w-11 h-11 rounded-2xl glass flex items-center justify-center text-white hover:bg-white/20 transition disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </button>
            {user ? (
              <button
                onClick={handleSignOut}
                aria-label="Sign out"
                className="w-11 h-11 rounded-2xl glass flex items-center justify-center text-white hover:bg-white/20 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <Link
                to="/auth"
                aria-label="Sign in"
                className="w-11 h-11 rounded-2xl glass flex items-center justify-center text-white hover:bg-white/20 transition"
              >
                <LogIn className="w-4 h-4" />
              </Link>
            )}
          </div>
        </header>

        {/* Location pill */}
        <div className="flex justify-center mb-6 animate-fade-in [animation-delay:80ms]">
          <div className="glass rounded-full px-4 py-2 flex items-center gap-2 text-white/90 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{data?.city ?? (loading ? "Locating…" : "Location unavailable")}</span>
          </div>
        </div>

        {/* Orb */}
        <section className="mb-8 animate-count-in">
          <UVOrb uv={data?.uv ?? null} risk={risk} loading={loading} />
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-3 mb-8">
          <div className="glass rounded-2xl p-4 animate-fade-in [animation-delay:120ms]">
            <p className="text-xs uppercase tracking-widest text-white/70">Today's max</p>
            <p className="text-2xl font-light text-white mt-1 tabular-nums">
              {data ? data.uvMax.toFixed(1) : "—"}
            </p>
          </div>
          <div className="glass rounded-2xl p-4 animate-fade-in [animation-delay:180ms]">
            <p className="text-xs uppercase tracking-widest text-white/70">Updated</p>
            <p className="text-2xl font-light text-white mt-1 tabular-nums">{updatedAt || "—"}</p>
          </div>
        </section>

        {error && (
          <div className="glass rounded-2xl p-4 mb-6 text-sm text-white/90 animate-fade-in">
            {error}
          </div>
        )}

        {/* Tips */}
        <section>
          <h2 className="text-white text-lg font-medium mb-3 px-1">Sun protection tips</h2>
          <div className="space-y-3">
            {tips.map((tip, i) => {
              const Icon = TIP_ICONS[i % TIP_ICONS.length];
              const [first, ...rest] = tip.split(" — ");
              const title = rest.length ? first : `Tip ${i + 1}`;
              const body = rest.length ? rest.join(" — ") : tip;
              return (
                <TipCard
                  key={i}
                  icon={Icon}
                  title={title}
                  body={body}
                  delay={240 + i * 80}
                />
              );
            })}
          </div>
        </section>

        <footer className="text-center text-xs text-white/60 mt-10 pb-4">
          Data: Open-Meteo · Stay safe under the sun
        </footer>
      </main>
    </>
  );
};

export default Index;
