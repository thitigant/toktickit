import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RequesterDashboard } from "../../src/components/RequesterDashboard";
import * as api from "../../src/api";

vi.mock("../../src/api", async () => {
  const actual = await vi.importActual("../../src/api");
  return {
    ...actual,
    getRequesterDashboard: vi.fn(),
  };
});

describe("RequesterDashboard Component", () => {
  const mockDashboardData: api.RequesterDashboardData = {
    metrics: {
      totalOpenTickets: 5,
      inProgressTickets: 2,
      waitingForRequesterTickets: 1,
      resolvedTickets: 3,
      closedTickets: 8,
    },
    recentTickets: [
      {
        id: 101,
        ticketNumber: "TKT-2026-000101",
        title: "VPN keeps disconnecting every hour",
        status: "IN_PROGRESS",
        priority: "HIGH",
        categoryName: "Network",
        updatedAt: "2026-11-01T12:00:00.000Z",
        createdAt: "2026-11-01T10:00:00.000Z",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders metric cards with authoritative counts and recent tickets table", async () => {
    vi.mocked(api.getRequesterDashboard).mockResolvedValueOnce(mockDashboardData);

    render(
      <RequesterDashboard
        onDrillDown={vi.fn()}
        onCreateTicketClick={vi.fn()}
      />
    );

    // Wait for metrics to render
    await waitFor(() => {
      expect(screen.getByText("Total Active")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("In Progress")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("Resolved")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("Closed")).toBeInTheDocument();
      expect(screen.getByText("8")).toBeInTheDocument();
    });

    // Recent tickets content
    expect(screen.getByText("TKT-2026-000101")).toBeInTheDocument();
    expect(screen.getByText("VPN keeps disconnecting every hour")).toBeInTheDocument();
  });

  it("triggers 1-click drill-down navigation when clicking a metric card", async () => {
    vi.mocked(api.getRequesterDashboard).mockResolvedValueOnce(mockDashboardData);
    const mockDrillDown = vi.fn();

    render(
      <RequesterDashboard
        onDrillDown={mockDrillDown}
        onCreateTicketClick={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Total Active")).toBeInTheDocument();
    });

    const inProgressCard = document.getElementById("metric-in-progress");
    expect(inProgressCard).toBeInTheDocument();
    fireEvent.click(inProgressCard!);

    expect(mockDrillDown).toHaveBeenCalledWith({ status: "IN_PROGRESS" });
  });

  it("triggers quick action on create ticket button click", async () => {
    vi.mocked(api.getRequesterDashboard).mockResolvedValueOnce(mockDashboardData);
    const mockCreateClick = vi.fn();

    render(
      <RequesterDashboard
        onDrillDown={vi.fn()}
        onCreateTicketClick={mockCreateClick}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Create New Ticket/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Create New Ticket/i }));
    expect(mockCreateClick).toHaveBeenCalled();
  });
});

