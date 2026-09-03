import { useState, useEffect, FormEvent } from "react";
import {
  Category,
  RelatedSystem,
  RequesterUser,
  Ticket,
  getRequesters,
  getRelatedSystems,
  checkSystem,
  createTicket,
} from "../api.js";

export function CreateTicketForm() {
  const [requesters, setRequesters] = useState<RequesterUser[]>([]);
  const [selectedRequesterId, setSelectedRequesterId] = useState<number | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [systems, setSystems] = useState<RelatedSystem[]>([]);

  const [categoryId, setCategoryId] = useState<number>(0);
  const [relatedSystemId, setRelatedSystemId] = useState<number>(0);
  const [requestedPriority, setRequestedPriority] = useState<string>("MEDIUM");
  const [summary, setSummary] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [reqList, sysList, status] = await Promise.all([
          getRequesters().catch(() => []),
          getRelatedSystems().catch(() => []),
          checkSystem().catch(() => ({ online: false, categories: [] })),
        ]);

        setRequesters(reqList);
        if (reqList.length > 0) {
          setSelectedRequesterId(reqList[0].id);
        }

        setSystems(sysList);
        if (sysList.length > 0) {
          setRelatedSystemId(sysList[0].id);
        }

        setCategories(status.categories);
        if (status.categories.length > 0) {
          setCategoryId(status.categories[0].id);
        }
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Error loading form data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedRequesterId) {
      setErrorMsg("Please select a Development Requester");
      return;
    }

    if (summary.trim().length < 5 || summary.trim().length > 150) {
      setErrorMsg("Summary must be between 5 and 150 characters");
      return;
    }

    if (description.trim().length < 10 || description.trim().length > 2000) {
      setErrorMsg("Description must be between 10 and 2000 characters");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setCreatedTicket(null);

    try {
      const ticket = await createTicket(
        {
          categoryId,
          relatedSystemId,
          requestedPriority,
          summary: summary.trim(),
          description: description.trim(),
        },
        selectedRequesterId
      );
      setCreatedTicket(ticket);
      setSummary("");
      setDescription("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading ticketing options...</p>
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0 p-4" style={{ backgroundColor: "#FFFFFF", borderRadius: "12px" }}>
      <h2 className="h4 fw-bold mb-3" style={{ color: "#006B3C" }}>
        Create IT Support Ticket
      </h2>
      <p className="text-muted small mb-4">
        Fill in the details below to submit a new IT support request.
      </p>

      {/* Development Requester Selector */}
      <div className="mb-4 p-3 rounded" style={{ backgroundColor: "#EAF6EF", border: "1px solid #0B7A46" }}>
        <label htmlFor="requester-select" className="form-label fw-bold mb-1" style={{ color: "#006B3C" }}>
          Development Requester Context (Simulated Login)
        </label>
        <select
          id="requester-select"
          className="form-select border-success"
          value={selectedRequesterId ?? ""}
          onChange={(e) => setSelectedRequesterId(Number(e.target.value))}
        >
          {requesters.map((req) => (
            <option key={req.id} value={req.id}>
              {req.name} ({req.email}) — {req.department}
            </option>
          ))}
        </select>
      </div>

      {createdTicket && (
        <div className="alert alert-success d-flex align-items-center mb-4" id="ticket-success-alert">
          <div>
            <h5 className="alert-heading mb-1 fw-bold">Ticket Created Successfully!</h5>
            <p className="mb-0">
              Official Ticket Number: <strong>{createdTicket.ticketNumber}</strong>
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger mb-4" id="ticket-error-alert">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row g-3 mb-3">
          {/* Category Dropdown */}
          <div className="col-md-6">
            <label htmlFor="category-id" className="form-label fw-semibold">
              Category <span className="text-danger">*</span>
            </label>
            <select
              id="category-id"
              className="form-select"
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Related System Dropdown */}
          <div className="col-md-6">
            <label htmlFor="system-id" className="form-label fw-semibold">
              Related System <span className="text-danger">*</span>
            </label>
            <select
              id="system-id"
              className="form-select"
              value={relatedSystemId}
              onChange={(e) => setRelatedSystemId(Number(e.target.value))}
              required
            >
              {systems.map((sys) => (
                <option key={sys.id} value={sys.id}>
                  {sys.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority Dropdown */}
        <div className="mb-3">
          <label htmlFor="priority-select" className="form-label fw-semibold">
            Requested Priority
          </label>
          <select
            id="priority-select"
            className="form-select"
            value={requestedPriority}
            onChange={(e) => setRequestedPriority(e.target.value)}
          >
            <option value="LOW">LOW — Minor issue or question</option>
            <option value="MEDIUM">MEDIUM — Standard priority (Default)</option>
            <option value="HIGH">HIGH — Urgent business impact</option>
            <option value="URGENT">URGENT — Critical outage</option>
          </select>
        </div>

        {/* Summary Input */}
        <div className="mb-3">
          <label htmlFor="summary-input" className="form-label fw-semibold">
            Summary <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="summary-input"
            className="form-control"
            placeholder="Brief description of the issue (5–150 characters)"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            minLength={5}
            maxLength={150}
            required
          />
          <div className="form-text text-end">{summary.length}/150 characters</div>
        </div>

        {/* Description Textarea */}
        <div className="mb-4">
          <label htmlFor="description-input" className="form-label fw-semibold">
            Description <span className="text-danger">*</span>
          </label>
          <textarea
            id="description-input"
            className="form-control"
            rows={4}
            placeholder="Detailed explanation of the issue, steps to reproduce, error messages (10–2000 characters)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minLength={10}
            maxLength={2000}
            required
          ></textarea>
          <div className="form-text text-end">{description.length}/2000 characters</div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="submit-ticket-btn"
          className="btn w-100 fw-bold py-2 text-white"
          style={{ backgroundColor: "#006B3C", border: "none" }}
          disabled={submitting}
        >
          {submitting ? "Submitting Ticket..." : "Submit Ticket"}
        </button>
      </form>
    </div>
  );
}
