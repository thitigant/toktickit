import { useState, useEffect, useCallback } from "react";
import {
  getTickets,
  Category,
  PaginatedTickets,
  GetTicketsQueryParams,
} from "../api";

interface MyTicketsListProps {
  requesterId: number;
  categories: Category[];
  onCreateTicketClick: () => void;
  onSelectTicket?: (ticketId: number) => void;
}

export function MyTicketsList({
  requesterId,
  categories,
  onCreateTicketClick,
  onSelectTicket,
}: MyTicketsListProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedRequestedPriority, setSelectedRequestedPriority] = useState<string>("");
  const [selectedItPriority, setSelectedItPriority] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PaginatedTickets | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams: GetTicketsQueryParams = {
        search: search.trim() || undefined,
        category: selectedCategory || undefined,
        priority: selectedRequestedPriority || undefined,
        itPriority: selectedItPriority || undefined,
        status: selectedStatus || undefined,
        page,
        limit: pageSize,
        sortBy: "createdAt",
        sortOrder: "desc",
        viewAll: true,
      };
      const res = await getTickets(queryParams, requesterId);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [
    requesterId,
    search,
    selectedCategory,
    selectedRequestedPriority,
    selectedItPriority,
    selectedStatus,
    page,
    pageSize,
  ]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedRequestedPriority("");
    setSelectedItPriority("");
    setSelectedStatus("");
    setPage(1);
  };

  // Helper for priority pill badges (Soft Colors)
  const renderPriorityBadge = (priority?: string) => {
    if (!priority) return <span className="text-muted">-</span>;
    const val = priority.toUpperCase();
    let bg = "#F3F4F6";
    let color = "#374151";
    let border = "#E5E7EB";

    if (val === "HIGH" || val === "URGENT") {
      bg = "#FDE8E8";
      color = "#E53E3E";
      border = "#F87171";
    } else if (val === "MEDIUM") {
      bg = "#FEF3C7";
      color = "#D97706";
      border = "#FBBF24";
    } else if (val === "LOW") {
      bg = "#DEF7EC";
      color = "#03543F";
      border = "#34D399";
    }

    const label = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();

    return (
      <span
        style={{
          backgroundColor: bg,
          color: color,
          border: `1px solid ${border}`,
          borderRadius: "12px",
          padding: "3px 12px",
          fontSize: "0.75rem",
          fontWeight: 600,
          display: "inline-block",
        }}
      >
        {label}
      </span>
    );
  };

  // Helper for status pill badges (Soft Colors)
  const renderStatusBadge = (status?: string) => {
    if (!status) return <span className="text-muted">-</span>;
    const val = status.toUpperCase();
    let bg = "#F3F4F6";
    let color = "#374151";
    let border = "#E5E7EB";
    let label = status;

    if (val === "NEW" || val === "OPEN") {
      bg = "#E1F5FE";
      color = "#0288D1";
      border = "#38BDF8";
      label = "Open";
    } else if (val === "IN_PROGRESS") {
      bg = "#E8F5EE";
      color = "#006B3C";
      border = "#34D399";
      label = "In Progress";
    } else if (val === "PENDING") {
      bg = "#FFF3E0";
      color = "#E65100";
      border = "#FB923C";
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
          padding: "3px 12px",
          fontSize: "0.75rem",
          fontWeight: 600,
          display: "inline-block",
        }}
      >
        {label}
      </span>
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + " " + d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hasActiveFilters =
    search || selectedCategory || selectedRequestedPriority || selectedItPriority || selectedStatus;

  return (
    <div className="w-100">
      {/* Header Banner */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h1 className="h3 fw-bold text-dark mb-1">My Tickets</h1>
          <p className="text-muted small mb-0">View and track all of your support requests.</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <button
            className="btn btn-outline-secondary btn-sm rounded-2 d-flex align-items-center gap-1"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            id="clear-filters-btn"
            style={{ padding: "6px 14px" }}
          >
            <span>🔄</span> Clear Filters
          </button>
          <button
            className="btn text-white btn-sm fw-semibold rounded-2 px-3 d-flex align-items-center gap-1"
            style={{ backgroundColor: "#006B3C", border: "none", padding: "6px 16px" }}
            onClick={onCreateTicketClick}
            id="create-ticket-header-btn"
          >
            <span style={{ fontSize: "1rem" }}>+</span> Create Ticket
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div
        className="card shadow-sm border p-3 mb-4 rounded-3"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
      >
        <div className="row g-3 align-items-end">
          {/* Search Bar */}
          <div className="col-12 col-lg-3">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white border-end-0 text-muted">🔍</span>
              <input
                type="text"
                id="search-tickets-input"
                className="form-control form-control-sm border-start-0 ps-0"
                placeholder="Search by ticket number or summary..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="col-6 col-md-3 col-lg-2">
            <label htmlFor="category-filter-select" className="form-label small text-muted mb-1 fw-bold">
              Category
            </label>
            <select
              id="category-filter-select"
              className="form-select form-select-sm"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Requested Priority Filter */}
          <div className="col-6 col-md-3 col-lg-2">
            <label htmlFor="priority-filter-select" className="form-label small text-muted mb-1 fw-bold">
              Requested Priority
            </label>
            <select
              id="priority-filter-select"
              className="form-select form-select-sm"
              value={selectedRequestedPriority}
              onChange={(e) => {
                setSelectedRequestedPriority(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          {/* IT Priority Filter */}
          <div className="col-6 col-md-3 col-lg-2">
            <label htmlFor="it-priority-filter-select" className="form-label small text-muted mb-1 fw-bold">
              IT Priority
            </label>
            <select
              id="it-priority-filter-select"
              className="form-select form-select-sm"
              value={selectedItPriority}
              onChange={(e) => {
                setSelectedItPriority(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="col-6 col-md-3 col-lg-3">
            <label htmlFor="status-filter-select" className="form-label small text-muted mb-1 fw-bold">
              Current Status
            </label>
            <select
              id="status-filter-select"
              className="form-select form-select-sm"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="NEW">New / Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PENDING">Pending</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading tickets...</span>
          </div>
          <p className="text-muted mt-2 small">Loading your tickets...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger p-3 rounded-3" role="alert" id="my-tickets-error">
          <div className="fw-bold">Failed to load tickets</div>
          <div className="small">{error}</div>
          <button className="btn btn-sm btn-outline-danger mt-2" onClick={fetchTickets}>
            Try Again
          </button>
        </div>
      ) : !result || result.data.length === 0 ? (
        hasActiveFilters ? (
          // No Results Filter State
          <div className="card shadow-sm border text-center p-5 rounded-3" id="no-results-state">
            <div className="fs-1 mb-2">🔍</div>
            <h5 className="fw-bold text-dark mb-1">No matching tickets found</h5>
            <p className="text-muted small mb-3">
              No support tickets matched your search or filter criteria.
            </p>
            <div>
              <button className="btn btn-outline-secondary btn-sm" onClick={handleClearFilters}>
                Clear All Filters
              </button>
            </div>
          </div>
        ) : (
          // Empty State (No tickets owned)
          <div className="card shadow-sm border text-center p-5 rounded-3" id="empty-tickets-state">
            <div className="fs-1 mb-2">📋</div>
            <h5 className="fw-bold text-dark mb-1">No tickets submitted yet</h5>
            <p className="text-muted small mb-3">
              You haven't created any IT support tickets yet. Need help with a hardware, software, or network issue?
            </p>
            <div>
              <button
                className="btn text-white btn-sm fw-semibold px-4"
                style={{ backgroundColor: "#006B3C" }}
                onClick={onCreateTicketClick}
              >
                Create Your First Ticket
              </button>
            </div>
          </div>
        )
      ) : (
        <>
          {/* Table Container Card */}
          <div className="card shadow-sm border rounded-3 overflow-hidden mb-3" style={{ borderColor: "#E5E7EB" }}>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" id="tickets-table">
                <thead style={{ backgroundColor: "#EBF5F0", borderBottom: "2px solid #D1E7DD" }}>
                  <tr style={{ color: "#005A32", fontSize: "0.82rem", fontWeight: 700 }}>
                    <th scope="col" className="ps-3 py-3">
                      Ticket No. <span style={{ opacity: 0.5, fontSize: "0.75rem" }}>↕</span>
                    </th>
                    <th scope="col" className="py-3">
                      Created Date <span style={{ opacity: 0.5, fontSize: "0.75rem" }}>↕</span>
                    </th>
                    <th scope="col" className="py-3">Summary</th>
                    <th scope="col" className="py-3">Category</th>
                    <th scope="col" className="py-3 text-center">Requested Priority</th>
                    <th scope="col" className="py-3 text-center">IT Priority</th>
                    <th scope="col" className="py-3 text-center">Current Status</th>
                    <th scope="col" className="py-3">Ticket Owner</th>
                    <th scope="col" className="py-3">
                      Last Updated <span style={{ opacity: 0.5, fontSize: "0.75rem" }}>↕</span>
                    </th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "0.875rem" }}>
                  {result.data.map((ticket) => (
                    <tr
                      key={ticket.id}
                      style={{ cursor: onSelectTicket ? "pointer" : "default" }}
                      onClick={() => onSelectTicket && onSelectTicket(ticket.id)}
                    >
                      {/* Ticket No */}
                      <td className="ps-3 fw-bold" style={{ color: "#006B3C" }}>
                        {ticket.ticketNumber}
                      </td>

                      {/* Created Date */}
                      <td className="text-muted small">
                        {formatDate(ticket.createdAt)}
                      </td>

                      {/* Summary */}
                      <td
                        className="fw-medium text-dark text-truncate"
                        style={{ maxWidth: 220 }}
                        title={ticket.summary}
                      >
                        {ticket.summary}
                      </td>

                      {/* Category */}
                      <td className="text-secondary small">
                        {ticket.category?.name || "-"}
                      </td>

                      {/* Requested Priority */}
                      <td className="text-center">
                        {renderPriorityBadge(ticket.requestedPriority)}
                      </td>

                      {/* IT Priority */}
                      <td className="text-center">
                        {renderPriorityBadge(ticket.itPriority)}
                      </td>

                      {/* Current Status */}
                      <td className="text-center">
                        {renderStatusBadge(ticket.currentStatus)}
                      </td>

                      {/* Ticket Owner */}
                      <td className="small text-secondary">
                        {ticket.requester?.name || "Dev Requester"}
                      </td>

                      {/* Last Updated */}
                      <td className="text-muted small">
                        {formatDate(ticket.updatedAt || ticket.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls Footer */}
          <div className="d-flex flex-wrap justify-content-between align-items-center p-3 bg-white card shadow-sm border rounded-3">
            <span className="text-muted small" id="pagination-info">
              Showing{" "}
              <strong>
                {(result.pagination.currentPage - 1) * result.pagination.pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong>
                {Math.min(
                  result.pagination.currentPage * result.pagination.pageSize,
                  result.pagination.totalItems
                )}
              </strong>{" "}
              of <strong>{result.pagination.totalItems}</strong> tickets
            </span>

            <div className="d-flex gap-1 align-items-center">
              <button
                className="btn btn-sm btn-outline-secondary px-3"
                disabled={result.pagination.currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                id="prev-page-btn"
              >
                ‹ Previous
              </button>

              {/* Page Number Buttons */}
              {Array.from({ length: result.pagination.totalPages }, (_, i) => i + 1).map((pNum) => (
                <button
                  key={pNum}
                  className={`btn btn-sm ${
                    pNum === result.pagination.currentPage
                      ? "text-white fw-bold"
                      : "btn-outline-secondary"
                  }`}
                  style={{
                    backgroundColor: pNum === result.pagination.currentPage ? "#006B3C" : "transparent",
                    borderColor: pNum === result.pagination.currentPage ? "#006B3C" : "#CED4DA",
                    minWidth: 32,
                  }}
                  onClick={() => setPage(pNum)}
                >
                  {pNum}
                </button>
              ))}

              <button
                className="btn btn-sm btn-outline-secondary px-3"
                disabled={result.pagination.currentPage >= result.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                id="next-page-btn"
              >
                Next ›
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

