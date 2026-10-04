import { useState, FormEvent } from "react";

interface LoginScreenProps {
  onLoginSuccess: () => void;
  loginFn: (email: string, password: string) => Promise<void>;
  onSystemStatusClick?: () => void;
}

export function LoginScreen({ onLoginSuccess, loginFn, onSystemStatusClick }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    try {
      await loginFn(email.trim().toLowerCase(), password);
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        background: "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}
    >
      {/* Card */}
      <div style={{ width: "100%", maxWidth: "420px", margin: "0 auto" }}>
        {/* Logo + Title */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            className="inline-flex items-center justify-center rounded-full mb-4"
            style={{ width: 72, height: 72, background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)", display: "inline-flex", alignItems: "center", justifyCenter: "center", borderRadius: "50%", margin: "0 auto 1rem" }}
          >
            <span style={{ fontSize: 34 }}>⏱</span>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#ffffff", margin: 0, letterSpacing: "-0.025em" }}>TokTickIT</h1>
          <p style={{ color: "#a7f3d0", fontSize: "0.875rem", marginTop: "0.25rem" }}>IT Service Desk Portal</p>
        </div>

        <div style={{ background: "#ffffff", borderRadius: "1rem", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)", padding: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#111827", margin: "0 0 0.25rem" }}>Sign in to your account</h2>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0 0 1.5rem" }}>Enter your credentials to access the portal.</p>

          {/* Error Alert */}
          {error && (
            <div
              id="login-error-alert"
              style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: "0.5rem", padding: "0.75rem 1rem", marginBottom: "1.25rem", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Email */}
            <div>
              <label htmlFor="login-email" style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.375rem" }}>
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@toktickit.com"
                disabled={loading}
                style={{ display: "block", width: "100%", padding: "0.625rem 0.875rem", fontSize: "0.875rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", boxSizing: "border-box", outline: "none" }}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.375rem" }}>
                Password
              </label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  style={{ display: "block", width: "100%", padding: "0.625rem 2.75rem 0.625rem 0.875rem", fontSize: "0.875rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", boxSizing: "border-box", outline: "none" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}
                  aria-label="Toggle password visibility"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg style={{ width: "20px", height: "20px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg style={{ width: "20px", height: "20px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: "100%", padding: "0.625rem 1rem", borderRadius: "0.5rem", color: "#ffffff", fontWeight: "600", fontSize: "0.875rem", border: "none", background: loading ? "#9ca3af" : "#065f46", cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.75rem", marginTop: "1.5rem", padding: "0 0.25rem" }}>

          <p className="text-emerald-300">
            © 2026 TokTickIT — Internal IT Service Desk
          </p>
          <button
            type="button"
            onClick={onSystemStatusClick}
            className="text-emerald-200 hover:text-white underline"
          >
            System Status
          </button>
        </div>
      </div>
    </div>
  );
}
