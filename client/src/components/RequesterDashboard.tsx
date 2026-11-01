import { useState, useEffect } from "react";
import { getRequesterDashboard, RequesterDashboardData } from "../api";

interface RequesterDashboardProps {
  onDrillDown: (filter: { status?: string }) => void;
  onCreateTicketClick: () => void;
  onSelectTicket?: (ticketId: number) => void;
}

export function RequesterDashboard({
  onDrillDown,
  onCreateTicketClick,
  onSelectTicket,
}: RequesterDashboardProps) {
  const [data, setData] = useState<RequesterDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const res = await getRequesterDashboard();
        setData(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border spinner-border-sm text-success" role="status" />
        <span className="ms-2 text-muted small">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger small py-3" role="alert">
        {error}
      </div>
    );
  }

  const metrics = data?.metrics;
  const recentTickets = data?.recentTickets || [];

  return (
    <div className="w-100 mb-5">
      {/* Header with Quick Action */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: "#0F5132" }}>
            📊 Requester Service Desk Dashboard
          </h4>
          <p className="text-muted small mb-0">Overview of your submitted support requests and current progress</p>
        </div>
        <button
          type="button"
          className="btn btn-success fw-bold btn-sm px-3 shadow-sm"
          onClick={onCreateTicketClick}
          id="dashboard-create-ticket-btn"
        >
          ➕ Create New Ticket
        </button>
      </div>

      {/* Authoritative Metric Cards (1-Click Drill-Down) */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card shadow-sm border rounded-3 p-3 h-100 cursor-pointer hover-shadow transition-all"
            style={{ backgroundColor: "#FFFFFF", cursor: "pointer", borderLeft: "5px solid #0D6EFD" }}
            onClick={() => onDrillDown({ status: "ALL" })}
            id="metric-open-tickets"
            role="button"
            tabIndex={0}
          >
            <div className="text-muted small fw-bold text-uppercase">Total Active</div>
            <div className="fs-2 fw-bold text-dark my-1">{metrics?.totalOpenTickets ?? 0}</div>
            <div className="small text-muted">Tickets in queue or progress &rarr;</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card shadow-sm border rounded-3 p-3 h-100 cursor-pointer hover-shadow transition-all"
            style={{ backgroundColor: "#FFFFFF", cursor: "pointer", borderLeft: "5px solid #03543F" }}
            onClick={() => onDrillDown({ status: "IN_PROGRESS" })}
            id="metric-in-progress"
            role="button"
            tabIndex={0}
          >
            <div className="text-muted small fw-bold text-uppercase">In Progress</div>
            <div className="fs-2 fw-bold text-success my-1">{metrics?.inProgressTickets ?? 0}</div>
            <div className="small text-muted">Currently being serviced &rarr;</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card shadow-sm border rounded-3 p-3 h-100 cursor-pointer hover-shadow transition-all"
            style={{ backgroundColor: "#FFFFFF", cursor: "pointer", borderLeft: "5px solid #0F5132" }}
            onClick={() => onDrillDown({ status: "RESOLVED" })}
            id="metric-resolved"
            role="button"
            tabIndex={0}
          >
            <div className="text-muted small fw-bold text-uppercase">Resolved</div>
            <div className="fs-2 fw-bold my-1" style={{ color: "#0F5132" }}>
              {metrics?.resolvedTickets ?? 0}
            </div>
            <div className="small text-muted">Pending final verification &rarr;</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card shadow-sm border rounded-3 p-3 h-100 cursor-pointer hover-shadow transition-all"
            style={{ backgroundColor: "#FFFFFF", cursor: "pointer", borderLeft: "5px solid #6C757D" }}
            onClick={() => onDrillDown({ status: "CLOSED" })}
            id="metric-closed"
            role="button"
            tabIndex={0}
          >
            <div className="text-muted small fw-bold text-uppercase">Closed</div>
            <div className="fs-2 fw-bold text-muted my-1">{metrics?.closedTickets ?? 0}</div>
            <div className="small text-muted">Historical requests archive &rarr;</div>
          </div>
        </div>
      </div>

      {/* Recent Tickets Section */}
      <div className="card shadow-sm border rounded-3 p-4" style={{ backgroundColor: "#FFFFFF" }}>
        <h6 className="fw-bold mb-3" style={{ color: "#0F5132" }}>
          🕒 Recent Tickets
        </h6>

        {recentTickets.length === 0 ? (
          <div className="text-center py-4 text-muted small">
            <p className="mb-0">You have not submitted any tickets yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover table-sm align-middle mb-0" id="requester-recent-tickets-table">
              <thead style={{ backgroundColor: "#F0FDF4" }}>
                <tr>
                  <th className="small fw-bold text-muted" style={{ width: "160px" }}>Ticket No.</th>
                  <th className="small fw-bold text-muted">Summary</th>
                  <th className="small fw-bold text-muted" style={{ width: "130px" }}>Category</th>
                  <th className="small fw-bold text-muted" style={{ width: "130px" }}>Status</th>
                  <th className="small fw-bold text-muted" style={{ width: "100px" }}>Priority</th>
                  <th className="small fw-bold text-muted" style={{ width: "150px" }}>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((t) => (
                  <tr
                    key={t.id}
                    className="cursor-pointer"
                    style={{ cursor: onSelectTicket ? "pointer" : "default" }}
                    onClick={() => onSelectTicket && onSelectTicket(t.id)}
                  >
                    <td className="small fw-bold text-success">{t.ticketNumber}</td>
                    <td className="small fw-semibold">{t.title}</td>
                    <td className="small text-muted">{t.categoryName}</td>
                    <td className="small">
                      <span className="badge bg-light text-dark border">{t.status}</span>
                    </td>
                    <td className="small">
                      <span className="badge bg-secondary">{t.priority}</span>
                    </td>
                    <td className="small text-muted">{new Date(t.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

