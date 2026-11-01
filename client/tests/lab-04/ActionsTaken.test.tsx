import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ActionsTaken } from "../../src/components/ActionsTaken";
import * as api from "../../src/api";

vi.mock("../../src/api", async () => {
  const actual = await vi.importActual("../../src/api");
  return {
    ...actual,
    getActionsTaken: vi.fn(),
    createActionTaken: vi.fn(),
    updateActionTaken: vi.fn(),
  };
});

describe("ActionsTaken Component", () => {
  const mockFormatDateTime = (d?: string) => d || "-";

  const mockActions: api.ActionTaken[] = [
    {
      id: 1,
      ticketId: 101,
      actionDateTime: "2026-11-01T10:00:00.000Z",
      actionDescription: "Checked server diagnostics and logs",
      result: "High memory usage detected",
      performedById: 2,
      performedBy: { id: 2, name: "IT Staff Jane", email: "jane@toktickit.com" },
      followUpRequired: true,
      followUpNote: "Restart service during maintenance window",
      attachmentNotes: "log-dump.txt",
      createdAt: "2026-11-01T10:05:00.000Z",
      updatedAt: "2026-11-01T10:05:00.000Z",
    },
    {
      id: 2,
      ticketId: 101,
      actionDateTime: "2026-11-01T11:00:00.000Z",
      actionDescription: "Restarted daemon service",
      result: "Service operational and healthy",
      performedById: 2,
      performedBy: { id: 2, name: "IT Staff Jane", email: "jane@toktickit.com" },
      followUpRequired: false,
      followUpNote: null,
      attachmentNotes: null,
      createdAt: "2026-11-01T11:05:00.000Z",
      updatedAt: "2026-11-01T11:05:00.000Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders actions list properly for requesters (read-only mode)", async () => {
    vi.mocked(api.getActionsTaken).mockResolvedValueOnce(mockActions);

    render(
      <ActionsTaken
        ticketId={101}
        isStaffOrAdmin={false}
        formatDateTime={mockFormatDateTime}
      />
    );

    // Should display actions header with count
    await waitFor(() => {
      expect(screen.getByText(/Actions Taken/i)).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    // Content checks (both desktop table and mobile view render, so we use getAllByText)
    expect(screen.getAllByText("Checked server diagnostics and logs").length).toBeGreaterThan(0);
    expect(screen.getAllByText("High memory usage detected").length).toBeGreaterThan(0);
    expect(screen.getAllByText("IT Staff Jane").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Restart service during maintenance window").length).toBeGreaterThan(0);

    // Requesters should NOT see + Add Action button
    expect(screen.queryByRole("button", { name: /\+ Add Action/i })).not.toBeInTheDocument();
  });

  it("allows staff/admin to view + Add Action button and open create form", async () => {
    vi.mocked(api.getActionsTaken).mockResolvedValueOnce(mockActions);

    render(
      <ActionsTaken
        ticketId={101}
        isStaffOrAdmin={true}
        formatDateTime={mockFormatDateTime}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /\+ Add Action/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /\+ Add Action/i }));

    expect(screen.getByText(/New Action Taken/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Describe the action taken/i)).toBeInTheDocument();
  });

  it("validates that follow-up note is required when follow-up is checked", async () => {
    vi.mocked(api.getActionsTaken).mockResolvedValueOnce([]);

    render(
      <ActionsTaken
        ticketId={101}
        isStaffOrAdmin={true}
        formatDateTime={mockFormatDateTime}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /\+ Add Action/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /\+ Add Action/i }));

    const descInput = screen.getByPlaceholderText(/Describe the action taken/i);
    const resultInput = screen.getByPlaceholderText(/Describe the result/i);
    const checkbox = screen.getByLabelText(/Follow-Up Required/i);

    fireEvent.change(descInput, { target: { value: "Investigated network traffic" } });
    fireEvent.change(resultInput, { target: { value: "All good" } });
    fireEvent.click(checkbox);

    const formElement = screen.getByRole("button", { name: /Save Action Taken/i }).closest("form");
    fireEvent.submit(formElement!);

    await waitFor(() => {
      expect(
        screen.getByText(/Follow-up note is required when follow-up is checked/i)
      ).toBeInTheDocument();
    });

    expect(api.createActionTaken).not.toHaveBeenCalled();
  });

  it("submits new action when form is valid", async () => {
    vi.mocked(api.getActionsTaken).mockResolvedValueOnce([]);
    vi.mocked(api.createActionTaken).mockResolvedValueOnce({
      ...mockActions[1],
      id: 3,
    });
    vi.mocked(api.getActionsTaken).mockResolvedValueOnce([mockActions[1]]);

    render(
      <ActionsTaken
        ticketId={101}
        isStaffOrAdmin={true}
        formatDateTime={mockFormatDateTime}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /\+ Add Action/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /\+ Add Action/i }));

    const descInput = screen.getByPlaceholderText(/Describe the action taken/i);
    const resultInput = screen.getByPlaceholderText(/Describe the result/i);

    fireEvent.change(descInput, { target: { value: "Applied hotfix patch to production" } });
    fireEvent.change(resultInput, { target: { value: "Fix confirmed" } });

    const submitBtn = screen.getByRole("button", { name: /Save Action Taken/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.createActionTaken).toHaveBeenCalledWith(
        101,
        expect.objectContaining({
          actionDescription: "Applied hotfix patch to production",
          result: "Fix confirmed",
          followUpRequired: false,
        })
      );
    });
  });
});
