import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const requesters = await prisma.requesterUser.findMany();
  console.log(`Found ${requesters.length} RequesterUser records.`);
  const tickets = await prisma.ticket.findMany();
  console.log(`Found ${tickets.length} Ticket records.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
