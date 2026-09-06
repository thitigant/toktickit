import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RequesterTicketDetail } from "../../src/components/RequesterTicketDetail";
import * as api from "../../src/api";

vi.mock("../../src/api", async (importOriginal) => {
  const actual = await importOriginal<typeof api>();
  return {
    ...actual,
    getTicketDetail: vi.fn(),
    uploadAttachment: vi.fn(),
    removeAttachment: vi.fn(),
  };
});

describe("AttachmentSection Component", () => {
  const mockDetailWithAttachments: api.TicketDetail = {
    id: 201,
    ticketNumber: "TKT-2026-000201",
    requesterId: 1,
    categoryId: 1,
    relatedSystemId: 1,
    requestedPriority: "HIGH",
    itPriority: "HIGH",
    currentStatus: "IN_PROGRESS",
    summary: "VPN Connection drops repeatedly",
    description: "VPN disconnects every 5 minutes when connecting from home Wi-Fi.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    requester: { id: 1, name: "Jennifer Anderson", email: "jennifer@example.com", department: "IT", isActive: true },
    category: { id: 1, name: "Network", code: "NETWORK" },
    relatedSystem: { id: 1, name: "VPN", code: "VPN" },
    attachments: [
      {
        id: 50,
        ticketId: 201,
        fileName: "error_log.pdf",
        fileSize: 102450,
        mimeType: "application/pdf",
        filePath: "/uploads/error_log.pdf",
        isRemoved: false,
        removedAt: null,
        removalReason: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: 51,
        ticketId: 201,
        fileName: "old_screenshot.png",
        fileSize: 204800,
        mimeType: "image/png",
        filePath: "/uploads/old_screenshot.png",
        isRemoved: true,
        removedAt: new Date().toISOString(),
        removalReason: "Superceded by new screenshot",
        createdAt: new Date().toISOString(),
      },
    ],
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.getTicketDetail).mockResolvedValue(mockDetailWithAttachments);
  });

  it("displays active attachments with download links and soft-removed attachments marked", async () => {
    render(<RequesterTicketDetail ticketId={201} requesterId={1} onBack={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("error_log.pdf")).toBeInTheDocument();
    });

    expect(screen.getByText("old_screenshot.png")).toBeInTheDocument();
    expect(screen.getByText(/Superceded by new screenshot/i)).toBeInTheDocument();
  });

  it("handles soft removal modal validation and confirmation", async () => {
    vi.mocked(api.removeAttachment).mockResolvedValue({
      id: 50,
      ticketId: 201,
      fileName: "error_log.pdf",
      fileSize: 102450,
      mimeType: "application/pdf",
      filePath: "/uploads/error_log.pdf",
      isRemoved: true,
      removedAt: new Date().toISOString(),
      removalReason: "File uploaded by mistake",
      createdAt: new Date().toISOString(),
    });

    render(<RequesterTicketDetail ticketId={201} requesterId={1} onBack={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("error_log.pdf")).toBeInTheDocument();
    });

    const removeBtn = screen.getByRole("button", { name: /soft remove/i });
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(screen.getByText(/Confirm Attachment Soft Removal/i)).toBeInTheDocument();
    });

    const confirmBtn = screen.getByRole("button", { name: /confirm soft removal/i });
    expect(confirmBtn).toBeDisabled();

    const reasonInput = screen.getByPlaceholderText(/enter reason for removal/i);
    fireEvent.change(reasonInput, { target: { value: "File uploaded by mistake" } });

    expect(confirmBtn).not.toBeDisabled();
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(api.removeAttachment).toHaveBeenCalledWith(50, "File uploaded by mistake", 1);
    });
  });
});
