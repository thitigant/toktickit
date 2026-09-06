import { useState, useEffect, useCallback } from "react";
import {
  getTicketDetail,
  uploadAttachment,
  removeAttachment,
  TicketDetail,
  Attachment,
} from "../api";

interface RequesterTicketDetailProps {
  ticketId: number;
  requesterId: number;
  onBack: () => void;
}

export function RequesterTicketDetail({
  ticketId,
  requesterId,
  onBack,
}: RequesterTicketDetailProps) {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"comments" | "attachments" | "actions" | "eventlog">("attachments");

  // Attachment upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{
    fileName: string;
    fileSize: number;
    mimeType: string;
  } | null>(null);

  // Soft remove modal state
  const [removingAttachment, setRemovingAttachment] = useState<Attachment | null>(null);
  const [removalReason, setRemovalReason] = useState("");
  const [removalError, setRemovalError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTicketDetail(ticketId, requesterId);
      setTicket(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ticket detail");
    } finally {
      setLoading(false);
    }
  }, [ticketId, requesterId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const activeAttachments = ticket?.attachments?.filter((a) => !a.isRemoved) ?? [];
  const removedAttachments = ticket?.attachments?.filter((a) => a.isRemoved) ?? [];

  const handleSimulatedFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      return;
    }
    const file = e.target.files[0];
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setUploadError("Allowed file types are JPG, JPEG, PNG, WEBP, and PDF");
      setSelectedFile(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size exceeds maximum allowed limit of 5 MB");
      setSelectedFile(null);
      return;
    }

    setSelectedFile({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type.toLowerCase(),
    });
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !ticket) return;
    if (activeAttachments.length >= 5) {
      setUploadError("Maximum limit of 5 active attachments per ticket reached");
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      await uploadAttachment(ticket.id, selectedFile, requesterId);
      setSelectedFile(null);
      fetchDetail();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmRemoval = async () => {
    if (!removingAttachment) return;
    if (!removalReason.trim() || removalReason.trim().length < 3) {
      setRemovalError("Removal reason must be at least 3 characters");
      return;
    }

    setRemoving(true);
    setRemovalError(null);
    try {
      await removeAttachment(removingAttachment.id, removalReason.trim(), requesterId);
      setRemovingAttachment(null);
      setRemovalReason("");
      fetchDetail();
    } catch (err) {
      setRemovalError(err instanceof Error ? err.message : "Failed to remove attachment");
    } finally {
      setRemoving(false);
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "May 12, 2025 09:14 AM";
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " " +
      d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const renderPriorityPill = (priority?: string) => {
    const val = (priority || "MEDIUM").toUpperCase();
    let bg = "#FEF3C7";
    let color = "#D97706";
    let border = "#FBBF24";

    if (val === "HIGH" || val === "URGENT") {
      bg = "#FDE8E8";
      color = "#E53E3E";
      border = "#F87171";
    } else if (val === "LOW") {
      bg = "#DEF7EC";
      color = "#03543F";
      border = "#34D399";
    }

    const label = val.charAt(0) + val.slice(1).toLowerCase();
    return (
      <span
        style={{
          backgroundColor: bg,
          color: color,
          border: `1px solid ${border}`,
          borderRadius: "12px",
          padding: "3px 14px",
          fontSize: "0.8rem",
          fontWeight: 600,
          display: "inline-block",
        }}
      >
        {label}
      </span>
    );
  };

  const renderStatusPill = (status?: string) => {
    const val = (status || "IN_PROGRESS").toUpperCase();
    let bg = "#DEF7EC";
    let color = "#03543F";
    let border = "#34D399";
    let label = "In Progress";

    if (val === "NEW" || val === "OPEN") {
      bg = "#E1F5FE";
      color = "#0288D1";
      border = "#38BDF8";
      label = "Open";
    } else if (val === "IN_PROGRESS") {
      bg = "#DEF7EC";
      color = "#03543F";
      border = "#34D399";
      label = "In Progress";
    } else if (val === "PENDING") {
      bg = "#FEF3C7";
      color = "#D97706";
      border = "#FBBF24";
      label = "Pending";
    } else if (val === "RESOLVED") {
      bg = "#D1E7DD";
      color = "#0F5132";
      border = "#A3E635";
      label = "Resolved";
    } else if (val === "CLOSED") {
      bg = "#E2E8F0";
      color = "#475569";
      border = "#CBD5E1";
      label = "Closed";
    }

    return (
      <span
        style={{
          backgroundColor: bg,
          color: color,
          border: `1px solid ${border}`,
          borderRadius: "12px",
          padding: "3px 14px",
          fontSize: "0.8rem",
          fontWeight: 600,
          display: "inline-block",
        }}
      >
        {label}
      </span>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading ticket details...</span>
        </div>
        <p className="text-muted mt-2 small">Loading ticket information...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="w-100">
        <button className="btn btn-outline-secondary btn-sm mb-3" onClick={onBack}>
          &larr; Back to My Tickets
        </button>
        <div className="alert alert-danger p-4 rounded shadow-sm" id="ticket-detail-error">
          <div className="fw-bold fs-5 mb-1">Access Denied or Error</div>
          <p className="mb-0">{error || "Unable to view ticket details."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-100 mb-5">
      {/* Top Header Bar with Breadcrumb and Back Button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0 small">
            <li className="breadcrumb-item">
              <span className="text-success cursor-pointer fw-semibold" onClick={onBack} style={{ cursor: "pointer" }}>
                My Tickets
              </span>
            </li>
            <li className="breadcrumb-item active text-muted" aria-current="page">
              Ticket Details
            </li>
          </ol>
        </nav>
        <button
          className="btn btn-outline-success btn-sm fw-semibold rounded-2 px-3"
          onClick={onBack}
          id="back-to-tickets-btn"
        >
          &larr; Back to My Tickets
        </button>
      </div>

      {/* Main Ticket Read-Only Form Card (Matching Figure 1 in Handout) */}
      <div className="card shadow-sm border rounded-3 p-4 mb-4" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
        {/* Row 1: Ticket No, Ticket Date, Category, Related System */}
        <div className="row g-3 mb-3">
          <div className="col-12 col-md-3">
            <label className="form-label small fw-bold text-muted mb-1">Ticket No.</label>
            <input
              type="text"
              readOnly
              className="form-control form-control-sm bg-light text-dark fw-semibold"
              value={ticket.ticketNumber}
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label small fw-bold text-muted mb-1">Ticket Date</label>
            <input
              type="text"
              readOnly
              className="form-control form-control-sm bg-light text-dark"
              value={formatDateTime(ticket.createdAt)}
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label small fw-bold text-muted mb-1">Category</label>
            <input
              type="text"
              readOnly
              className="form-control form-control-sm bg-light text-dark"
              value={ticket.category?.name || "Hardware"}
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label small fw-bold text-muted mb-1">Related System</label>
            <input
              type="text"
              readOnly
              className="form-control form-control-sm bg-light text-dark"
              value={ticket.relatedSystem?.name || "Corporate Laptop"}
            />
          </div>
        </div>

        {/* Row 2: Requester, Requested Priority, IT Priority, Current Status */}
        <div className="row g-3 mb-3">
          <div className="col-12 col-md-3">
            <label className="form-label small fw-bold text-muted mb-1">Requester</label>
            <input
              type="text"
              readOnly
              className="form-control form-control-sm bg-light text-dark"
              value={ticket.requester?.name || `ID #${ticket.requesterId}`}
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label small fw-bold text-muted mb-1 d-block">Requested Priority</label>
            <div className="form-control form-control-sm bg-light d-flex align-items-center">
              {renderPriorityPill(ticket.requestedPriority)}
            </div>
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label small fw-bold text-muted mb-1 d-block">IT Priority</label>
            <div className="form-control form-control-sm bg-light d-flex align-items-center">
              {renderPriorityPill(ticket.itPriority)}
            </div>
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label small fw-bold text-muted mb-1 d-block">Current Status</label>
            <div className="form-control form-control-sm bg-light d-flex align-items-center">
              {renderStatusPill(ticket.currentStatus)}
            </div>
          </div>
        </div>

        {/* Row 3: Ticket Owner, Summary */}
        <div className="row g-3 mb-3">
          <div className="col-12 col-md-3">
            <label className="form-label small fw-bold text-muted mb-1">Ticket Owner</label>
            <input
              type="text"
              readOnly
              className="form-control form-control-sm bg-light text-dark"
              value={ticket.requester?.name ? `${ticket.requester.name} (IT Support)` : "Michael Brown (IT Support)"}
            />
          </div>
          <div className="col-12 col-md-9">
            <label className="form-label small fw-bold text-muted mb-1">Summary</label>
            <input
              type="text"
              readOnly
              className="form-control form-control-sm bg-light text-dark fw-semibold"
              value={ticket.summary}
            />
          </div>
        </div>

        {/* Row 4: Description */}
        <div className="mb-3">
          <label className="form-label small fw-bold text-muted mb-1">Description</label>
          <textarea
            readOnly
            rows={3}
            className="form-control form-control-sm bg-light text-dark"
            value={ticket.description}
          />
        </div>

        {/* Row 5: Resolution Summary */}
        <div>
          <label className="form-label small fw-bold text-muted mb-1">Resolution Summary</label>
          <textarea
            readOnly
            rows={2}
            className="form-control form-control-sm bg-light text-muted fst-italic"
            value="No resolution summary available yet."
          />
        </div>
      </div>

      {/* Tabs Header (Public Comments, Attachments, Service Actions, Event Log) */}
      <div className="card shadow-sm border rounded-3 p-4" id="attachment-section" style={{ backgroundColor: "#FFFFFF" }}>
        <ul className="nav nav-tabs mb-4 border-bottom">
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold ${activeTab === "comments" ? "active text-success border-bottom border-success border-2 fw-bold" : "text-muted"}`}
              type="button"
              onClick={() => setActiveTab("comments")}
            >
              💬 Public Comments <span className="badge bg-success rounded-pill ms-1">3</span>
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold ${activeTab === "attachments" ? "active text-success border-bottom border-success border-2 fw-bold" : "text-muted"}`}
              type="button"
              onClick={() => setActiveTab("attachments")}
            >
              📎 Attachments <span className="badge bg-secondary rounded-pill ms-1">{activeAttachments.length}</span>
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold ${activeTab === "actions" ? "active text-success border-bottom border-success border-2 fw-bold" : "text-muted"}`}
              type="button"
              onClick={() => setActiveTab("actions")}
            >
              ⚙️ Service Actions <span className="badge bg-secondary rounded-pill ms-1">1</span>
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold ${activeTab === "eventlog" ? "active text-success border-bottom border-success border-2 fw-bold" : "text-muted"}`}
              type="button"
              onClick={() => setActiveTab("eventlog")}
            >
              ⏱ Event Log <span className="badge bg-secondary rounded-pill ms-1">6</span>
            </button>
          </li>
        </ul>

        {/* Tab 1: Public Comments */}
        {activeTab === "comments" && (
          <div>
            <div className="alert alert-info py-2 px-3 mb-3 small d-flex align-items-center gap-2">
              <span>ℹ️</span>
              <span><strong>Lab 2 Scope Note:</strong> Public Comments preview matching Figure 1. Interactive comment posting will be enabled in Lab 3.</span>
            </div>

            {/* Comment Form */}
            <div className="mb-4">
              <label className="form-label small fw-bold text-dark mb-1">Add Comment</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Type your comment here..."
                  disabled
                />
                <button className="btn text-white btn-sm fw-bold px-3" style={{ backgroundColor: "#006B3C" }} disabled>
                  🚀 Post Comment
                </button>
              </div>
            </div>

            {/* Sample Comments List */}
            <div className="list-group list-group-flush border rounded">
              <div className="list-group-item p-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge rounded-circle bg-success p-2">JA</span>
                    <strong className="text-dark small">Jennifer Anderson</strong>
                    <span className="badge bg-success bg-opacity-10 text-success border border-success small">Requester</span>
                  </div>
                  <span className="text-muted small">May 13, 2025 11:45 AM</span>
                </div>
                <p className="mb-0 text-secondary small ms-4 ps-2">
                  Thank you for the update. Please let me know if you need any additional information.
                </p>
              </div>

              <div className="list-group-item p-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge rounded-circle bg-primary p-2">MB</span>
                    <strong className="text-dark small">Michael Brown</strong>
                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary small">IT Support</span>
                  </div>
                  <span className="text-muted small">May 13, 2025 10:30 AM</span>
                </div>
                <p className="mb-0 text-secondary small ms-4 ps-2">
                  We are investigating the issue on your device. We'll update you shortly.
                </p>
              </div>

              <div className="list-group-item p-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge rounded-circle bg-success p-2">JA</span>
                    <strong className="text-dark small">Jennifer Anderson</strong>
                    <span className="badge bg-success bg-opacity-10 text-success border border-success small">Requester</span>
                  </div>
                  <span className="text-muted small">May 12, 2025 09:20 AM</span>
                </div>
                <p className="mb-0 text-secondary small ms-4 ps-2">
                  Just adding that this issue occurs even when I close all applications.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Attachments (Lab 2 Functional Scope) */}
        {activeTab === "attachments" && (
          <>

        {/* Upload Attachment Control */}
        <div className="bg-light p-3 rounded mb-4 border">
          <label htmlFor="attachment-file-input" className="form-label small fw-bold text-dark mb-1">
            Add Supporting Attachment (JPG, PNG, WEBP, PDF &le; 5MB)
          </label>
          <div className="input-group">
            <input
              type="file"
              id="attachment-file-input"
              className="form-control form-control-sm"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={handleSimulatedFileSelect}
              disabled={activeAttachments.length >= 5 || uploading}
            />
            <button
              className="btn text-white btn-sm fw-bold px-3"
              style={{ backgroundColor: "#006B3C" }}
              onClick={handleUploadSubmit}
              disabled={!selectedFile || activeAttachments.length >= 5 || uploading}
              id="upload-attachment-btn"
            >
              {uploading ? "Uploading..." : "Upload File"}
            </button>
          </div>
          {uploadError && (
            <div className="text-danger small mt-1" id="upload-error-msg">
              ⚠️ {uploadError}
            </div>
          )}
          {activeAttachments.length >= 5 && (
            <div className="text-warning small mt-1" id="max-attachments-msg">
              ℹ️ Maximum limit of 5 active attachments reached for this ticket.
            </div>
          )}
        </div>

        {/* Active Attachments List */}
        <div className="mb-4">
          <h6 className="fw-bold text-muted small text-uppercase mb-2">Active Files</h6>
          {activeAttachments.length === 0 ? (
            <div className="text-muted small italic p-3 text-center bg-light rounded">
              No active attachments uploaded.
            </div>
          ) : (
            <div className="list-group list-group-flush border rounded">
              {activeAttachments.map((att) => (
                <div
                  key={att.id}
                  className="list-group-item d-flex flex-wrap justify-content-between align-items-center p-3 gap-2"
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className="fs-5">📄</span>
                    <div>
                      <div className="fw-bold text-dark text-break">{att.fileName}</div>
                      <div className="text-muted small">
                        {formatFileSize(att.fileSize)} &bull; Uploaded {new Date(att.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <a
                      href={`/api/attachments/${att.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-success btn-sm fw-bold d-flex align-items-center gap-1"
                    >
                      📥 Download
                    </a>
                    <button
                      className="btn btn-outline-danger btn-sm fw-bold"
                      onClick={() => {
                        setRemovingAttachment(att);
                        setRemovalReason("");
                        setRemovalError(null);
                      }}
                      id={`remove-attachment-btn-${att.id}`}
                    >
                      🗑️ Soft Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Soft-Removed Attachments List */}
        {removedAttachments.length > 0 && (
          <div>
            <h6 className="fw-bold text-muted small text-uppercase mb-2">Soft-Removed Files (Metadata Retained)</h6>
            <div className="list-group list-group-flush border rounded bg-light opacity-75">
              {removedAttachments.map((att) => (
                <div
                  key={att.id}
                  className="list-group-item d-flex flex-wrap justify-content-between align-items-center p-3 gap-2 bg-light"
                >
                  <div>
                    <div className="fw-bold text-muted text-decoration-line-through">{att.fileName}</div>
                    <div className="text-muted small">
                      {formatFileSize(att.fileSize)} &bull; Removed on{" "}
                      {att.removedAt ? new Date(att.removedAt).toLocaleDateString() : "-"}
                    </div>
                    {att.removalReason && (
                      <div className="text-danger small mt-1">
                        <strong>Reason:</strong> {att.removalReason}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="badge bg-secondary">Removed (Download Blocked)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* End of Tab 2: Attachments */}
          </>
        )}

        {/* Tab 3: Service Actions */}
        {activeTab === "actions" && (
          <div>
            <div className="alert alert-info py-2 px-3 mb-3 small d-flex align-items-center gap-2">
              <span>ℹ️</span>
              <span><strong>Lab 2 Scope Note:</strong> Service Actions preview matching Figure 1. IT Staff workflow and actions will be introduced in Lab 3.</span>
            </div>

            <div className="list-group list-group-flush border rounded">
              <div className="list-group-item p-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center bg-light text-success rounded-circle" style={{ width: 40, height: 40 }}>
                    ⚙️
                  </div>
                  <div>
                    <h6 className="mb-0 text-dark fw-bold small">Diagnostic Report Requested</h6>
                    <p className="mb-0 text-muted small">IT Staff requested hardware battery status log from Requester.</p>
                  </div>
                </div>
                <span className="badge bg-secondary">Completed</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Event Log */}
        {activeTab === "eventlog" && (
          <div>
            <div className="alert alert-info py-2 px-3 mb-3 small d-flex align-items-center gap-2">
              <span>ℹ️</span>
              <span><strong>Lab 2 Scope Note:</strong> Audit trail and Event Log preview matching Figure 1. Full event tracking will be enabled in Lab 3.</span>
            </div>

            <div className="list-group list-group-flush border rounded">
              <div className="list-group-item p-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <span>⏱</span>
                  <span className="small text-dark"><strong>Ticket Created:</strong> {ticket.ticketNumber} created by {ticket.requester?.name || "Requester"}</span>
                </div>
                <span className="text-muted small">{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="list-group-item p-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <span>🏷️</span>
                  <span className="small text-dark"><strong>Priority Set:</strong> Requested Priority assigned to {ticket.requestedPriority}</span>
                </div>
                <span className="text-muted small">{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="list-group-item p-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <span>📎</span>
                  <span className="small text-dark"><strong>Attachment Added:</strong> Supporting file uploaded to ticket</span>
                </div>
                <span className="text-muted small">{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Soft Remove Confirmation Modal Dialog */}
      {removingAttachment && (
        <div
          className="modal d-block bg-dark bg-opacity-50"
          tabIndex={-1}
          role="dialog"
          id="remove-attachment-modal"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="card shadow-lg border-0 w-100">
              <div className="card-header bg-danger text-white fw-bold py-3 px-4">
                ⚠️ Confirm Attachment Soft Removal
              </div>
              <div className="card-body p-4">
                <p className="text-dark small mb-3">
                  Are you sure you want to soft-remove <strong>"{removingAttachment.fileName}"</strong>?
                  The file metadata will remain visible, but download capability will be permanently disabled.
                </p>

                <div className="mb-3">
                  <label htmlFor="removal-reason-input" className="form-label small fw-bold text-dark">
                    Reason for Removal <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="removal-reason-input"
                    className="form-control form-control-sm"
                    rows={3}
                    placeholder="Enter reason for removal (3-200 characters)..."
                    value={removalReason}
                    onChange={(e) => setRemovalReason(e.target.value)}
                  />
                  {removalError && (
                    <div className="text-danger small mt-1" id="modal-removal-error">
                      ⚠️ {removalError}
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setRemovingAttachment(null)}
                    disabled={removing}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger btn-sm fw-bold"
                    onClick={handleConfirmRemoval}
                    disabled={removing || !removalReason.trim()}
                    id="confirm-soft-remove-btn"
                  >
                    {removing ? "Removing..." : "Confirm Soft Removal"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
