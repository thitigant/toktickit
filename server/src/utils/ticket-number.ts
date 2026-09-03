import { PrismaClient } from "@prisma/client";

/**
 * Generates a unique Ticket Number with format TKT-YYYY-XXXXXX.
 */
export async function generateTicketNumber(prisma?: PrismaClient): Promise<string> {
  const year = new Date().getFullYear();
  if (prisma) {
    const count = await prisma.ticket.count();
    const seq = String(count + 1).padStart(6, "0");
    return `TKT-${year}-${seq}`;
  }
  const randomSeq = String(Math.floor(Math.random() * 900000) + 100000).padStart(6, "0");
  return `TKT-${year}-${randomSeq}`;
}
