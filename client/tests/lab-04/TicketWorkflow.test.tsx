import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RequesterTicketDetail } from "../../src/components/RequesterTicketDetail";
import * as api from "../../src/api";
import { AuthUser } from "../../src/auth";

vi.mock("../../src/api", async () => {
  const actual = await vi.importActual("../../src/api");
  return {
    ...actual,
    getTicketDetail: vi.fn(),
    getStaffUsers: vi.fn(),
    getComments: vi.fn(),
    getInternalNotes: vi.fn(),
    updateTicketStatus: vi.fn(),
    indicateResolution: vi.fn(),
    getActionsTaken: vi.fn(),
  };
});

describe("Lab 4 Sprint 4 — Ticket Workflow, Resolution Gate & Concurrency UI Tests", () => {
  const mockStaffUser: AuthUser = {
    id: 2,
    email: "staff@toktickit.com",
    name: "Staff Alex",
    role: "IT_STAFF",
  };

  const mockRequesterUser: AuthUser = {
    id: 1,
    email: "requester@toktickit.com",
    name: "Requester John",
    role: "REQUESTER",
  };

  const mockTicket: api.TicketDetail = {
    id: 42,
    ticketNumber: "TKT-2026-000042",
    requesterId: 1,
    ownerId: 2,
    categoryId: 1,
    relatedSystemId: 1,
    summary: "Workflow UI Testing Ticket",
    description: "Testing resolution gate and optimistic conflict alerts",
    currentStatus: "IN_PROGRESS",
    requestedPriority: "MEDIUM",
    itPriority: "HIGH",
    createdAt: "2026-11-01T10:00:00.000Z",
    updatedAt: "2026-11-01T10:30:00.000Z",
    category: { id: 1, name: "Hardware" },
    relatedSystem: { id: 1, name: "Email" },
    requester: { id: 1, name: "Requester John", email: "requester@toktickit.com", department: "Finance" },
    owner: { id: 2, name: "Staff Alex", email: "staff@toktickit.com", role: "IT_STAFF" },
    attachments: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getTicketDetail).mockResolvedValue(mockTicket);
    vi.mocked(api.getStaffUsers).mockResolvedValue([]);
    vi.mocked(api.getComments).mockResolvedValue([]);
    vi.mocked(api.getInternalNotes).mockResolvedValue([]);
    vi.mocked(api.getActionsTaken).mockResolvedValue([]);
  });

  it("Resolution Gate: hides staff operational status controls for Requesters", async () => {
    render(
      <RequesterTicketDetail
        ticketId={42}
        requesterId={1}
        user={mockRequesterUser}
        onBack={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("TKT-2026-000042")).toBeInTheDocument();
    });

    // Requester should see advisory button "Problem Appears Resolved"
    expect(screen.getByText(/Problem Appears Resolved/i)).toBeInTheDocument();

    // Staff operational controls must NOT be visible to requester
    expect(screen.queryByText(/IT Staff Operational Controls/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /💾 Update/i })).not.toBeInTheDocument();
  });

  it("Resolution Gate: renders staff operational controls and status options for IT Staff", async () => {
    render(
      <RequesterTicketDetail
        ticketId={42}
        requesterId={1}
        user={mockStaffUser}
        onBack={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/IT Staff Operational Controls/i)).toBeInTheDocument();
    });

    // Verify status dropdown and update button exist
    const statusSelect = document.getElementById("status-workflow-select") as HTMLSelectElement;
    expect(statusSelect).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /💾 Update/i })).toBeInTheDocument();
  });

  it("Concurrency Conflict: displays warning alert/toast when HTTP 409 conflict is returned", async () => {
    vi.mocked(api.updateTicketStatus).mockRejectedValueOnce(
      new Error("Conflict: Ticket has been modified concurrently by another user")
    );

    render(
      <RequesterTicketDetail
        ticketId={42}
        requesterId={1}
        user={mockStaffUser}
        onBack={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /💾 Update/i })).toBeInTheDocument();
    });

    // Click update to trigger status update with expectedUpdatedAt
    const updateBtn = screen.getByRole("button", { name: /💾 Update/i });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Conflict: Ticket has been modified concurrently by another user/i)
      ).toBeInTheDocument();
    });
  });
});
