import { useState, useEffect, useCallback } from "react";
import {
  getTicketDetail,
  uploadAttachment,
  removeAttachment,
  getComments,
  addComment,
  getInternalNotes,
  addInternalNote,
  assignTicket,
  updateTicketStatus,
  indicateResolution,
  getStaffUsers,
  TicketDetail,
  Attachment,
  TicketComment,
  InternalNote,
  StaffUser,
} from "../api";
import { AuthUser } from "../auth";

interface RequesterTicketDetailProps {
  ticketId: number;
  requesterId?: number;
  user?: AuthUser;
  onBack: () => void;
}

export function RequesterTicketDetail({
  ticketId,
  requesterId,
  user,
  onBack,
}: RequesterTicketDetailProps) {
  const effectiveRequesterId = user?.id || requesterId || 1;
  const isStaffOrAdmin = user?.role === "IT_STAFF" || user?.role === "ADMINISTRATOR";

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"comments" | "notes" | "attachments" | "actions">("attachments");

  // Comments state
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Internal Notes state
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  // Staff Operations state
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedItPriority, setSelectedItPriority] = useState<string>("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);
  const [updatingAction, setUpdatingAction] = useState(false);

  // Problem Resolved Indication state
  const [resolvingModal, setResolvingModal] = useState(false);
  const [resolveNote, setResolveNote] = useState("");
  const [submittingResolve, setSubmittingResolve] = useState(false);

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
      const data = await getTicketDetail(ticketId, effectiveRequesterId);
      setTicket(data);
      if (data && (data as any).comments) {
        setComments((data as any).comments);
      }
      if (data && (data as any).internalNotes) {
        setNotes((data as any).internalNotes);
      }
      setSelectedStatus(data?.currentStatus || "NEW");
      setSelectedItPriority(data?.itPriority || data?.requestedPriority || "MEDIUM");
      setSelectedOwnerId(data?.ownerId ? String(data.ownerId) : "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ticket detail");
    } finally {
      setLoading(false);
    }
  }, [ticketId, effectiveRequesterId]);

  useEffect(() => {
    fetchDetail();
    if (isStaffOrAdmin) {
      try {
        getStaffUsers()
          .then(setStaffList)
          .catch(() => {});
      } catch {}
    }
  }, [fetchDetail, isStaffOrAdmin]);

  const activeAttachments = ticket?.attachments?.filter((a) => !a.isRemoved) ?? [];
  const removedAttachments = ticket?.attachments?.filter((a) => a.isRemoved) ?? [];

  // Submit Comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed || trimmed.length > 2000) return;

    setSubmittingComment(true);
    setCommentError(null);
    try {
      const created = await addComment(ticketId, trimmed);
      setComments((prev) => [...prev, created]);
      setNewComment("");
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Submit Internal Note
  const handlePostNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newNote.trim();
    if (!trimmed || trimmed.length > 2000) return;

    setSubmittingNote(true);
    setNoteError(null);
    try {
      const created = await addInternalNote(ticketId, trimmed);
      setNotes((prev) => [...prev, created]);
      setNewNote("");
    } catch (err) {
      setNoteError(err instanceof Error ? err.message : "Failed to post internal note");
    } finally {
      setSubmittingNote(false);
    }
  };

  // Claim Ticket
  const handleClaimTicket = async () => {
    if (!user) return;
    setUpdatingAction(true);
    setActionErrorMsg(null);
    setActionSuccessMsg(null);
    try {
      const updated = await assignTicket(ticketId, user.id);
      setTicket(updated);
      setSelectedOwnerId(String(user.id));
      setActionSuccessMsg("You have successfully claimed this ticket!");
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err) {
      setActionErrorMsg(err instanceof Error ? err.message : "Failed to claim ticket");
    } finally {
      setUpdatingAction(false);
    }
  };

  // Assign Ticket
  const handleAssignTicket = async (newOwnerIdStr: string) => {
    setSelectedOwnerId(newOwnerIdStr);
    setUpdatingAction(true);
    setActionErrorMsg(null);
    setActionSuccessMsg(null);
    try {
      const ownerId = newOwnerIdStr === "" || newOwnerIdStr === "unassigned" ? null : parseInt(newOwnerIdStr, 10);
      const updated = await assignTicket(ticketId, ownerId);
      setTicket(updated);
      setActionSuccessMsg(ownerId ? "Ticket reassigned successfully!" : "Ticket unassigned successfully!");
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err) {
      setActionErrorMsg(err instanceof Error ? err.message : "Failed to assign ticket");
    } finally {
      setUpdatingAction(false);
    }
  };

  // Update Status & IT Priority
  const handleUpdateStatusAndPriority = async () => {
    setUpdatingAction(true);
    setActionErrorMsg(null);
    setActionSuccessMsg(null);
    try {
      const updated = await updateTicketStatus(ticketId, {
        status: selectedStatus,
        itPriority: selectedItPriority,
      });
      setTicket(updated);
      setActionSuccessMsg("Status and IT Priority updated successfully!");
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err) {
      setActionErrorMsg(err instanceof Error ? err.message : "Failed to update status/priority");
    } finally {
      setUpdatingAction(false);
    }
  };

  // Indicate Problem Resolved
  const handleIndicateResolved = async () => {
    setSubmittingResolve(true);
    try {
      const res = await indicateResolution(ticketId, resolveNote);
      setComments((prev) => [...prev, res.comment]);
      setResolvingModal(false);
      setResolveNote("");
      setActionSuccessMsg("Your resolution note has been sent to IT Support!");
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit resolution indication");
    } finally {
      setSubmittingResolve(false);
    }
  };

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
      await uploadAttachment(ticket.id, selectedFile, effectiveRequesterId);
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
      await removeAttachment(removingAttachment.id, removalReason.trim(), effectiveRequesterId);
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
    if (!dateStr) return "-";
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

    if (val === "HIGH" || val === "URGENT" || val === "CRITICAL") {
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
    const val = (status || "NEW").toUpperCase().replace(/\s+/g, "_");
    let bg = "#DEF7EC";
    let color = "#03543F";
    let border = "#34D399";
    let label = status || "New";

    if (val === "NEW" || val === "OPEN") {
      bg = "#E1F5FE";
      color = "#0288D1";
      border = "#38BDF8";
      label = val === "NEW" ? "New" : "Open";
    } else if (val === "IN_PROGRESS") {
      bg = "#DEF7EC";
      color = "#03543F";
      border = "#34D399";
      label = "In Progress";
    } else if (val === "WAITING_FOR_REQUESTER" || val === "PENDING") {
      bg = "#FEF3C7";
      color = "#D97706";
      border = "#FBBF24";
      label = "Waiting for Requester";
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
    } else if (val === "CANCELLED" || val === "CANCELED") {
      bg = "#FEE2E2";
      color = "#991B1B";
      border = "#FCA5A5";
      label = "Cancelled";
    } else if (val === "REOPENED") {
      bg = "#EDE9FE";
      color = "#5B21B6";
      border = "#C4B5FD";
      label = "Reopened";
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
          &larr; Back to Tickets
        </button>
        <div className="alert alert-danger p-4 rounded shadow-sm" id="ticket-detail-error">
          <div className="fw-bold fs-5 mb-1">Access Denied or Error</div>
          <p className="mb-0">{error || "Unable to view ticket details."}</p>
        </div>
      </div>
    );
  }

  const isRequesterUser = user?.role === "REQUESTER" || !user;
  const isTicketOwnerOrRequester = ticket.requesterId === user?.id;

  return (
    <div className="w-100 mb-5">
      {/* Top Header Bar with Breadcrumb and Back Button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0 small">
            <li className="breadcrumb-item">
              <span className="text-success cursor-pointer fw-semibold" onClick={onBack} style={{ cursor: "pointer" }}>
                {isStaffOrAdmin ? "IT Queue" : "My Tickets"}
              </span>
            </li>
            <li className="breadcrumb-item active text-muted" aria-current="page">
              Ticket {ticket.ticketNumber}
            </li>
          </ol>
        </nav>
        <div className="d-flex gap-2">
          {isRequesterUser && isTicketOwnerOrRequester && ticket.currentStatus !== "CLOSED" && (
            <button
              className="btn btn-outline-success btn-sm fw-semibold rounded-2 px-3"
              onClick={() => setResolvingModal(true)}
              id="problem-resolved-btn"
            >
              ✅ Problem Appears Resolved
            </button>
          )}
          <button
            className="btn btn-outline-secondary btn-sm fw-semibold rounded-2 px-3"
            onClick={onBack}
            id="back-to-tickets-btn"
          >
            &larr; Back
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="alert alert-success py-2 px-3 mb-3 small d-flex align-items-center gap-2" role="alert">
          <span>✨</span>
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {actionErrorMsg && (
        <div className="alert alert-danger py-2 px-3 mb-3 small d-flex align-items-center gap-2" role="alert">
          <span>⚠️</span>
          <span>{actionErrorMsg}</span>
        </div>
      )}

      {/* Main Ticket Read-Only Form Card */}
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
              value={ticket.category?.name || "General"}
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label small fw-bold text-muted mb-1">Related System</label>
            <input
              type="text"
              readOnly
              className="form-control form-control-sm bg-light text-dark"
              value={ticket.relatedSystem?.name || "System"}
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
              value={ticket.requester ? `${ticket.requester.name} (${ticket.requester.email})` : `ID #${ticket.requesterId}`}
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
              className="form-control form-control-sm bg-light text-dark fw-semibold"
              value={ticket.owner ? `${ticket.owner.name}` : "Unassigned"}
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
        <div className="mb-0">
          <label className="form-label small fw-bold text-muted mb-1">Description</label>
          <textarea
            readOnly
            rows={3}
            className="form-control form-control-sm bg-light text-dark"
            value={ticket.description}
          />
        </div>
      </div>

      {/* Staff Operational Control Panel (Only for IT Staff & Admin) */}
      {isStaffOrAdmin && (
        <div className="card shadow-sm border rounded-3 p-4 mb-4" style={{ backgroundColor: "#F0FDF4", borderColor: "#86EFAC" }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold text-success mb-0 d-flex align-items-center gap-2">
              <span>🛠️</span> IT Staff Operational Controls
            </h6>
            {ticket.ownerId !== user?.id && (
              <button
                className="btn btn-success btn-sm fw-bold px-3"
                onClick={handleClaimTicket}
                disabled={updatingAction}
                id="claim-ticket-btn"
              >
                🙋 Claim Ticket (Assign to Me)
              </button>
            )}
          </div>

          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-muted mb-1">Assignee</label>
              <select
                className="form-select form-select-sm"
                value={selectedOwnerId}
                onChange={(e) => handleAssignTicket(e.target.value)}
                disabled={updatingAction}
                id="reassign-select"
              >
                <option value="">-- Unassigned --</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role === "ADMINISTRATOR" ? "Admin" : "IT Staff"})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label small fw-bold text-muted mb-1">IT Priority</label>
              <select
                className="form-select form-select-sm"
                value={selectedItPriority}
                onChange={(e) => setSelectedItPriority(e.target.value)}
                disabled={updatingAction}
                id="it-priority-select"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label small fw-bold text-muted mb-1">Workflow Status</label>
              <select
                className="form-select form-select-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                disabled={updatingAction}
                id="status-workflow-select"
              >
                <option value="NEW">New</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="WAITING_FOR_REQUESTER">Waiting for Requester</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
                <option value="REOPENED">Reopened</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="col-12 col-md-2">
              <button
                className="btn btn-outline-success btn-sm fw-bold w-100"
                onClick={handleUpdateStatusAndPriority}
                disabled={updatingAction}
                id="update-status-priority-btn"
              >
                {updatingAction ? "Saving..." : "💾 Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Header (Public Comments, Internal Notes, Attachments) */}
      <div className="card shadow-sm border rounded-3 p-4" id="attachment-section" style={{ backgroundColor: "#FFFFFF" }}>
        <ul className="nav nav-tabs mb-4 border-bottom">
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold ${activeTab === "comments" ? "active text-success border-bottom border-success border-2 fw-bold" : "text-muted"}`}
              type="button"
              onClick={() => setActiveTab("comments")}
              id="tab-comments"
            >
              💬 Public Comments <span className="badge bg-success rounded-pill ms-1">{comments.length}</span>
            </button>
          </li>
          {isStaffOrAdmin && (
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold ${activeTab === "notes" ? "active text-warning border-bottom border-warning border-2 fw-bold" : "text-muted"}`}
                type="button"
                onClick={() => setActiveTab("notes")}
                id="tab-internal-notes"
              >
                🔒 Internal Notes <span className="badge bg-warning text-dark rounded-pill ms-1">{notes.length}</span>
              </button>
            </li>
          )}
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold ${activeTab === "attachments" ? "active text-success border-bottom border-success border-2 fw-bold" : "text-muted"}`}
              type="button"
              onClick={() => setActiveTab("attachments")}
              id="tab-attachments"
            >
              📎 Attachments <span className="badge bg-secondary rounded-pill ms-1">{activeAttachments.length}</span>
            </button>
          </li>
        </ul>

        {/* Tab 1: Public Comments */}
        {activeTab === "comments" && (
          <div>
            {/* Comment Post Form */}
            <form onSubmit={handlePostComment} className="mb-4">
              <label className="form-label small fw-bold text-dark mb-1">Add Public Comment</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Type your public comment here (visible to Requester & IT Staff)..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={submittingComment}
                  maxLength={2000}
                  id="comment-input"
                />
                <button
                  className="btn text-white btn-sm fw-bold px-3"
                  style={{ backgroundColor: "#006B3C" }}
                  type="submit"
                  disabled={!newComment.trim() || submittingComment}
                  id="post-comment-btn"
                >
                  {submittingComment ? "Posting..." : "🚀 Post Comment"}
                </button>
              </div>
              {commentError && <div className="text-danger small mt-1">⚠️ {commentError}</div>}
            </form>

            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="text-muted small italic p-3 text-center bg-light rounded">
                No public comments yet. Be the first to leave a message.
              </div>
            ) : (
              <div className="list-group list-group-flush border rounded" id="comments-list">
                {comments.map((c) => {
                  const isStaff = c.author?.role === "IT_STAFF" || c.author?.role === "ADMINISTRATOR";
                  return (
                    <div key={c.id} className="list-group-item p-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div className="d-flex align-items-center gap-2">
                          <span className={`badge rounded-circle ${isStaff ? "bg-primary" : "bg-success"} p-2`}>
                            {c.author?.name ? c.author.name.slice(0, 2).toUpperCase() : "U"}
                          </span>
                          <strong className="text-dark small">{c.author?.name || "User"}</strong>
                          <span
                            className={`badge small ${
                              isStaff
                                ? "bg-primary bg-opacity-10 text-primary border border-primary"
                                : "bg-success bg-opacity-10 text-success border border-success"
                            }`}
                          >
                            {c.author?.role === "ADMINISTRATOR"
                              ? "Admin"
                              : c.author?.role === "IT_STAFF"
                              ? "IT Staff"
                              : "Requester"}
                          </span>
                        </div>
                        <span className="text-muted small">{formatDateTime(c.createdAt)}</span>
                      </div>
                      <p className="mb-0 text-secondary small ms-4 ps-2 text-break">{c.content}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Internal Notes (Staff & Admin Only) */}
        {activeTab === "notes" && isStaffOrAdmin && (
          <div>
            <div className="alert alert-warning py-2 px-3 mb-3 small d-flex align-items-center gap-2">
              <span>🔒</span>
              <span>
                <strong>Confidential Operational Notes:</strong> These notes are visible ONLY to IT Staff and
                Administrators. Requesters cannot view this tab.
              </span>
            </div>

            {/* Note Post Form */}
            <form onSubmit={handlePostNote} className="mb-4">
              <label className="form-label small fw-bold text-dark mb-1">Add Private Internal Note</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Type internal troubleshooting note, vendor details, or operational updates..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  disabled={submittingNote}
                  maxLength={2000}
                  id="internal-note-input"
                />
                <button
                  className="btn btn-warning text-dark btn-sm fw-bold px-3"
                  type="submit"
                  disabled={!newNote.trim() || submittingNote}
                  id="post-internal-note-btn"
                >
                  {submittingNote ? "Saving..." : "🔒 Save Note"}
                </button>
              </div>
              {noteError && <div className="text-danger small mt-1">⚠️ {noteError}</div>}
            </form>

            {/* Notes List */}
            {notes.length === 0 ? (
              <div className="text-muted small italic p-3 text-center bg-light rounded">
                No internal notes added for this ticket yet.
              </div>
            ) : (
              <div className="list-group list-group-flush border rounded" id="internal-notes-list">
                {notes.map((n) => (
                  <div key={n.id} className="list-group-item p-3" style={{ backgroundColor: "#FEFCE8" }}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge rounded-circle bg-warning text-dark p-2">🔒</span>
                        <strong className="text-dark small">{n.author?.name || "Staff"}</strong>
                        <span className="badge bg-warning text-dark border border-warning small">
                          {n.author?.role === "ADMINISTRATOR" ? "Admin" : "IT Staff"}
                        </span>
                      </div>
                      <span className="text-muted small">{formatDateTime(n.createdAt)}</span>
                    </div>
                    <p className="mb-0 text-dark small ms-4 ps-2 text-break font-monospace">{n.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Attachments */}
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

            {/* Removed Attachments Audit Log */}
            {removedAttachments.length > 0 && (
              <div>
                <h6 className="fw-bold text-muted small text-uppercase mb-2">Audit: Soft-Removed Files</h6>
                <div className="list-group list-group-flush border rounded bg-light">
                  {removedAttachments.map((att) => (
                    <div key={att.id} className="list-group-item p-3 bg-light text-muted opacity-75">
                      <div className="d-flex justify-content-between">
                        <span className="text-decoration-line-through fw-semibold">{att.fileName}</span>
                        <span className="badge bg-danger">Soft Removed</span>
                      </div>
                      <div className="small mt-1">
                        <strong>Reason:</strong> {att.removalReason || "No reason given"} &bull; Removed on{" "}
                        {att.removedAt ? new Date(att.removedAt).toLocaleDateString() : "recently"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Problem Appears Resolved Modal for Requester */}
      {resolvingModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fs-6 fw-bold">✅ Mark Problem as Appears Resolved</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setResolvingModal(false)}
                />
              </div>
              <div className="modal-body p-4">
                <p className="small text-muted mb-3">
                  This will notify IT Support that the issue seems resolved on your end and add a confirmation comment to
                  the ticket.
                </p>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Optional Feedback / Note:</label>
                  <textarea
                    rows={3}
                    className="form-control form-control-sm"
                    placeholder="e.g. Restarting the app resolved the problem. Thank you!"
                    value={resolveNote}
                    onChange={(e) => setResolveNote(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer bg-light p-3">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setResolvingModal(false)}
                  disabled={submittingResolve}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success btn-sm fw-bold px-4"
                  onClick={handleIndicateResolved}
                  disabled={submittingResolve}
                  id="confirm-indicate-resolved-btn"
                >
                  {submittingResolve ? "Submitting..." : "Send Confirmation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Soft Remove Confirmation Modal */}
      {removingAttachment && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fs-6 fw-bold">Confirm Attachment Soft Removal</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setRemovingAttachment(null)}
                />
              </div>
              <div className="modal-body p-4">
                <p className="small text-muted mb-2">
                  You are soft-removing: <strong>{removingAttachment.fileName}</strong>
                </p>
                <p className="small text-danger mb-3">
                  The file will no longer be downloadable, but will remain recorded in audit logs.
                </p>
                <div className="mb-3">
                  <label className="form-label small fw-bold">
                    Mandatory Removal Reason <span className="text-danger">*</span>
                  </label>
                  <textarea
                    rows={3}
                    className="form-control form-control-sm"
                    placeholder="Enter reason for removal (min 3 characters)..."
                    value={removalReason}
                    onChange={(e) => setRemovalReason(e.target.value)}
                    id="removal-reason-input"
                  />
                  {removalError && <div className="text-danger small mt-1">{removalError}</div>}
                </div>
              </div>
              <div className="modal-footer bg-light p-3">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setRemovingAttachment(null)}
                  disabled={removing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm fw-bold px-3"
                  onClick={handleConfirmRemoval}
                  disabled={removing || !removalReason.trim() || removalReason.trim().length < 3}
                  id="confirm-soft-remove-btn"
                >
                  {removing ? "Removing..." : "Confirm Soft Removal"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
