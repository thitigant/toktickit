import { describe, it, expect } from "vitest";
import { generateTicketNumber } from "../../src/utils/ticket-number.js";

describe("UNIT-01: Ticket Number Generator", () => {
  it("should return string matching TKT-\\d{4}-\\d{6}", async () => {
    const ticketNumber = await generateTicketNumber();
    expect(ticketNumber).toMatch(/^TKT-\d{4}-\d{6}$/);
  });
});
