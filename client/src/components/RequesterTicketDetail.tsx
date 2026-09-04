import { useState, useEffect, useCallback } from "react";
import {
  getTicketDetail,
  uploadAttachment,
  removeAttachment,
  TicketDetail,
  Attachment,
} from "../api.js";

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

  const getPriorityBadgeClass = (priority?: string) => {
    switch (priority?.toUpperCase()) {
      case "LOW":
        return "bg-secondary text-white";
      case "MEDIUM":
        return "bg-warning text-dark";
      case "HIGH":
        return "bg-danger text-white";
      case "URGENT":
        return "bg-dark text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "NEW":
        return "bg-info text-dark";
      case "IN_PROGRESS":
        return "bg-primary text-white";
      case "RESOLVED":
        return "bg-success text-white";
      case "CLOSED":
        return "bg-secondary text-white";
      default:
        return "bg-light text-dark border";
    }
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
      {/* Top Header Bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <button
          className="btn btn-outline-secondary btn-sm fw-bold d-flex align-items-center gap-1"
          onClick={onBack}
          id="back-to-tickets-btn"
        >
          &larr; Back to My Tickets
        </button>
        <div className="d-flex gap-2 align-items-center">
          <span className="text-muted small">Status:</span>
          <span className={`badge ${getStatusBadgeClass(ticket.currentStatus)} px-3 py-2 fs-6`}>
            {ticket.currentStatus}
          </span>
        </div>
      </div>

      {/* Main Ticket Read-Only Detail Card */}
      <div className="card shadow-sm border-0 mb-4" style={{ backgroundColor: "#FFFFFF" }}>
        <div
          className="card-header border-0 py-3 px-4 d-flex flex-wrap justify-content-between align-items-center"
          style={{ backgroundColor: "#EAF6EF", color: "#006B3C" }}
        >
          <div>
            <span className="badge bg-success me-2 fs-6">{ticket.ticketNumber}</span>
            <span className="fw-bold text-dark fs-5">{ticket.summary}</span>
          </div>
          <div className="text-muted small">
            Created: {new Date(ticket.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="card-body p-4">
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-4">
              <div className="text-muted small fw-bold text-uppercase">Category</div>
              <div className="fw-semibold text-dark">{ticket.category?.name || "-"}</div>
            </div>

            <div className="col-12 col-md-4">
              <div className="text-muted small fw-bold text-uppercase">Related System</div>
              <div className="fw-semibold text-dark">{ticket.relatedSystem?.name || "-"}</div>
            </div>

            <div className="col-12 col-md-4">
              <div className="text-muted small fw-bold text-uppercase">Requested Priority</div>
              <div>
                <span className={`badge ${getPriorityBadgeClass(ticket.requestedPriority)} px-2 py-1`}>
                  {ticket.requestedPriority}
                </span>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="text-muted small fw-bold text-uppercase">Requester</div>
              <div className="fw-semibold text-dark">{ticket.requester?.name || `ID #${ticket.requesterId}`}</div>
              <div className="text-muted small">{ticket.requester?.email}</div>
            </div>

            <div className="col-12 col-md-4">
              <div className="text-muted small fw-bold text-uppercase">IT Priority</div>
              <div>
                <span className={`badge ${getPriorityBadgeClass(ticket.itPriority)} px-2 py-1`}>
                  {ticket.itPriority}
                </span>
              </div>
            </div>
          </div>

          <hr className="my-3 text-muted opacity-25" />

          <div className="mb-2">
            <div className="text-muted small fw-bold text-uppercase mb-1">Description</div>
            <div
              className="p-3 bg-light rounded text-dark"
              style={{ whiteSpace: "pre-wrap", minHeight: 80, lineHeight: 1.6 }}
            >
              {ticket.description}
            </div>
          </div>
        </div>
      </div>

      {/* Attachment Section */}
      <div className="card shadow-sm border-0 p-4" id="attachment-section" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            📎 Attachments
            <span className="badge bg-secondary rounded-pill fs-6">
              {activeAttachments.length} / 5 Active
            </span>
          </h5>
        </div>

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
