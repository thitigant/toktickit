import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { StaffDashboard } from "../../src/components/StaffDashboard";
import * as api from "../../src/api";

vi.mock("../../src/api", async () => {
  const actual = await vi.importActual("../../src/api");
  return {
    ...actual,
    getStaffDashboard: vi.fn(),
  };
});

describe("StaffDashboard Component", () => {
  const mockStaffData: api.StaffDashboardData = {
    metrics: {
      newCount: 4,
      openCount: 9,
      inProgressCount: 7,
      waitingForRequesterCount: 2,
      myAssignedCount: 5,
      unassignedCount: 6,
      highPriorityCount: 3,
      criticalPriorityCount: 1,
    },
    recentTickets: [
      {
        id: 202,
        ticketNumber: "TKT-2026-000202",
        title: "Printer offline on 3rd floor",
        status: "OPEN",
        itPriority: "HIGH",
        categoryName: "Hardware",
        requesterName: "Sarah Connor",
        assignedStaffName: "John Connor",
        updatedAt: "2026-11-01T14:00:00.000Z",
      },
    ],
    userSummary: {
      totalUsers: 15,
      activeStaff: 4,
      activeRequesters: 11,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders operational metric cards and recent tickets correctly", async () => {
    vi.mocked(api.getStaffDashboard).mockResolvedValueOnce(mockStaffData);

    render(
      <StaffDashboard
        onDrillDown={vi.fn()}
        currentUser={{ id: 2, name: "Staff John", role: "IT_STAFF" }}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("New")).toBeInTheDocument();
      expect(screen.getAllByText("4").length).toBeGreaterThan(0);
      expect(screen.getByText("Open")).toBeInTheDocument();
      expect(screen.getByText("9")).toBeInTheDocument();
      expect(screen.getByText("My Assigned")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    expect(screen.getByText("TKT-2026-000202")).toBeInTheDocument();
    expect(screen.getByText("Printer offline on 3rd floor")).toBeInTheDocument();
  });

  it("renders userSummary banner for Administrator", async () => {
    vi.mocked(api.getStaffDashboard).mockResolvedValueOnce(mockStaffData);

    render(
      <StaffDashboard
        onDrillDown={vi.fn()}
        currentUser={{ id: 1, name: "Admin User", role: "ADMINISTRATOR" }}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/System Accounts Overview/i)).toBeInTheDocument();
      expect(screen.getByText("15")).toBeInTheDocument();
    });
  });

  it("triggers 1-click drill-down navigation when clicking a status card", async () => {
    vi.mocked(api.getStaffDashboard).mockResolvedValueOnce(mockStaffData);
    const mockDrillDown = vi.fn();

    render(
      <StaffDashboard
        onDrillDown={mockDrillDown}
        currentUser={{ id: 2, name: "Staff John", role: "IT_STAFF" }}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("New")).toBeInTheDocument();
    });

    const newCard = document.getElementById("metric-card-new");
    expect(newCard).toBeInTheDocument();
    fireEvent.click(newCard!);

    expect(mockDrillDown).toHaveBeenCalledWith({ status: "NEW" });
  });

  it("triggers 1-click drill-down for My Assigned card", async () => {
    vi.mocked(api.getStaffDashboard).mockResolvedValueOnce(mockStaffData);
    const mockDrillDown = vi.fn();

    render(
      <StaffDashboard
        onDrillDown={mockDrillDown}
        currentUser={{ id: 2, name: "Staff John", role: "IT_STAFF" }}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("My Assigned")).toBeInTheDocument();
    });

    const myAssignedCard = document.getElementById("metric-card-my-assigned");
    expect(myAssignedCard).toBeInTheDocument();
    fireEvent.click(myAssignedCard!);

    expect(mockDrillDown).toHaveBeenCalledWith({ ownerId: "2" });
  });
});
