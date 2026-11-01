import { useState, useEffect } from "react";
import { getStaffDashboard, StaffDashboardData } from "../api";

interface StaffDashboardProps {
  onDrillDown: (filter: { status?: string; ownerId?: string }) => void;
  onSelectTicket?: (ticketId: number) => void;
  currentUser?: { id: number; name: string; role: string };
}

export function StaffDashboard({
  onDrillDown,
  onSelectTicket,
  currentUser,
}: StaffDashboardProps) {
  const [data, setData] = useState<StaffDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const res = await getStaffDashboard();
        setData(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load staff dashboard metrics");
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
        <span className="ms-2 text-muted small">Loading staff operational dashboard...</span>
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
  const userSummary = data?.userSummary;

  return (
    <div className="w-100 mb-5">
      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1" style={{ color: "#0F5132" }}>
          🛠️ IT Staff Service Desk Operations
        </h4>
        <p className="text-muted small mb-0">Authoritative operational queue metrics and urgent service request tracking</p>
      </div>

      {/* Admin User Summary Banner (If Administrator) */}
      {userSummary && (
        <div
          className="card border rounded-3 p-3 mb-4 shadow-sm"
          style={{ backgroundColor: "#F0FDF4", borderColor: "#86EFAC" }}
          id="admin-user-summary-card"
        >
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <span className="fw-bold text-success fs-6">👥 System Accounts Overview: </span>
              <span className="small text-muted">Active Users in TokTickIT Platform</span>
            </div>
            <div className="d-flex gap-4">
              <div>
                <span className="small text-muted">Total Accounts: </span>
                <span className="fw-bold text-dark">{userSummary.totalUsers}</span>
              </div>
              <div>
                <span className="small text-muted">Active IT Staff: </span>
                <span className="fw-bold text-success">{userSummary.activeStaff}</span>
              </div>
              <div>
                <span className="small text-muted">Active Requesters: </span>
                <span className="fw-bold text-primary">{userSummary.activeRequesters}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Operational Metric Cards (1-Click Drill-Down) */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-2">
          <div
            className="card shadow-sm border rounded-3 p-3 h-100 cursor-pointer hover-shadow"
            style={{ backgroundColor: "#FFFFFF", cursor: "pointer", borderLeft: "5px solid #0288D1" }}
            onClick={() => onDrillDown({ status: "NEW" })}
            id="metric-card-new"
            role="button"
            tabIndex={0}
          >
            <div className="text-muted small fw-bold text-uppercase">New</div>
            <div className="fs-3 fw-bold text-info my-1">{metrics?.newCount ?? 0}</div>
            <div className="small text-muted">Unassigned &rarr;</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-2">
          <div
            className="card shadow-sm border rounded-3 p-3 h-100 cursor-pointer hover-shadow"
            style={{ backgroundColor: "#FFFFFF", cursor: "pointer", borderLeft: "5px solid #0D6EFD" }}
            onClick={() => onDrillDown({ status: "OPEN" })}
            id="metric-card-open"
            role="button"
            tabIndex={0}
          >
            <div className="text-muted small fw-bold text-uppercase">Open</div>
            <div className="fs-3 fw-bold text-primary my-1">{metrics?.openCount ?? 0}</div>
            <div className="small text-muted">Active queue &rarr;</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card shadow-sm border rounded-3 p-3 h-100 cursor-pointer hover-shadow"
            style={{ backgroundColor: "#FFFFFF", cursor: "pointer", borderLeft: "5px solid #03543F" }}
            onClick={() => onDrillDown({ status: "IN_PROGRESS" })}
            id="metric-card-in-progress"
            role="button"
            tabIndex={0}
          >
            <div className="text-muted small fw-bold text-uppercase">In Progress</div>
            <div className="fs-3 fw-bold text-success my-1">{metrics?.inProgressCount ?? 0}</div>
            <div className="small text-muted">Work in service &rarr;</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-2">
          <div
            className="card shadow-sm border rounded-3 p-3 h-100 cursor-pointer hover-shadow"
            style={{ backgroundColor: "#FFFFFF", cursor: "pointer", borderLeft: "5px solid #D97706" }}
            onClick={() => onDrillDown({ status: "WAITING_FOR_REQUESTER" })}
            id="metric-card-waiting"
            role="button"
            tabIndex={0}
          >
            <div className="text-muted small fw-bold text-uppercase">Waiting</div>
            <div className="fs-3 fw-bold my-1" style={{ color: "#D97706" }}>
              {metrics?.waitingForRequesterCount ?? 0}
            </div>
            <div className="small text-muted">On requester &rarr;</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card shadow-sm border rounded-3 p-3 h-100 cursor-pointer hover-shadow"
            style={{ backgroundColor: "#F0FDF4", cursor: "pointer", borderLeft: "5px solid #0F5132" }}
            onClick={() => onDrillDown({ ownerId: currentUser ? String(currentUser.id) : "ME" })}
            id="metric-card-my-assigned"
            role="button"
            tabIndex={0}
          >
            <div className="text-success small fw-bold text-uppercase">My Assigned</div>
            <div className="fs-3 fw-bold my-1" style={{ color: "#0F5132" }}>
              {metrics?.myAssignedCount ?? 0}
            </div>
            <div className="small text-muted">Owned by me &rarr;</div>
          </div>
        </div>
      </div>

      {/* Recent Operational Tickets */}
      <div className="card shadow-sm border rounded-3 p-4" style={{ backgroundColor: "#FFFFFF" }}>
        <h6 className="fw-bold mb-3" style={{ color: "#0F5132" }}>
          🕒 Recent Service Desk Tickets
        </h6>

        {recentTickets.length === 0 ? (
          <div className="text-center py-4 text-muted small">
            <p className="mb-0">No active tickets found in queue.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover table-sm align-middle mb-0" id="staff-recent-tickets-table">
              <thead style={{ backgroundColor: "#F0FDF4" }}>
                <tr>
                  <th className="small fw-bold text-muted" style={{ width: "160px" }}>Ticket No.</th>
                  <th className="small fw-bold text-muted">Summary</th>
                  <th className="small fw-bold text-muted" style={{ width: "130px" }}>Category</th>
                  <th className="small fw-bold text-muted" style={{ width: "130px" }}>Requester</th>
                  <th className="small fw-bold text-muted" style={{ width: "130px" }}>Assigned Staff</th>
                  <th className="small fw-bold text-muted" style={{ width: "130px" }}>Status</th>
                  <th className="small fw-bold text-muted" style={{ width: "100px" }}>Priority</th>
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
                    <td className="small">{t.requesterName}</td>
                    <td className="small text-muted">{t.assignedStaffName}</td>
                    <td className="small">
                      <span className="badge bg-light text-dark border">{t.status}</span>
                    </td>
                    <td className="small">
                      <span className="badge bg-secondary">{t.itPriority}</span>
                    </td>
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

