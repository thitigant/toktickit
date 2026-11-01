import { useState, useEffect, useCallback } from "react";
import {
  getActionsTaken,
  createActionTaken,
  updateActionTaken,
  ActionTaken,
  CreateActionTakenInput,
  UpdateActionTakenInput,
} from "../api";

interface ActionsTakenProps {
  ticketId: number;
  isStaffOrAdmin: boolean;
  formatDateTime: (dateStr?: string) => string;
}

type FormMode = "idle" | "create" | "edit";

const emptyForm: CreateActionTakenInput = {
  actionDateTime: "",
  actionDescription: "",
  result: "",
  followUpRequired: false,
  followUpNote: "",
  attachmentNotes: "",
};

export function ActionsTaken({ ticketId, isStaffOrAdmin, formatDateTime }: ActionsTakenProps) {
  const [actions, setActions] = useState<ActionTaken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<FormMode>("idle");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateActionTakenInput>({ ...emptyForm });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchActions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getActionsTaken(ticketId);
      setActions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load actions taken");
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  const openCreateForm = () => {
    const now = new Date();
    const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setForm({ ...emptyForm, actionDateTime: localISO });
    setEditingId(null);
    setFormMode("create");
    setFormError(null);
  };

  const openEditForm = (action: ActionTaken) => {
    const dt = action.actionDateTime
      ? new Date(new Date(action.actionDateTime).getTime() - new Date().getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
      : "";
    setForm({
      actionDateTime: dt,
      actionDescription: action.actionDescription,
      result: action.result,
      followUpRequired: action.followUpRequired,
      followUpNote: action.followUpNote || "",
      attachmentNotes: action.attachmentNotes || "",
    });
    setEditingId(action.id);
    setFormMode("edit");
    setFormError(null);
  };

  const cancelForm = () => {
    setFormMode("idle");
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError(null);
  };

  const validate = (): string | null => {
    if (!form.actionDescription || form.actionDescription.trim().length < 5) {
      return "Action description must be at least 5 characters.";
    }
    if (!form.result || form.result.trim().length < 3) {
      return "Result must be at least 3 characters.";
    }
    if (form.followUpRequired && (!form.followUpNote || !form.followUpNote.trim())) {
      return "Follow-up note is required when follow-up is checked.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      if (formMode === "create") {
        await createActionTaken(ticketId, {
          actionDateTime: form.actionDateTime || undefined,
          actionDescription: form.actionDescription.trim(),
          result: form.result.trim(),
          followUpRequired: form.followUpRequired,
          followUpNote: form.followUpRequired ? form.followUpNote?.trim() : undefined,
          attachmentNotes: form.attachmentNotes?.trim() || undefined,
        });
      } else if (formMode === "edit" && editingId) {
        const updates: UpdateActionTakenInput = {
          actionDescription: form.actionDescription.trim(),
          result: form.result.trim(),
          followUpRequired: form.followUpRequired,
          followUpNote: form.followUpRequired ? form.followUpNote?.trim() : undefined,
          attachmentNotes: form.attachmentNotes?.trim() || undefined,
        };
        await updateActionTaken(ticketId, editingId, updates);
      }
      cancelForm();
      await fetchActions();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ─────────────────────────────────────────

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border spinner-border-sm text-success" role="status" />
        <span className="ms-2 text-muted small">Loading actions taken...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger small py-2" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Header with Add button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0" style={{ color: "#0F5132" }}>
          📋 Actions Taken{" "}
          <span className="badge bg-success rounded-pill ms-1">{actions.length}</span>
        </h6>
        {isStaffOrAdmin && formMode === "idle" && (
          <button
            type="button"
            className="btn btn-success btn-sm fw-semibold"
            onClick={openCreateForm}
            id="add-action-btn"
          >
            + Add Action
          </button>
        )}
      </div>

      {/* Create / Edit Form */}
      {formMode !== "idle" && (
        <div
          className="card border rounded-3 mb-4 shadow-sm"
          style={{ backgroundColor: "#F0FDF4", borderColor: "#86EFAC" }}
        >
          <div className="card-body p-3">
            <h6 className="fw-bold mb-3" style={{ color: "#0F5132" }}>
              {formMode === "create" ? "➕ New Action Taken" : "✏️ Edit Action Taken"}
            </h6>
            {formError && (
              <div className="alert alert-danger small py-2 mb-3" role="alert">
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              {/* Action Date/Time */}
              <div className="mb-3">
                <label className="form-label small fw-bold">Action Date/Time</label>
                <input
                  type="datetime-local"
                  className="form-control form-control-sm"
                  value={form.actionDateTime || ""}
                  onChange={(e) => setForm({ ...form, actionDateTime: e.target.value })}
                  id="action-datetime-input"
                />
              </div>

              {/* Action Description */}
              <div className="mb-3">
                <label className="form-label small fw-bold">
                  Action Description <span className="text-danger">*</span>
                </label>
                <textarea
                  rows={3}
                  className="form-control form-control-sm"
                  placeholder="Describe the action taken (min 5 characters)..."
                  value={form.actionDescription}
                  onChange={(e) => setForm({ ...form, actionDescription: e.target.value })}
                  required
                  id="action-description-input"
                />
              </div>

              {/* Result */}
              <div className="mb-3">
                <label className="form-label small fw-bold">
                  Result <span className="text-danger">*</span>
                </label>
                <textarea
                  rows={2}
                  className="form-control form-control-sm"
                  placeholder="Describe the result (min 3 characters)..."
                  value={form.result}
                  onChange={(e) => setForm({ ...form, result: e.target.value })}
                  required
                  id="action-result-input"
                />
              </div>

              {/* Follow-up Required */}
              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={form.followUpRequired}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        followUpRequired: e.target.checked,
                        followUpNote: e.target.checked ? form.followUpNote : "",
                      })
                    }
                    id="follow-up-checkbox"
                  />
                  <label className="form-check-label small fw-bold" htmlFor="follow-up-checkbox">
                    Follow-Up Required
                  </label>
                </div>
              </div>

              {/* Follow-up Note (conditional) */}
              {form.followUpRequired && (
                <div className="mb-3">
                  <label className="form-label small fw-bold">
                    Follow-Up Note <span className="text-danger">*</span>
                  </label>
                  <textarea
                    rows={2}
                    className="form-control form-control-sm"
                    placeholder="Describe the follow-up action needed..."
                    value={form.followUpNote || ""}
                    onChange={(e) => setForm({ ...form, followUpNote: e.target.value })}
                    required
                    id="follow-up-note-input"
                  />
                </div>
              )}

              {/* Attachment Notes */}
              <div className="mb-3">
                <label className="form-label small fw-bold">Attachment Notes</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Optional reference to attachments..."
                  value={form.attachmentNotes || ""}
                  onChange={(e) => setForm({ ...form, attachmentNotes: e.target.value })}
                  id="attachment-notes-input"
                />
              </div>

              {/* Buttons */}
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={cancelForm}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success btn-sm fw-bold px-4"
                  disabled={submitting}
                  id="save-action-btn"
                >
                  {submitting ? "Saving..." : "Save Action Taken"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Actions List */}
      {actions.length === 0 ? (
        <div className="text-center py-4 text-muted small">
          <p className="mb-0">No actions taken yet for this ticket.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="d-none d-md-block">
            <div className="table-responsive">
              <table className="table table-hover table-sm align-middle" id="actions-taken-table">
                <thead style={{ backgroundColor: "#F0FDF4" }}>
                  <tr>
                    <th className="small fw-bold text-muted" style={{ width: "160px" }}>Date/Time</th>
                    <th className="small fw-bold text-muted">Description</th>
                    <th className="small fw-bold text-muted">Result</th>
                    <th className="small fw-bold text-muted" style={{ width: "130px" }}>Performed By</th>
                    <th className="small fw-bold text-muted" style={{ width: "140px" }}>Follow-Up</th>
                    <th className="small fw-bold text-muted" style={{ width: "130px" }}>Attachment Notes</th>
                    {isStaffOrAdmin && (
                      <th className="small fw-bold text-muted text-center" style={{ width: "70px" }}>Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {actions.map((action) => (
                    <tr key={action.id}>
                      <td className="small">{formatDateTime(action.actionDateTime)}</td>
                      <td className="small">{action.actionDescription}</td>
                      <td className="small">{action.result}</td>
                      <td className="small">{action.performedBy?.name || `User #${action.performedById}`}</td>
                      <td className="small">
                        {action.followUpRequired ? (
                          <span>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: "#FEF3C7",
                                color: "#D97706",
                                border: "1px solid #FBBF24",
                              }}
                            >
                              Required
                            </span>
                            {action.followUpNote && (
                              <div className="text-muted mt-1" style={{ fontSize: "0.75rem" }}>
                                {action.followUpNote}
                              </div>
                            )}
                          </span>
                        ) : (
                          <span
                            className="badge"
                            style={{
                              backgroundColor: "#E2E8F0",
                              color: "#475569",
                              border: "1px solid #CBD5E1",
                            }}
                          >
                            None
                          </span>
                        )}
                      </td>
                      <td className="small text-muted">{action.attachmentNotes || "—"}</td>
                      {isStaffOrAdmin && (
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-outline-success btn-sm"
                            onClick={() => openEditForm(action)}
                            title="Edit action"
                          >
                            ✏️
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="d-md-none">
            <div className="list-group">
              {actions.map((action) => (
                <div key={action.id} className="list-group-item p-3 border rounded-3 mb-2 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="small text-muted">{formatDateTime(action.actionDateTime)}</span>
                    {isStaffOrAdmin && (
                      <button
                        type="button"
                        className="btn btn-outline-success btn-sm py-0 px-2"
                        onClick={() => openEditForm(action)}
                      >
                        ✏️
                      </button>
                    )}
                  </div>
                  <div className="fw-semibold small mb-1">{action.actionDescription}</div>
                  <div className="small text-muted mb-2">
                    <strong>Result:</strong> {action.result}
                  </div>
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    <span className="small text-muted">
                      👤 {action.performedBy?.name || `User #${action.performedById}`}
                    </span>
                    {action.followUpRequired ? (
                      <span
                        className="badge"
                        style={{
                          backgroundColor: "#FEF3C7",
                          color: "#D97706",
                          border: "1px solid #FBBF24",
                        }}
                      >
                        Follow-Up Required
                      </span>
                    ) : (
                      <span
                        className="badge"
                        style={{
                          backgroundColor: "#E2E8F0",
                          color: "#475569",
                          border: "1px solid #CBD5E1",
                        }}
                      >
                        No Follow-Up
                      </span>
                    )}
                  </div>
                  {action.followUpRequired && action.followUpNote && (
                    <div className="mt-2 small text-muted" style={{ fontSize: "0.75rem" }}>
                      <strong>Note:</strong> {action.followUpNote}
                    </div>
                  )}
                  {action.attachmentNotes && (
                    <div className="mt-1 small text-muted" style={{ fontSize: "0.75rem" }}>
                      <strong>Attachment:</strong> {action.attachmentNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

