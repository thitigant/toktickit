import { useState } from "react";
import { checkSystem, Category } from "./api.js";
import { CreateTicketForm } from "./components/CreateTicketForm.js";

// UI states: idle, loading, success, error.
type UiState = "idle" | "loading" | "success" | "error";
type ActiveTab = "create-ticket" | "check-system";

export default function App() {
  const [tab, setTab] = useState<ActiveTab>("create-ticket");
  const [state, setState] = useState<UiState>("idle");
  const [categories, setCategories] = useState<Category[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function handleCheck() {
    setState("loading");
    setErrorMsg("");
    try {
      const result = await checkSystem();
      setCategories(result.categories);
      setState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setState("error");
    }
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#F5F7F6" }}>
      {/* Zen Green Header */}
      <header className="navbar navbar-dark shadow-sm px-4 mb-4" style={{ backgroundColor: "#006B3C" }}>
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <span className="navbar-brand mb-0 h1 fw-bold">
            TokTickIT IT Service Desk
          </span>
          <div className="btn-group">
            <button
              className={`btn btn-sm ${tab === "create-ticket" ? "btn-light text-success fw-bold" : "btn-outline-light"}`}
              onClick={() => setTab("create-ticket")}
            >
              Create Ticket
            </button>
            <button
              className={`btn btn-sm ${tab === "check-system" ? "btn-light text-success fw-bold" : "btn-outline-light"}`}
              onClick={() => setTab("check-system")}
            >
              Check System Status
            </button>
          </div>
        </div>
      </header>

      <main className="container py-3 d-flex justify-content-center">
        <div style={{ width: "100%", maxWidth: 650 }}>
          {tab === "create-ticket" && <CreateTicketForm />}

          {tab === "check-system" && (
            <div className="card shadow-sm border-0 p-4">
              <h1 className="h4 text-center fw-bold mb-2">
                TokTickIT IT Service Desk
              </h1>
              <p className="text-center text-muted small mb-4">
                Internal Service Desk Portal for IT Support Requests
              </p>

              <button
                id="check-system-btn"
                className="btn btn-primary w-100 mb-4"
                onClick={handleCheck}
                disabled={state === "loading"}
              >
                {state === "loading" ? "Loading…" : "Check System"}
              </button>

              {state === "success" && (
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
                    {categories.map((cat) => (
                      <li key={cat.id} className="list-group-item d-flex justify-content-between align-items-center">
                        {cat.name}
                        <span className="badge bg-secondary rounded-pill">#{cat.id}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {state === "error" && (
                <div id="status-offline" className="mt-4">
                  <div className="alert alert-danger text-center p-3 mb-4" id="error-message">
                    <div className="fw-bold text-danger">System Error</div>
                    <div className="text-danger small">System Status: Offline ({errorMsg})</div>
                  </div>

                  <div className="bg-light rounded p-3 mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">System Status:</span>
                      <span className="badge bg-danger fs-6">Offline</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
