import { useState, FormEvent } from "react";

interface ChangePasswordScreenProps {
  userName: string;
  onPasswordChanged: () => void;
  changePasswordFn: (current: string, newPass: string, confirm: string) => Promise<void>;
}

export function ChangePasswordScreen({
  userName,
  onPasswordChanged,
  changePasswordFn,
}: ChangePasswordScreenProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checks = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    numOrSpecial: /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword),
    match: newPassword === confirmPassword && confirmPassword.length > 0,
  };

  const allChecksPass = Object.values(checks).every(Boolean);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (!allChecksPass) {
      setError("Please meet all password requirements.");
      return;
    }
    setLoading(true);
    try {
      await changePasswordFn(currentPassword, newPassword, confirmPassword);
      onPasswordChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setLoading(false);
    }
  }

  const CheckItem = ({ ok, label }: { ok: boolean; label: string }) => (
    <div className={`flex items-center gap-2 text-xs ${ok ? "text-emerald-700" : "text-gray-400"}`}>
      <span>{ok ? "✅" : "○"}</span>
      <span>{label}</span>
    </div>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 100%)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center rounded-full mb-4"
            style={{ width: 72, height: 72, background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)" }}
          >
            <span style={{ fontSize: 34 }}>🔐</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">TokTickIT</h1>
          <p className="text-emerald-200 text-sm mt-1">IT Service Desk Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="mb-5 p-4 rounded-xl" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-semibold text-amber-800 text-sm">Password Change Required</p>
                <p className="text-amber-700 text-xs mt-0.5">
                  Welcome, <strong>{userName}</strong>. Your account was set up with an initial password. Please create a new secure password before continuing.
                </p>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              className="flex items-center gap-2 rounded-lg px-4 py-3 mb-5 text-sm"
              style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626" }}
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label htmlFor="current-password" className="block text-sm font-semibold text-gray-700 mb-1">
                Current (Initial) Password
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Your initial password"
                disabled={loading}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-emerald-500"
              />
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="new-password" className="block text-sm font-semibold text-gray-700 mb-1">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create a strong password"
                disabled={loading}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-emerald-500"
              />
              {/* Strength Checklist */}
              {newPassword.length > 0 && (
                <div className="mt-2 p-3 rounded-lg space-y-1.5" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <CheckItem ok={checks.length} label="Minimum 8 characters" />
                  <CheckItem ok={checks.upper} label="Contains uppercase letter (A-Z)" />
                  <CheckItem ok={checks.lower} label="Contains lowercase letter (a-z)" />
                  <CheckItem ok={checks.numOrSpecial} label="Contains number or special character" />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                disabled={loading}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-emerald-500"
              />
              {confirmPassword.length > 0 && (
                <div className="mt-1">
                  <CheckItem ok={checks.match} label="Passwords match" />
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              id="change-password-submit-btn"
              type="submit"
              disabled={loading || !allChecksPass}
              className="w-full py-2.5 px-4 rounded-lg text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-2"
              style={{
                background: loading || !allChecksPass ? "#9ca3af" : "#065f46",
                cursor: loading || !allChecksPass ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Saving…
                </>
              ) : (
                "Continue to App →"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
