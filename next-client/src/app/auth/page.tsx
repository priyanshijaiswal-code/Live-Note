"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Eye, EyeOff, Loader2, Zap, FileText, Users, Sparkles, Check, AlertCircle } from "lucide-react";

type Mode = "login" | "register";

// SVG icons for OAuth providers
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.39.06 2.36.77 3.13.83.48-.1 1.91-.78 3.37-.66 1.02.08 3.88.4 5.72 3.01-5.94 3.59-5.01 11.04.78 9.7zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M11.4 2H2v9.4h9.4V2z" fill="#F35325"/>
    <path d="M22 2h-9.4v9.4H22V2z" fill="#81BC06"/>
    <path d="M11.4 12.6H2V22h9.4v-9.4z" fill="#05A6F0"/>
    <path d="M22 12.6h-9.4V22H22v-9.4z" fill="#FFBA08"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

interface OAuthProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
  textColor: string;
  // Simulated user data for demo
  demoUser: { name: string; email: string; avatar: string };
}

const OAUTH_PROVIDERS: OAuthProvider[] = [
  {
    id: "google",
    name: "Continue with Google",
    icon: <GoogleIcon />,
    color: "bg-white border-gray-200 hover:bg-gray-50",
    hoverColor: "hover:border-gray-300",
    textColor: "text-gray-700",
    demoUser: { name: "Google User", email: "user@gmail.com", avatar: "GU" },
  },
  {
    id: "apple",
    name: "Continue with Apple",
    icon: <AppleIcon />,
    color: "bg-black border-black hover:bg-gray-900",
    hoverColor: "",
    textColor: "text-white",
    demoUser: { name: "Apple User", email: "user@icloud.com", avatar: "AU" },
  },
  {
    id: "microsoft",
    name: "Continue with Microsoft",
    icon: <MicrosoftIcon />,
    color: "bg-[#0078d4] border-[#0078d4] hover:bg-[#106ebe]",
    hoverColor: "",
    textColor: "text-white",
    demoUser: { name: "Microsoft User", email: "user@outlook.com", avatar: "MU" },
  },
  {
    id: "github",
    name: "Continue with GitHub",
    icon: <GitHubIcon />,
    color: "bg-[#24292e] border-[#24292e] hover:bg-[#1a1f24]",
    hoverColor: "",
    textColor: "text-white",
    demoUser: { name: "GitHub User", email: "user@github.com", avatar: "GH" },
  },
  {
    id: "twitter",
    name: "Continue with X (Twitter)",
    icon: <TwitterIcon />,
    color: "bg-black border-black hover:bg-gray-900",
    hoverColor: "",
    textColor: "text-white",
    demoUser: { name: "Twitter User", email: "user@twitter.com", avatar: "TU" },
  },
];

export default function AuthPage() {
  const router = useRouter();
  const setUser = useAppStore((state) => state.setUser);

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [showMoreProviders, setShowMoreProviders] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const primaryProviders = OAUTH_PROVIDERS.slice(0, 3);
  const extraProviders = OAUTH_PROVIDERS.slice(3);

  // Email/password submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (mode === "register" && password !== confirmPassword) {
      return setError("Passwords don't match.");
    }
    if (mode === "register" && password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login" ? { email, password } : { name, email, password };
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Something went wrong."); return; }
      setUser({ id: data.user.id, name: data.user.name, email: data.user.email, token: data.token });
      router.push("/");
    } catch {
      setError("Cannot connect to server. Make sure the backend is running.");
    } finally { setLoading(false); }
  };

  // OAuth login — calls our backend /api/auth/oauth with simulated data
  const handleOAuth = async (provider: OAuthProvider) => {
    setOauthLoading(provider.id);
    setError("");
    try {
      // Try to reach the backend first
      const res = await fetch("http://localhost:5000/api/auth/oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: provider.demoUser.name,
          email: provider.demoUser.email,
          provider: provider.id,
          providerId: `demo_${provider.id}_1234`,
          avatar: provider.demoUser.avatar,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ id: data.user.id, name: data.user.name, email: data.user.email, token: data.token });
      } else {
        throw new Error('backend error');
      }
    } catch {
      // Backend is down or unreachable — use the standardized demo-token
      // so the backend middleware (which checks for 'demo-token') accepts it
      setUser({
        id: "507f1f77bcf86cd799439011", // Standard demo user ID
        name: provider.demoUser.name,
        email: provider.demoUser.email,
        token: "demo-token", 
      });
    } finally {
      setOauthLoading(null);
      router.push("/");
    }
  };

  // Password strength indicator
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return null;
    if (pwd.length < 6) return { label: "Too short", color: "bg-red-500", width: "25%" };
    if (pwd.length < 8) return { label: "Weak", color: "bg-orange-500", width: "50%" };
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { label: "Fair", color: "bg-yellow-500", width: "70%" };
    return { label: "Strong", color: "bg-green-500", width: "100%" };
  };
  const strength = mode === "register" ? getPasswordStrength(password) : null;

  const features = [
    { icon: <Zap size={15} />, text: "Real-time collaboration with live cursors" },
    { icon: <FileText size={15} />, text: "AI-powered writing assistant built-in" },
    { icon: <Users size={15} />, text: "Share & co-edit with your entire team" },
    { icon: <Sparkles size={15} />, text: "Beautiful themes & focus mode" },
  ];

  return (
    <div className="fixed inset-0 overflow-y-auto bg-[#09090b]">
      {/* Background Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-pink-600/12 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1.4s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/6 rounded-full blur-[200px]" />
      </div>

      <div className="min-h-full flex items-center justify-center py-12">
        <div className="w-full max-w-4xl mx-auto px-4 flex flex-col md:flex-row gap-12 items-center z-10">

        {/* Left — Branding */}
        <motion.div
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex-1 hidden md:flex flex-col"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(176,38,255,0.5)]">
              <FileText size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Live<span className="text-purple-400">Note</span></span>
          </div>
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-4">
            Your workspace,{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              supercharged.
            </span>
          </h1>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Collaborate in real-time, get AI assistance, and never miss an action item again.
          </p>
          <div className="space-y-3.5">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i + 0.3, duration: 0.4 }}
                className="flex items-center gap-3 text-gray-300"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">{f.icon}</div>
                <span className="text-sm">{f.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center gap-3">
            <div className="flex -space-x-2">
              {["#8b5cf6", "#ec4899", "#06b6d4", "#10b981"].map((c, i) => (
                <div key={i} style={{ backgroundColor: c }} className="w-7 h-7 rounded-full border-2 border-[#09090b] flex items-center justify-center text-[10px] font-bold text-white">
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">Trusted by <span className="text-gray-300 font-semibold">10,000+</span> teams worldwide</p>
          </div>
        </motion.div>

        {/* Right — Auth card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full md:max-w-sm"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-7 shadow-[0_8px_60px_rgba(0,0,0,0.6)]">

            {/* Mode tabs */}
            <div className="bg-white/5 rounded-xl p-1 flex mb-6 border border-white/10">
              {(["login", "register"] as Mode[]).map((m) => (
                <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    mode === m
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_15px_rgba(176,38,255,0.4)]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {m === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            {/* OAuth providers */}
            <div className="space-y-2.5 mb-5">
              {primaryProviders.map((p) => (
                <OAuthButton key={p.id} provider={p} loading={oauthLoading} onClick={() => handleOAuth(p)} />
              ))}

              {/* More providers toggle */}
              <button
                onClick={() => setShowMoreProviders(!showMoreProviders)}
                className="w-full text-[11px] text-gray-500 hover:text-gray-300 transition py-1 flex items-center justify-center gap-1"
              >
                {showMoreProviders ? "▲ Fewer options" : "▼ More sign-in options"}
              </button>

              <AnimatePresence>
                {showMoreProviders && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    {extraProviders.map((p) => (
                      <OAuthButton key={p.id} provider={p} loading={oauthLoading} onClick={() => handleOAuth(p)} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[11px] text-gray-500 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Forgot password form */}
            <AnimatePresence mode="wait">
              {forgotPassword ? (
                <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <p className="text-sm font-semibold text-white mb-1">Reset Password</p>
                  <p className="text-xs text-gray-500 mb-4">Enter your email and we'll send a reset link.</p>
                  <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/40 transition mb-3" />
                  <button
                    onClick={() => { setSuccess("Reset link sent! (Demo: check your email in production)"); setForgotPassword(false); }}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold py-2.5 rounded-xl transition hover:opacity-90"
                  >Send Reset Link</button>
                  <button onClick={() => setForgotPassword(false)} className="w-full mt-2 text-xs text-gray-500 hover:text-gray-300 transition py-1">← Back to Sign In</button>
                </motion.div>
              ) : (

              // Email/password form
              <motion.form key={mode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit} className="space-y-3.5"
              >
                <AnimatePresence>
                  {mode === "register" && (
                    <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} required={mode === "register"}
                        placeholder="Jane Doe"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/40 transition" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/40 transition" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                    {mode === "login" && (
                      <button type="button" onClick={() => setForgotPassword(true)} className="text-[10px] text-purple-400 hover:text-purple-300 transition">Forgot password?</button>
                    )}
                  </div>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/40 transition" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {/* Password strength bar */}
                  {strength && (
                    <div className="mt-1.5">
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
                      </div>
                      <p className={`text-[10px] mt-0.5 ${strength.color.replace("bg-", "text-")}`}>{strength.label}</p>
                    </div>
                  )}
                </div>

                {/* Confirm password for register */}
                <AnimatePresence>
                  {mode === "register" && (
                    <motion.div key="confirm" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Confirm Password</label>
                      <div className="relative">
                        <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required={mode === "register"}
                          placeholder="••••••••"
                          className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 pr-10 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:ring-1 transition ${
                            confirmPassword && confirmPassword !== password ? "border-red-500/50 focus:ring-red-500/40" : "border-white/10 focus:border-purple-500/60 focus:ring-purple-500/40"
                          }`} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition">
                          {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      <AlertCircle size={12} className="shrink-0" /> {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                      <Check size={12} className="shrink-0" /> {success}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Terms for register */}
                {mode === "register" && (
                  <p className="text-[10px] text-gray-600 leading-relaxed">
                    By creating an account, you agree to our{" "}
                    <span className="text-purple-400 cursor-pointer hover:underline">Terms of Service</span> and{" "}
                    <span className="text-purple-400 cursor-pointer hover:underline">Privacy Policy</span>.
                  </p>
                )}

                <button type="submit" disabled={loading}
                  className="w-full mt-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(176,38,255,0.3)] hover:shadow-[0_0_30px_rgba(176,38,255,0.5)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
                  {loading ? <><Loader2 size={15} className="animate-spin" /> Processing...</> : mode === "login" ? "Sign In to Workspace" : "Create Account"}
                </button>
              </motion.form>
              )}
            </AnimatePresence>

            {/* Demo user */}
            <div className="mt-5 pt-4 border-t border-white/8 text-center">
              <p className="text-gray-600 text-xs mb-2">Just exploring?</p>
              <button
                onClick={() => {
                  setUser({ id: "507f1f77bcf86cd799439011", name: "Demo User", email: "demo@example.com", token: "demo-token" });
                  router.push("/");
                }}
                className="text-xs text-purple-400 hover:text-purple-300 transition font-medium underline underline-offset-4"
              >
                Continue as Demo User →
              </button>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
}

function OAuthButton({ provider, loading, onClick }: { provider: OAuthProvider; loading: string | null; onClick: () => void }) {
  const isLoading = loading === provider.id;
  return (
    <button
      onClick={onClick}
      disabled={loading !== null}
      className={`w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed ${provider.color} ${provider.textColor}`}
    >
      {isLoading ? <Loader2 size={16} className="animate-spin" /> : provider.icon}
      <span className="text-[13px]">{isLoading ? `Connecting to ${provider.id}...` : provider.name}</span>
    </button>
  );
}
