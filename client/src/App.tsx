import { useState, useEffect } from "react";
import { checkSystem, getRequesters, Category, RequesterUser } from "./api.js";
import { CreateTicketForm } from "./components/CreateTicketForm.js";
import { MyTicketsList } from "./components/MyTicketsList.js";

type ActiveTab = "my-tickets" | "create-ticket" | "check-system";

export default function App() {
  const [tab, setTab] = useState<ActiveTab>("my-tickets");
  const [categories, setCategories] = useState<Category[]>([]);
  const [requesters, setRequesters] = useState<RequesterUser[]>([]);
  const [selectedRequesterId, setSelectedRequesterId] = useState<number | null>(null);

  // System check state
  const [checkState, setCheckState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [checkCategories, setCheckCategories] = useState<Category[]>([]);
  const [checkError, setCheckError] = useState<string>("");

  useEffect(() => {
    // Load categories & requesters on mount
    async function init() {
      try {
        const [reqList, sysStatus] = await Promise.all([
          getRequesters(),
          checkSystem(),
        ]);
        setRequesters(reqList);
        setCategories(sysStatus.categories);
        if (reqList.length > 0 && selectedRequesterId === null) {
          setSelectedRequesterId(reqList[0].id);
        }
      } catch (err) {
        console.error("Initialization error:", err);
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

  const selectedRequester = requesters.find((r) => r.id === selectedRequesterId);

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#F5F7F6" }}>
      {/* Zen Green Navigation Header */}
      <header className="navbar navbar-expand-lg navbar-dark shadow-sm px-4" style={{ backgroundColor: "#006B3C" }}>
        <div className="container-fluid d-flex flex-wrap justify-content-between align-items-center gap-2">
          {/* Identity */}
          <div className="d-flex align-items-center gap-2">
            <span className="fs-4">🎫</span>
            <span className="navbar-brand mb-0 h1 fw-bold tracking-tight">
              TokTickIT <span className="fw-normal fs-6 text-light opacity-75">IT Service Desk</span>
            </span>
          </div>

          {/* Navigation Links */}
          <div className="btn-group my-1">
            <button
              id="nav-my-tickets-btn"
              className={`btn btn-sm ${
                tab === "my-tickets"
                  ? "btn-light text-success fw-bold shadow-sm"
                  : "btn-outline-light"
              }`}
              onClick={() => setTab("my-tickets")}
            >
              📋 My Tickets
            </button>
            <button
              id="nav-create-ticket-btn"
              className={`btn btn-sm ${
                tab === "create-ticket"
                  ? "btn-light text-success fw-bold shadow-sm"
                  : "btn-outline-light"
              }`}
              onClick={() => setTab("create-ticket")}
            >
              ➕ Create Ticket
            </button>
            <button
              id="nav-check-system-btn"
              className={`btn btn-sm ${
                tab === "check-system"
                  ? "btn-light text-success fw-bold shadow-sm"
                  : "btn-outline-light"
              }`}
              onClick={() => setTab("check-system")}
            >
              ⚙️ System Status
            </button>
          </div>

          {/* Development Requester Selector Context */}
          <div className="d-flex align-items-center gap-2 bg-black bg-opacity-25 px-3 py-1 rounded border border-light border-opacity-25">
            <span className="text-light small fw-bold">👤 Requester:</span>
            <select
              id="app-requester-selector"
              className="form-select form-select-sm bg-light text-dark fw-bold border-0"
              style={{ minWidth: 180, cursor: "pointer" }}
              value={selectedRequesterId ?? ""}
              onChange={(e) => setSelectedRequesterId(Number(e.target.value))}
            >
              {requesters.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.department})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container flex-grow-1 py-4">
        {/* Requester Context Info Banner */}
        {selectedRequester && (
          <div
            className="alert alert-success d-flex justify-content-between align-items-center py-2 px-3 mb-4 rounded shadow-sm"
            style={{ backgroundColor: "#EAF6EF", borderColor: "#0B7A46", color: "#006B3C" }}
          >
            <div className="small">
              <strong>Testing Context:</strong> Logged in as <strong>{selectedRequester.name}</strong> ({selectedRequester.email} &bull; {selectedRequester.department})
            </div>
            <span className="badge bg-success bg-opacity-75 text-white">Dev Requester Mode</span>
          </div>
        )}

        {/* Tab 1: My Tickets */}
        {tab === "my-tickets" && selectedRequesterId && (
          <MyTicketsList
            requesterId={selectedRequesterId}
            categories={categories}
            onCreateTicketClick={() => setTab("create-ticket")}
          />
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
