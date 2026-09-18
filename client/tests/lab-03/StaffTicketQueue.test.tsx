import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { StaffTicketQueue } from "../../src/components/StaffTicketQueue";
import * as api from "../../src/api";

vi.mock("../../src/api", async (importOriginal) => {
  const actual = await importOriginal<typeof api>();
  return {
    ...actual,
    fetchStaffTicketQueue: vi.fn(),
  };
});

describe("StaffTicketQueue Component", () => {
  const mockCategories: api.Category[] = [
    { id: 1, name: "Hardware", code: "HARDWARE" },
    { id: 2, name: "Software", code: "SOFTWARE" },
  ];

  const mockQueueResponse: api.PaginatedTickets = {
    data: [
      {
        id: 201,
        ticketNumber: "TKT-2026-000201",
        requesterId: 2,
        categoryId: 1,
        relatedSystemId: 1,
        requestedPriority: "MEDIUM",
        itPriority: "HIGH",
        currentStatus: "IN_PROGRESS",
        summary: "VPN connectivity drops repeatedly",
        description: "VPN disconnects every 10 minutes",
        createdAt: "2026-09-10T08:00:00.000Z",
        updatedAt: "2026-09-10T09:00:00.000Z",
        category: { id: 1, name: "Hardware" },
        requester: { id: 2, name: "Jennifer Anderson", email: "jennifer@example.com", department: "IT Support" },
      },
    ],
    pagination: {
      totalItems: 1,
      currentPage: 1,
      totalPages: 1,
      pageSize: 10,
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders header banner and loading state initially", async () => {
    vi.mocked(api.fetchStaffTicketQueue).mockReturnValue(new Promise(() => {}));

    render(
      <StaffTicketQueue
        categories={mockCategories}
        currentUser={{ id: 1, name: "Alex Support", role: "IT_STAFF" }}
      />
    );

    expect(screen.getByText("IT Staff Ticket Queue")).toBeInTheDocument();
    expect(screen.getByText("Loading IT Staff Queue...")).toBeInTheDocument();
  });

  it("renders ticket data in queue table after fetching", async () => {
    vi.mocked(api.fetchStaffTicketQueue).mockResolvedValue(mockQueueResponse);

    render(
      <StaffTicketQueue
        categories={mockCategories}
        currentUser={{ id: 1, name: "Alex Support", role: "IT_STAFF" }}
      />
    );

    await waitFor(() => {
      expect(screen.getAllByText("TKT-2026-000201")[0]).toBeInTheDocument();
    });


    expect(screen.getAllByText("VPN connectivity drops repeatedly")[0]).toBeInTheDocument();
    expect(screen.getByText("Jennifer Anderson")).toBeInTheDocument();
  });

});
