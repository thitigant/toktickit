import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MyTicketsList } from "../../src/components/MyTicketsList.js";
import * as api from "../../src/api.js";

vi.mock("../../src/api.js", async (importOriginal) => {
  const actual = await importOriginal<typeof api>();
  return {
    ...actual,
    getTickets: vi.fn(),
  };
});

describe("MyTicketsList Component", () => {
  const mockCategories: api.Category[] = [
    { id: 1, name: "Hardware", code: "HARDWARE" },
    { id: 2, name: "Software", code: "SOFTWARE" },
  ];

  const mockTicketsResponse: api.PaginatedTickets = {
    data: [
      {
        id: 101,
        ticketNumber: "TKT-2026-000001",
        requesterId: 1,
        categoryId: 1,
        relatedSystemId: 1,
        requestedPriority: "HIGH",
        itPriority: "HIGH",
        currentStatus: "NEW",
        summary: "Screen flicker on laptop",
        description: "The laptop display flickers.",
        createdAt: "2026-09-01T10:00:00.000Z",
        updatedAt: "2026-09-01T10:00:00.000Z",
        category: { id: 1, name: "Hardware" },
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
    vi.clearAllMocks();
  });

  it("renders search bar, category dropdown, priority dropdown, status dropdown and clear filters button", async () => {
    vi.mocked(api.getTickets).mockResolvedValueOnce(mockTicketsResponse);

    render(
      <MyTicketsList
        requesterId={1}
        categories={mockCategories}
        onCreateTicketClick={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText(/search by ticket number or summary/i)).toBeDefined();
    expect(screen.getByLabelText(/category/i)).toBeDefined();
    expect(screen.getByLabelText(/requested priority/i)).toBeDefined();
    expect(screen.getByLabelText(/current status/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /clear filters/i })).toBeDefined();

    await waitFor(() => {
      expect(screen.getAllByText("TKT-2026-000001").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Screen flicker on laptop").length).toBeGreaterThan(0);
    });
  });

  it("renders empty state when requester has no tickets", async () => {
    vi.mocked(api.getTickets).mockResolvedValueOnce({
      data: [],
      pagination: { totalItems: 0, currentPage: 1, totalPages: 1, pageSize: 10 },
    });

    render(
      <MyTicketsList
        requesterId={1}
        categories={mockCategories}
        onCreateTicketClick={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("No tickets submitted yet")).toBeDefined();
    });
  });

  it("renders no-results state when search filter returns empty list", async () => {
    vi.mocked(api.getTickets).mockImplementation(async (params) => {
      if (params.search === "nonexistent") {
        return {
          data: [],
          pagination: { totalItems: 0, currentPage: 1, totalPages: 1, pageSize: 10 },
        };
      }
      return mockTicketsResponse;
    });

    render(
      <MyTicketsList
        requesterId={1}
        categories={mockCategories}
        onCreateTicketClick={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getAllByText("TKT-2026-000001").length).toBeGreaterThan(0);
    });

    const searchInput = screen.getByPlaceholderText(/search by ticket number or summary/i);
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    await waitFor(() => {
      expect(screen.getByText("No matching tickets found")).toBeDefined();
    });
  });
});
