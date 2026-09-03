import { useState } from "react";
import { checkSystem, Category } from "./api.js";

// UI states: idle, loading, success, error.
type UiState = "idle" | "loading" | "success" | "error";

export default function App() {
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
    <div className="container py-5 d-flex justify-content-center">
      <div className="card shadow-sm border-0 p-4" style={{ width: "100%", maxWidth: 500 }}>
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
    </div>
  );
}
