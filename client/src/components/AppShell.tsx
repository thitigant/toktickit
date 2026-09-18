import { useState, useRef, useEffect } from "react";
import { AuthUser } from "../auth";

interface AppShellProps {
  user: AuthUser;
  onLogout: () => void;
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
}

export function AppShell({ user, onLogout, children, activeView, onNavigate }: AppShellProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [profileOpen]);

  const roleBadge = {
    REQUESTER: { label: "Requester", style: { background: "#e0f2fe", color: "#0369a1" } },
    IT_STAFF: { label: "IT Staff", style: { background: "#dcfce7", color: "#15803d" } },
    ADMINISTRATOR: { label: "Administrator", style: { background: "#f3e8ff", color: "#7e22ce" } },
  }[user.role];

  const initial = user.name.charAt(0).toUpperCase();

  // Role-based nav links
  const navLinks: { id: string; label: string; view: string; icon: string }[] = [];
  if (user.role === "REQUESTER") {
    navLinks.push(
      { id: "nav-my-tickets", label: "My Tickets", view: "my-tickets", icon: "📋" },
      { id: "nav-create-ticket", label: "Create Ticket", view: "create-ticket", icon: "➕" }
    );
  } else if (user.role === "IT_STAFF") {
    navLinks.push(
      { id: "nav-queue", label: "Ticket Queue", view: "queue", icon: "🗂️" },
      { id: "nav-create-ticket", label: "Create Ticket", view: "create-ticket", icon: "➕" }
    );
  } else if (user.role === "ADMINISTRATOR") {
    navLinks.push(
      { id: "nav-queue", label: "Ticket Queue", view: "queue", icon: "🗂️" },
      { id: "nav-user-management", label: "User Management", view: "user-management", icon: "👥" }
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f8fafc" }}>
      {/* Top Navigation */}
      <header
        className="shadow-md z-20 sticky top-0"
        style={{ background: "#065f46" }}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className="flex items-center justify-center rounded-full text-lg"
              style={{ width: 34, height: 34, background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)" }}
            >
              ⏱
            </div>
            <span className="text-white font-bold text-lg tracking-tight hidden sm:block">TokTickIT</span>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-1 flex-1 justify-center">
            {navLinks.map((link) => (
              <button
                key={link.view}
                id={link.id}
                onClick={() => onNavigate(link.view)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeView === link.view
                    ? "bg-white text-emerald-900 shadow-sm font-semibold"
                    : "text-emerald-100 hover:bg-emerald-700/60"
                }`}
              >
                <span>{link.icon}</span>
                <span className="hidden sm:inline">{link.label}</span>
              </button>
            ))}
          </nav>

          {/* Profile Dropdown */}
          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <button
              id="profile-dropdown-btn"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-emerald-700/50 transition-all"
            >
              {/* Avatar */}
              <div
                className="flex items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ width: 30, height: 30, background: "#047857", border: "2px solid rgba(255,255,255,0.4)" }}
              >
                {initial}
              </div>
              <div className="hidden md:flex flex-col items-start leading-tight">
                <span className="text-white text-xs font-semibold">{user.name}</span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded font-medium"
                  style={roleBadge.style}
                >
                  {roleBadge.label}
                </span>
              </div>
              <svg className="w-3.5 h-3.5 text-emerald-200 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-xl shadow-xl py-2 z-50"
                style={{ background: "#fff", border: "1px solid #e2e8f0" }}
              >
                {/* User info header */}
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                {/* Menu Items */}
                <button
                  id="profile-change-password-btn"
                  onClick={() => { setProfileOpen(false); onNavigate("change-password"); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  🔐 Change Password
                </button>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    id="logout-btn"
                    onClick={() => { setProfileOpen(false); onLogout(); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-red-50 transition-colors"
                    style={{ color: "#dc2626" }}
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
