import { useState, useEffect, useCallback } from "react";
import {
  getTickets,
  Category,
  PaginatedTickets,
  GetTicketsQueryParams,
} from "../api.js";

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
  const [selectedPriority, setSelectedPriority] = useState<string>("");
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
        priority: selectedPriority || undefined,
        status: selectedStatus || undefined,
        page,
        limit: pageSize,
        sortBy: "createdAt",
        sortOrder: "desc",
      };
      const res = await getTickets(queryParams, requesterId);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [requesterId, search, selectedCategory, selectedPriority, selectedStatus, page, pageSize]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedPriority("");
    setSelectedStatus("");
    setPage(1);
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority.toUpperCase()) {
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

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
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

  const hasActiveFilters = search || selectedCategory || selectedPriority || selectedStatus;

  return (
    <div className="w-100">
      {/* Header Banner */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="h3 fw-bold text-dark mb-1">My Tickets</h2>
          <p className="text-muted small mb-0">View and track all of your support requests.</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            id="clear-filters-btn"
          >
            🔄 Clear Filters
          </button>
          <button
            className="btn text-white btn-sm fw-bold px-3 d-flex align-items-center gap-1"
            style={{ backgroundColor: "#006B3C" }}
            onClick={onCreateTicketClick}
            id="create-ticket-header-btn"
          >
            ➕ Create Ticket
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="card shadow-sm border-0 p-3 mb-4" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="row g-2 align-items-center">
          {/* Search Bar */}
          <div className="col-12 col-md-4">
            <label htmlFor="search-tickets-input" className="form-label small text-muted mb-1 fw-bold">
              Search
            </label>
            <input
              type="text"
              id="search-tickets-input"
              className="form-control form-control-sm"
              placeholder="Search by ticket number or summary..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Category Filter */}
          <div className="col-6 col-md-3">
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

          {/* Priority Filter */}
          <div className="col-6 col-md-2">
            <label htmlFor="priority-filter-select" className="form-label small text-muted mb-1 fw-bold">
              Requested Priority
            </label>
            <select
              id="priority-filter-select"
              className="form-select form-select-sm"
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
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
          <div className="col-12 col-md-3">
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
              <option value="NEW">New</option>
              <option value="IN_PROGRESS">In Progress</option>
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
        <div className="alert alert-danger p-3 rounded" role="alert" id="my-tickets-error">
          <div className="fw-bold">Failed to load tickets</div>
          <div className="small">{error}</div>
          <button className="btn btn-sm btn-outline-danger mt-2" onClick={fetchTickets}>
            Try Again
          </button>
        </div>
      ) : !result || result.data.length === 0 ? (
        hasActiveFilters ? (
          // No Results Filter State
          <div className="card shadow-sm border-0 text-center p-5 rounded" id="no-results-state">
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
          <div className="card shadow-sm border-0 text-center p-5 rounded" id="empty-tickets-state">
            <div className="fs-1 mb-2">📋</div>
            <h5 className="fw-bold text-dark mb-1">No tickets submitted yet</h5>
            <p className="text-muted small mb-3">
              You haven't created any IT support tickets yet. Need help with a hardware, software, or network issue?
            </p>
            <div>
              <button
                className="btn text-white btn-sm fw-bold px-4"
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
          {/* Desktop Table View (>= 768px) */}
          <div className="card shadow-sm border-0 d-none d-md-block overflow-hidden mb-3">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" id="tickets-table">
                <thead style={{ backgroundColor: "#EAF6EF" }}>
                  <tr className="text-muted small">
                    <th scope="col" className="ps-3">Ticket No.</th>
                    <th scope="col">Created Date</th>
                    <th scope="col">Summary</th>
                    <th scope="col">Category</th>
                    <th scope="col">Req. Priority</th>
                    <th scope="col">IT Priority</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.map((ticket) => (
                    <tr
                      key={ticket.id}
                      style={{ cursor: onSelectTicket ? "pointer" : "default" }}
                      onClick={() => onSelectTicket && onSelectTicket(ticket.id)}
                    >
                      <td className="ps-3 fw-bold text-success small">{ticket.ticketNumber}</td>
                      <td className="small text-muted">
                        {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="fw-semibold text-dark text-truncate" style={{ maxWidth: 260 }}>
                        {ticket.summary}
                      </td>
                      <td className="small">{ticket.category?.name || "-"}</td>
                      <td>
                        <span className={`badge ${getPriorityBadgeClass(ticket.requestedPriority)} px-2 py-1`}>
                          {ticket.requestedPriority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getPriorityBadgeClass(ticket.itPriority)} px-2 py-1`}>
                          {ticket.itPriority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(ticket.currentStatus)} px-2 py-1`}>
                          {ticket.currentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View (< 768px) */}
          <div className="d-md-none d-flex flex-column gap-3 mb-3" id="tickets-mobile-cards">
            {result.data.map((ticket) => (
              <div
                key={ticket.id}
                className="card shadow-sm border-0 p-3"
                style={{ cursor: onSelectTicket ? "pointer" : "default" }}
                onClick={() => onSelectTicket && onSelectTicket(ticket.id)}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold text-success small">{ticket.ticketNumber}</span>
                  <span className={`badge ${getStatusBadgeClass(ticket.currentStatus)} px-2 py-1`}>
                    {ticket.currentStatus}
                  </span>
                </div>
                <h6 className="fw-bold text-dark mb-2">{ticket.summary}</h6>
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 text-muted small">
                  <span>{ticket.category?.name || "-"}</span>
                  <div className="d-flex gap-1 align-items-center">
                    <span className="text-muted me-1">Priority:</span>
                    <span className={`badge ${getPriorityBadgeClass(ticket.requestedPriority)} px-2 py-1`}>
                      {ticket.requestedPriority}
                    </span>
                  </div>
                </div>
                <div className="text-muted small mt-2 pt-2 border-top">
                  Created: {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="d-flex flex-wrap justify-content-between align-items-center p-3 bg-white card shadow-sm border-0">
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

            <div className="btn-group btn-group-sm">
              <button
                className="btn btn-outline-secondary"
                disabled={result.pagination.currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                id="prev-page-btn"
              >
                &laquo; Previous
              </button>
              <button
                className="btn btn-outline-success active"
                disabled
              >
                {result.pagination.currentPage} / {result.pagination.totalPages}
              </button>
              <button
                className="btn btn-outline-secondary"
                disabled={result.pagination.currentPage >= result.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                id="next-page-btn"
              >
                Next &raquo;
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
