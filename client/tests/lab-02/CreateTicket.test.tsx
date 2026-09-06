import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateTicketForm } from "../../src/components/CreateTicketForm";
import * as api from "../../src/api";

vi.mock("../../src/api", async (importOriginal) => {
  const actual = await importOriginal<typeof api>();
  return {
    ...actual,
    getRequesters: vi.fn(),
    getRelatedSystems: vi.fn(),
    checkSystem: vi.fn(),
    createTicket: vi.fn(),
  };
});

describe("CreateTicket Component", () => {
  const mockRequesters: api.RequesterUser[] = [
    { id: 1, name: "Jennifer Anderson", email: "jennifer@example.com", department: "IT", isActive: true },
  ];
  const mockSystems: api.RelatedSystem[] = [
    { id: 1, name: "Email", code: "EMAIL" },
  ];
  const mockCategories: api.Category[] = [
    { id: 1, name: "Hardware", code: "HARDWARE" },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.getRequesters).mockResolvedValue(mockRequesters);
    vi.mocked(api.getRelatedSystems).mockResolvedValue(mockSystems);
    vi.mocked(api.checkSystem).mockResolvedValue({ online: true, categories: mockCategories });
  });

  it("renders form fields, requester selector, and submit button", async () => {
    render(<CreateTicketForm />);

    await waitFor(() => {
      expect(screen.getByText(/Create IT Support Ticket/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Summary/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Submit Ticket/i })).toBeInTheDocument();
  });

  it("validates field length constraints before submitting", async () => {
    render(<CreateTicketForm />);

    await waitFor(() => {
      expect(screen.getByText(/Create IT Support Ticket/i)).toBeInTheDocument();
    });

    const summaryInput = screen.getByLabelText(/Summary/i);
    const descInput = screen.getByLabelText(/Description/i);

    fireEvent.change(summaryInput, { target: { value: "Abc" } });
    fireEvent.change(descInput, { target: { value: "Too short" } });

    fireEvent.click(screen.getByRole("button", { name: /Submit Ticket/i }));

    await waitFor(() => {
      expect(screen.getByText(/Summary must be between 5 and 150 characters/i)).toBeInTheDocument();
    });
  });

  it("submits valid form data and displays ticket number on success", async () => {
    vi.mocked(api.createTicket).mockResolvedValue({
      id: 10,
      ticketNumber: "TKT-2026-000010",
      requesterId: 1,
      categoryId: 1,
      relatedSystemId: 1,
      requestedPriority: "MEDIUM",
      itPriority: "MEDIUM",
      currentStatus: "NEW",
      summary: "Valid test summary for ticket",
      description: "Valid test description with sufficient length for ticket creation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    render(<CreateTicketForm />);

    await waitFor(() => {
      expect(screen.getByText(/Create IT Support Ticket/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Summary/i), {
      target: { value: "Laptop battery drains quickly" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "My laptop battery is draining faster than normal under ordinary workload." },
    });

    fireEvent.click(screen.getByRole("button", { name: /Submit Ticket/i }));

    await waitFor(() => {
      expect(screen.getByText(/Ticket Created Successfully!/i)).toBeInTheDocument();
      expect(screen.getByText(/TKT-2026-000010/i)).toBeInTheDocument();
    });
  });
});
