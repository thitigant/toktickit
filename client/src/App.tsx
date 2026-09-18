import { useState, useEffect } from "react";
import { useAuth } from "./auth";
import { getCategories, checkSystem, Category } from "./api";
import { LoginScreen } from "./components/LoginScreen";
import { ChangePasswordScreen } from "./components/ChangePasswordScreen";
import { AppShell } from "./components/AppShell";
import { CreateTicketForm } from "./components/CreateTicketForm";
import { MyTicketsList } from "./components/MyTicketsList";
import { RequesterTicketDetail } from "./components/RequesterTicketDetail";
import { StaffTicketQueue } from "./components/StaffTicketQueue";

type AppView =
  | "login"
  | "change-password"
  | "my-tickets"
  | "create-ticket"
  | "ticket-detail"
  | "queue"
  | "user-management"
  | "check-system";

export default function App() {
  const { user, login, changePassword, logout } = useAuth();
  const [view, setView] = useState<AppView>("login");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  // Check system state
  const [systemCheckResult, setSystemCheckResult] = useState<{ online: boolean; categories: Category[] } | null>(null);
  const [systemCheckError, setSystemCheckError] = useState<string | null>(null);
  const [systemCheckLoading, setSystemCheckLoading] = useState(false);

  // Determine initial view based on auth state
  useEffect(() => {
    if (!user) {
      if (view !== "check-system") {
        setView("login");
      }
      return;
    }
    if (user.mustChangePassword) {
      setView("change-password");
      return;
    }
    // Default view by role
    if (user.role === "REQUESTER") {
      setView("my-tickets");
    } else if (user.role === "IT_STAFF" || user.role === "ADMINISTRATOR") {
      setView("queue");
    }
  }, [user]);

  // Load categories once logged in
  useEffect(() => {
    if (user && !user.mustChangePassword) {
      getCategories().then(setCategories).catch(console.warn);
    }
  }, [user]);

  async function handleLogin(email: string, password: string) {
    await login(email, password);
  }

  async function handleChangePassword(current: string, newPass: string, confirm: string) {
    await changePassword(current, newPass, confirm);
  }

  async function handleLogout() {
    await logout();
    setView("login");
    setSelectedTicketId(null);
  }

  function handleNavigate(targetView: string) {
    if (targetView !== "my-tickets" && targetView !== "ticket-detail") {
      setSelectedTicketId(null);
    }
    setView(targetView as AppView);
  }

  async function handleRunSystemCheck() {
    setSystemCheckLoading(true);
    setSystemCheckError(null);
    try {
      const res = await checkSystem();
      setSystemCheckResult(res);
    } catch (err) {
      setSystemCheckError(err instanceof Error ? err.message : "Health check failed");
    } finally {
      setSystemCheckLoading(false);
    }
  }

  // ── Check System View (Lab 1 compat) ──────────────────────────
  if (view === "check-system") {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">TokTickIT System Status</h2>
            <button
              onClick={() => setView(user ? (user.role === "REQUESTER" ? "my-tickets" : "queue") : "login")}
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              &larr; Back
            </button>
          </div>
          <button
            onClick={handleRunSystemCheck}
            disabled={systemCheckLoading}
            className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-sm mb-4"
          >
            {systemCheckLoading ? "Checking..." : "Check System"}
          </button>
          {systemCheckError && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm mb-3">
              <span className="font-bold">Offline:</span> {systemCheckError}
            </div>
          )}
          {systemCheckResult && (
            <div>
              <div className="p-3 bg-green-50 text-green-800 border border-green-200 rounded-lg text-sm font-semibold mb-3">
                Status: {systemCheckResult.online ? "Online" : "Offline"}
              </div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Categories:</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {systemCheckResult.categories.map((c) => (
                  <li key={c.id}>{c.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Not logged in ────────────────────────────────────────────
  if (!user || view === "login") {
    return (
      <LoginScreen
        onLoginSuccess={() => {
          /* handled by useEffect */
        }}
        loginFn={handleLogin}
        onSystemStatusClick={() => setView("check-system")}
      />
    );
  }

  // ── Force Password Change ─────────────────────────────────────
  if (user.mustChangePassword) {
    return (
      <ChangePasswordScreen
        userName={user.name}
        onPasswordChanged={() => {
          /* handled by useEffect */
        }}
        changePasswordFn={handleChangePassword}
      />
    );
  }

  // ── Main App (Authenticated) ─────────────────────────────────
  return (
    <AppShell
      user={user}
      onLogout={handleLogout}
      activeView={view}
      onNavigate={handleNavigate}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Ticket Detail for All Roles */}
        {view === "ticket-detail" && selectedTicketId && (
          <RequesterTicketDetail
            ticketId={selectedTicketId}
            requesterId={user.id}
            user={user}
            onBack={() => {
              setSelectedTicketId(null);
              if (user.role === "REQUESTER") {
                setView("my-tickets");
              } else {
                setView("queue");
              }
            }}
          />
        )}

        {/* Requester Views */}
        {user.role === "REQUESTER" && view === "my-tickets" && (
          <MyTicketsList
            requesterId={user.id}
            categories={categories}
            onCreateTicketClick={() => setView("create-ticket")}
            onSelectTicket={(id) => {
              setSelectedTicketId(id);
              setView("ticket-detail");
            }}
          />
        )}

        {view === "create-ticket" && (
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <CreateTicketForm
                user={user}
                onSuccess={(ticket) => {
                  setSelectedTicketId(ticket.id);
                  setView("ticket-detail");
                }}
              />
            </div>
          </div>
        )}

        {/* IT Staff / Admin Views */}
        {(user.role === "IT_STAFF" || user.role === "ADMINISTRATOR") && view === "queue" && (
          <StaffTicketQueue
            categories={categories}
            currentUser={{ id: user.id, name: user.name, role: user.role }}
            onSelectTicket={(id) => {
              setSelectedTicketId(id);
              setView("ticket-detail");
            }}
          />
        )}

        {/* Admin: User Management placeholder */}
        {user.role === "ADMINISTRATOR" && view === "user-management" && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">👥</p>
            <p className="text-lg font-semibold text-gray-600">User Management</p>
            <p className="text-sm text-gray-400 mt-1">Coming soon in Issue #26</p>
          </div>
        )}

        {/* Change Password (profile action) */}
        {view === "change-password" && (
          <ChangePasswordScreen
            userName={user.name}
            onPasswordChanged={() => {
              if (user.role === "REQUESTER") setView("my-tickets");
              else setView("queue");
            }}
            changePasswordFn={handleChangePassword}
          />
        )}
      </div>
    </AppShell>
  );
}
