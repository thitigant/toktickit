import { useState, useEffect } from "react";
import { checkSystem, getRequesters, Category, RequesterUser } from "./api";
import { CreateTicketForm } from "./components/CreateTicketForm";
import { MyTicketsList } from "./components/MyTicketsList";
import { RequesterTicketDetail } from "./components/RequesterTicketDetail";

type ActiveTab = "my-tickets" | "create-ticket" | "check-system";
type AppScreen = "select-requester" | "main";

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("select-requester");
  const [tab, setTab] = useState<ActiveTab>("my-tickets");
  const [categories, setCategories] = useState<Category[]>([]);
  const [requesters, setRequesters] = useState<RequesterUser[]>([]);
  const [selectedRequesterId, setSelectedRequesterId] = useState<number | null>(null);
  const [pendingRequesterId, setPendingRequesterId] = useState<number | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  // System check state
  const [checkState, setCheckState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [checkCategories, setCheckCategories] = useState<Category[]>([]);
  const [checkError, setCheckError] = useState<string>("");

  useEffect(() => {
    async function init() {
      try {
        const reqList = await getRequesters();
        setRequesters(reqList);
        if (reqList.length > 0) {
          setPendingRequesterId(reqList[0].id);
          setSelectedRequesterId(reqList[0].id);
        }
      } catch (err) {
        console.error("Error fetching requesters:", err);
      }

      try {
        const sysStatus = await checkSystem();
        setCategories(sysStatus.categories);
      } catch (err) {
        console.warn("System check skipped during init:", err);
      }
    }
    init();
  }, []);

  async function handleCheckSystem() {
    setCheckState("loading");
    setCheckError("");
    try {
      const result = await checkSystem();
      setCheckCategories(result.categories);
      setCheckState("success");
    } catch (err) {
      setCheckError(err instanceof Error ? err.message : "Unknown error");
      setCheckState("error");
    }
  }

  const handleRequesterChange = (newId: number) => {
    setSelectedRequesterId(newId);
    setPendingRequesterId(newId);
    setSelectedTicketId(null);
  };

  const handleSelectTab = (newTab: ActiveTab) => {
    setTab(newTab);
    if (newTab !== "my-tickets") {
      setSelectedTicketId(null);
    }
  };

  const handleContinue = () => {
    if (pendingRequesterId !== null) {
      setSelectedRequesterId(pendingRequesterId);
      setScreen("main");
    }
  };

  const handleCancel = () => {
    if (requesters.length > 0) {
      setPendingRequesterId(requesters[0].id);
    }
  };

  const selectedRequester = requesters.find((r) => r.id === selectedRequesterId);

  // ─── SCREEN: Select Development Requester ───────────────────────────────────
  if (screen === "select-requester") {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#F5F7F6" }}>
        {/* Header */}
        <header
          className="navbar navbar-dark px-4 py-2 shadow-sm"
          style={{ backgroundColor: "#006B3C" }}
        >
          <div className="container-fluid d-flex align-items-center justify-content-between">
            {/* Brand */}
            <div className="d-flex align-items-center gap-2">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  border: "2px solid rgba(255,255,255,0.3)",
                }}
              >
                <span style={{ fontSize: 18 }}>⏱</span>
              </div>
              <span className="navbar-brand mb-0 fw-bold fs-5">
                TokTickIT
              </span>
            </div>

            {/* Nav links */}
            <div className="btn-group my-1">
              <button
                id="nav-my-tickets-btn"
                className={`btn btn-sm ${tab === "my-tickets" ? "btn-light text-success fw-bold shadow-sm" : "btn-outline-light"}`}
                onClick={() => { handleSelectTab("my-tickets"); setScreen("main"); }}
              >
                📋 My Tickets
              </button>
              <button
                id="nav-create-ticket-btn"
                className={`btn btn-sm ${tab === "create-ticket" ? "btn-light text-success fw-bold shadow-sm" : "btn-outline-light"}`}
                onClick={() => { handleSelectTab("create-ticket"); setScreen("main"); }}
              >
                ➕ Create Ticket
              </button>
              <button
                id="nav-check-system-btn"
                className={`btn btn-sm ${tab === "check-system" ? "btn-light text-success fw-bold shadow-sm" : "btn-outline-light"}`}
                onClick={() => { handleSelectTab("check-system"); setScreen("main"); }}
              >
                ⚙️ System Status
              </button>
            </div>

            {/* Profile placeholder (neutral before selection) */}
            <div className="d-flex align-items-center gap-2 text-white-50 small">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: 28,
                  height: 28,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                👤
              </div>
              <span className="text-light fw-medium">Profile ▾</span>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="border-bottom bg-white px-4 py-2">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 small">
              <li className="breadcrumb-item">
                <span style={{ color: "#006B3C" }}>🏠</span>
              </li>
              <li className="breadcrumb-item active text-muted" aria-current="page">
                Development Requester Selection
              </li>
            </ol>
          </nav>
        </div>

        {/* Main content – centered card */}
        <main className="flex-grow-1 d-flex align-items-start justify-content-center py-5 px-3">
          <div
            className="card border shadow-sm rounded-3 p-4"
            style={{ width: "100%", maxWidth: 500, backgroundColor: "#fff", marginTop: "2rem" }}
          >
            {/* Icon */}
            <div className="text-center mb-3">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle"
                style={{ width: 64, height: 64, backgroundColor: "#E8F5EE", border: "2px solid #C8E6D6" }}
              >
                <span style={{ fontSize: 30 }}>👥</span>
              </div>
            </div>

            {/* Title & Subtitle */}
            <h1 className="h5 fw-bold text-center mb-1" style={{ color: "#1a1a1a" }}>
              Select Development Requester
            </h1>
            <p className="text-center text-muted small mb-4">
              Choose a development requester to simulate the current requester context for Lab 2.<br />
              This is for testing only and is not a login screen.
            </p>

            <hr className="my-3" />

            {/* Dropdown */}
            <div className="mb-3">
              <label
                htmlFor="dev-requester-select"
                className="form-label small fw-semibold"
                style={{ color: "#1a1a1a" }}
              >
                Development Requester <span className="text-danger">*</span>
              </label>
              <select
                id="dev-requester-select"
                className="form-select"
                value={pendingRequesterId ?? ""}
                onChange={(e) => setPendingRequesterId(Number(e.target.value))}
              >
                {requesters.length === 0 && (
                  <option value="">Loading requesters…</option>
                )}
                {requesters.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.department ? `(${r.department})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Info alert */}
            <div
              className="d-flex align-items-center gap-2 rounded px-3 py-2 mb-4 small"
              style={{ backgroundColor: "#EAF6EE", border: "1px solid #A8D5B5", color: "#006B3C" }}
            >
              <span>ℹ️</span>
              <span>Only active development requesters are shown.</span>
            </div>

            {/* Auth notice */}
            <div
              className="d-flex align-items-start gap-3 rounded px-3 py-3 mb-4"
              style={{ backgroundColor: "#FAFAFA", border: "1px solid #E0E0E0" }}
            >
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-circle"
                style={{ width: 36, height: 36, backgroundColor: "#E8F0FE", border: "1px solid #C5D5F5" }}
              >
                🛡️
              </div>
              <div>
                <p className="mb-1 fw-semibold small" style={{ color: "#1a1a1a" }}>
                  Authentication coming in Lab 3
                </p>
                <p className="mb-0 text-muted" style={{ fontSize: "0.8rem" }}>
                  In Lab 3, this selection will be replaced with secure authentication
                  so you can access the system with your own account.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="d-flex justify-content-end gap-2">
              <button
                id="requester-cancel-btn"
                className="btn btn-outline-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                id="requester-continue-btn"
                className="btn fw-semibold text-white d-flex align-items-center gap-1"
                style={{ backgroundColor: "#006B3C", border: "none", padding: "8px 20px" }}
                onClick={handleContinue}
                disabled={pendingRequesterId === null || requesters.length === 0}
              >
                Continue →
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── SCREEN: Main App ────────────────────────────────────────────────────────
  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#F5F7F6" }}>
      {/* Zen Green Navigation Header */}
      <header className="navbar navbar-expand-lg navbar-dark shadow-sm px-4" style={{ backgroundColor: "#006B3C" }}>
        <div className="container-fluid d-flex flex-wrap justify-content-between align-items-center gap-2">
          {/* Identity */}
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: 36, height: 36, backgroundColor: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)" }}
            >
              <span style={{ fontSize: 18 }}>⏱</span>
            </div>
            <span className="navbar-brand mb-0 fw-bold fs-5">
              TokTickIT
            </span>
          </div>

          {/* Navigation Links */}
          <div className="btn-group my-1">
            <button
              id="nav-my-tickets-btn"
              className={`btn btn-sm ${tab === "my-tickets" ? "btn-light text-success fw-bold shadow-sm" : "btn-outline-light"}`}
              onClick={() => handleSelectTab("my-tickets")}
            >
              📋 My Tickets
            </button>
            <button
              id="nav-create-ticket-btn"
              className={`btn btn-sm ${tab === "create-ticket" ? "btn-light text-success fw-bold shadow-sm" : "btn-outline-light"}`}
              onClick={() => handleSelectTab("create-ticket")}
            >
              ➕ Create Ticket
            </button>
            <button
              id="nav-check-system-btn"
              className={`btn btn-sm ${tab === "check-system" ? "btn-light text-success fw-bold shadow-sm" : "btn-outline-light"}`}
              onClick={() => handleSelectTab("check-system")}
            >
              ⚙️ System Status
            </button>
          </div>

          {/* Profile Badge (bound to selectedRequester.name) */}
          <div
            className="d-flex align-items-center gap-2 text-white small"
            style={{ cursor: "pointer" }}
            onClick={() => setScreen("select-requester")}
            title="Click to switch requester identity"
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: 30,
                height: 30,
                backgroundColor: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              👤
            </div>
            <span className="fw-medium">{selectedRequester ? `${selectedRequester.name} ▾` : "Profile ▾"}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container flex-grow-1 py-4">
        {/* Requester Context Info Banner */}
        {selectedRequester && (
          <div
            className="alert alert-success d-flex flex-wrap justify-content-between align-items-center py-2 px-3 mb-4 rounded shadow-sm"
            style={{ backgroundColor: "#EAF6EF", borderColor: "#0B7A46", color: "#006B3C" }}
          >
            <div className="small d-flex align-items-center gap-2 flex-wrap">
              <span><strong>Testing Context:</strong> Logged in as <strong>{selectedRequester.name}</strong> ({selectedRequester.email} &bull; {selectedRequester.department})</span>
              <div className="d-inline-flex align-items-center gap-1 ms-2">
                <span className="text-muted small">Switch:</span>
                <select
                  id="app-requester-selector"
                  className="form-select form-select-sm py-0 px-2 text-dark fw-semibold border-success"
                  style={{ width: "auto", fontSize: "0.82rem", cursor: "pointer" }}
                  value={selectedRequesterId ?? ""}
                  onChange={(e) => handleRequesterChange(Number(e.target.value))}
                >
                  {requesters.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <span className="badge bg-success bg-opacity-75 text-white">Dev Requester Mode</span>
          </div>
        )}

        {/* Tab 1: My Tickets & Ticket Detail View */}
        {tab === "my-tickets" && selectedRequesterId && (
          selectedTicketId ? (
            <RequesterTicketDetail
              ticketId={selectedTicketId}
              requesterId={selectedRequesterId}
              onBack={() => setSelectedTicketId(null)}
            />
          ) : (
            <MyTicketsList
              requesterId={selectedRequesterId}
              categories={categories}
              onCreateTicketClick={() => handleSelectTab("create-ticket")}
              onSelectTicket={(id) => setSelectedTicketId(id)}
            />
          )
        )}

        {/* Tab 2: Create Ticket */}
        {tab === "create-ticket" && (
          <div className="d-flex justify-content-center">
            <div style={{ width: "100%", maxWidth: 680 }}>
              <CreateTicketForm />
            </div>
          </div>
        )}

        {/* Tab 3: Check System Status */}
        {tab === "check-system" && (
          <div className="d-flex justify-content-center">
            <div style={{ width: "100%", maxWidth: 650 }}>
              <div className="card shadow-sm border-0 p-4">
                <h1 className="h4 text-center fw-bold mb-2">TokTickIT IT Service Desk</h1>
                <p className="text-center text-muted small mb-4">
                  Internal Service Desk Portal for IT Support Requests
                </p>

                <button
                  id="check-system-btn"
                  className="btn btn-primary w-100 mb-4"
                  onClick={handleCheckSystem}
                  disabled={checkState === "loading"}
                >
                  {checkState === "loading" ? "Loading…" : "Check System"}
                </button>

                {checkState === "success" && (
                  <div id="status-online">
                    <div className="bg-light rounded p-3 mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold">System Status:</span>
                        <span className="badge bg-success fs-6">Online</span>
                      </div>
                      <p className="text-center text-muted small mb-0">Service: TokTickIT API</p>
                    </div>

                    <h2 className="h6 text-center fw-bold mb-3">Supported Request Categories</h2>
                    <ul id="category-list" className="list-group list-group-flush border rounded">
                      {checkCategories.map((cat) => (
                        <li key={cat.id} className="list-group-item d-flex justify-content-between align-items-center">
                          {cat.name}
                          <span className="badge bg-secondary rounded-pill">#{cat.id}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {checkState === "error" && (
                  <div id="status-offline" className="mt-4">
                    <div className="alert alert-danger text-center p-3 mb-4" id="error-message">
                      <div className="fw-bold text-danger">System Error</div>
                      <div className="text-danger small">System Status: Offline ({checkError})</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
