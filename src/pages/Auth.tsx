import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sun, Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
  displayName: z.string().trim().max(50).optional(),
});

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, displayName });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created — welcome!");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="uv-bg" data-risk="moderate" />
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-strong rounded-[2rem] p-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center">
              <Sun className="w-6 h-6 text-white" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">UVie</h1>
              <p className="text-xs text-white/70">Stay safe in the sun</p>
            </div>
          </div>

          <div className="flex glass rounded-full p-1 mb-6">
            {(["signup", "signin"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm rounded-full transition-all ${
                  mode === m ? "bg-white text-foreground font-medium" : "text-white/80"
                }`}
              >
                {m === "signup" ? "Sign up" : "Sign in"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <input
                type="text"
                placeholder="Display name (optional)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
                className="w-full px-4 py-3 rounded-2xl glass text-white placeholder:text-white/60 outline-none focus:ring-2 focus:ring-white/40"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
              className="w-full px-4 py-3 rounded-2xl glass text-white placeholder:text-white/60 outline-none focus:ring-2 focus:ring-white/40"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              maxLength={72}
              className="w-full px-4 py-3 rounded-2xl glass text-white placeholder:text-white/60 outline-none focus:ring-2 focus:ring-white/40"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-white text-foreground font-medium hover:bg-white/90 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <Link to="/" className="block text-center text-sm text-white/70 mt-6 hover:text-white">
            Continue without an account →
          </Link>
        </div>
      </main>
    </>
  );
};

export default Auth;