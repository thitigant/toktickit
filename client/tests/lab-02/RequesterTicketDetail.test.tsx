import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RequesterTicketDetail } from "../../src/components/RequesterTicketDetail.js";
import * as api from "../../src/api.js";

vi.mock("../../src/api.js", async (importOriginal) => {
  const actual = await importOriginal<typeof api>();
  return {
    ...actual,
    getTicketDetail: vi.fn(),
    uploadAttachment: vi.fn(),
    removeAttachment: vi.fn(),
  };
});

describe("RequesterTicketDetail Component", () => {
  const mockDetail: api.TicketDetail = {
    id: 101,
    ticketNumber: "TKT-2026-000101",
    requesterId: 1,
    categoryId: 1,
    relatedSystemId: 1,
    requestedPriority: "HIGH",
    itPriority: "HIGH",
    currentStatus: "NEW",
    summary: "Screen flicker on laptop",
    description: "The display flickers during high load.",
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
    category: { id: 1, name: "Hardware" },
    relatedSystem: { id: 1, name: "Corporate Laptop" },
    requester: { id: 1, name: "Jennifer Anderson", email: "j@example.com", department: "IT" },
    attachments: [
      {
        id: 1,
        ticketId: 101,
        fileName: "screenshot.png",
        fileSize: 500000,
        mimeType: "image/png",
        isRemoved: false,
        createdAt: "2026-09-01T10:05:00.000Z",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders read-only ticket detail and active attachment list", async () => {
    vi.mocked(api.getTicketDetail).mockResolvedValueOnce(mockDetail);

    render(
      <RequesterTicketDetail
        ticketId={101}
        requesterId={1}
        onBack={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("TKT-2026-000101")).toBeDefined();
      expect(screen.getByText("Screen flicker on laptop")).toBeDefined();
      expect(screen.getByText("screenshot.png")).toBeDefined();
      expect(screen.getByRole("button", { name: /soft remove/i })).toBeDefined();
    });
  });

  it("opens soft remove modal and validates removal reason", async () => {
    vi.mocked(api.getTicketDetail).mockResolvedValueOnce(mockDetail);

    render(
      <RequesterTicketDetail
        ticketId={101}
        requesterId={1}
        onBack={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("screenshot.png")).toBeDefined();
    });

    const removeBtn = screen.getByRole("button", { name: /soft remove/i });
    fireEvent.click(removeBtn);

    expect(screen.getByText(/Confirm Attachment Soft Removal/i)).toBeDefined();

    const confirmBtn = screen.getByRole("button", { name: /confirm soft removal/i });
    expect(confirmBtn.getAttribute("disabled")).not.toBeNull();

    const reasonInput = screen.getByPlaceholderText(/enter reason for removal/i);
    fireEvent.change(reasonInput, { target: { value: "Uploaded incorrect image file" } });

    vi.mocked(api.removeAttachment).mockResolvedValueOnce({
      ...mockDetail.attachments![0],
      isRemoved: true,
      removalReason: "Uploaded incorrect image file",
    });

    vi.mocked(api.getTicketDetail).mockResolvedValueOnce({
      ...mockDetail,
      attachments: [
        {
          ...mockDetail.attachments![0],
          isRemoved: true,
          removalReason: "Uploaded incorrect image file",
        },
      ],
    });

    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(api.removeAttachment).toHaveBeenCalledWith(1, "Uploaded incorrect image file", 1);
    });
  });

  it("shows error state when ticket is forbidden or not found", async () => {
    vi.mocked(api.getTicketDetail).mockRejectedValueOnce(
      new Error("Access denied to ticket belonging to another requester")
    );

    render(
      <RequesterTicketDetail
        ticketId={101}
        requesterId={2}
        onBack={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Access denied to ticket belonging to another requester")).toBeDefined();
    });
  });
});
