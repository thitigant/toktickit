import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting Lab 3 seed...");

  // --- Seed Categories ---
  const categories = [
    { name: "Account and Access", code: "ACCOUNT_ACCESS" },
    { name: "Hardware", code: "HARDWARE" },
    { name: "Software", code: "SOFTWARE" },
    { name: "Network", code: "NETWORK" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { code: cat.code },
      create: { name: cat.name, code: cat.code },
    });
  }
  console.log("Seeded 4 categories.");

  // --- Seed Related Systems ---
  const relatedSystems = [
    { name: "Email", code: "EMAIL" },
    { name: "Campus Wi-Fi", code: "WIFI" },
    { name: "VPN", code: "VPN" },
    { name: "LEB2 App", code: "LEB2" },
    { name: "Grade Submission App", code: "GRADE_SUB" },
    { name: "Printer", code: "PRINTER" },
    { name: "Corporate Laptop", code: "LAPTOP" },
  ];

  for (const sys of relatedSystems) {
    await prisma.relatedSystem.upsert({
      where: { name: sys.name },
      update: { code: sys.code },
      create: { name: sys.name, code: sys.code },
    });
  }
  console.log("Seeded 7 related systems.");

  // --- Hash default passwords ---
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash("Password123!", salt);
  const initialPasswordHash = await bcrypt.hash("InitialPassword123!", salt);

  // --- Seed Users (Requesters, IT Staff, Administrator) ---
  const seedUsers = [
    // Requesters (4 active, 1 inactive)
    {
      email: "requester.jennifer@toktickit.com",
      name: "Jennifer Anderson",
      role: Role.REQUESTER,
      isActive: true,
      mustChangePassword: false,
      department: "Finance",
      passwordHash: defaultPasswordHash,
    },
    {
      email: "requester.michael@toktickit.com",
      name: "Michael Brown",
      role: Role.REQUESTER,
      isActive: true,
      mustChangePassword: false,
      department: "Marketing",
      passwordHash: defaultPasswordHash,
    },
    {
      email: "requester.sarah@toktickit.com",
      name: "Sarah Johnson",
      role: Role.REQUESTER,
      isActive: true,
      mustChangePassword: false,
      department: "Engineering",
      passwordHash: defaultPasswordHash,
    },
    {
      email: "requester.david@toktickit.com",
      name: "David Lee",
      role: Role.REQUESTER,
      isActive: true,
      mustChangePassword: true, // Needs password change on first login
      department: "HR",
      passwordHash: initialPasswordHash,
    },
    {
      email: "requester.inactive@toktickit.com",
      name: "Inactive Requester",
      role: Role.REQUESTER,
      isActive: false,
      mustChangePassword: false,
      department: "Operations",
      passwordHash: defaultPasswordHash,
    },

    // IT Staff (3 active, 1 inactive)
    {
      email: "staff.alex@toktickit.com",
      name: "Alex Thompson (IT Support)",
      role: Role.IT_STAFF,
      isActive: true,
      mustChangePassword: false,
      department: "IT Services",
      passwordHash: defaultPasswordHash,
    },
    {
      email: "staff.bob@toktickit.com",
      name: "Bob Miller (IT Support)",
      role: Role.IT_STAFF,
      isActive: true,
      mustChangePassword: false,
      department: "IT Services",
      passwordHash: defaultPasswordHash,
    },
    {
      email: "staff.clara@toktickit.com",
      name: "Clara Vance (IT Support)",
      role: Role.IT_STAFF,
      isActive: true,
      mustChangePassword: true, // Needs password change on first login
      department: "IT Services",
      passwordHash: initialPasswordHash,
    },
    {
      email: "staff.inactive@toktickit.com",
      name: "Inactive Staff",
      role: Role.IT_STAFF,
      isActive: false,
      mustChangePassword: false,
      department: "IT Services",
      passwordHash: defaultPasswordHash,
    },

    // Administrator (1 active)
    {
      email: "admin@toktickit.com",
      name: "System Administrator",
      role: Role.ADMINISTRATOR,
      isActive: true,
      mustChangePassword: false,
      department: "IT Administration",
      passwordHash: defaultPasswordHash,
    },
  ];

  for (const u of seedUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        isActive: u.isActive,
        mustChangePassword: u.mustChangePassword,
        department: u.department,
        passwordHash: u.passwordHash,
      },
      create: u,
    });
  }
  console.log(`Seeded ${seedUsers.length} users across Requester, IT Staff, and Administrator roles.`);

  // --- Seed Sample Tickets with Ownership ---
  const catHardware = await prisma.category.findUnique({ where: { code: "HARDWARE" } });
  const catNetwork = await prisma.category.findUnique({ where: { code: "NETWORK" } });
  const catSoftware = await prisma.category.findUnique({ where: { code: "SOFTWARE" } });

  const sysLaptop = await prisma.relatedSystem.findUnique({ where: { code: "LAPTOP" } });
  const sysVPN = await prisma.relatedSystem.findUnique({ where: { code: "VPN" } });
  const sysEmail = await prisma.relatedSystem.findUnique({ where: { code: "EMAIL" } });

  const reqJennifer = await prisma.user.findUnique({ where: { email: "requester.jennifer@toktickit.com" } });
  const reqMichael = await prisma.user.findUnique({ where: { email: "requester.michael@toktickit.com" } });
  const staffAlex = await prisma.user.findUnique({ where: { email: "staff.alex@toktickit.com" } });
  const staffBob = await prisma.user.findUnique({ where: { email: "staff.bob@toktickit.com" } });

  if (catHardware && catNetwork && catSoftware && sysLaptop && sysVPN && sysEmail && reqJennifer && reqMichael) {
    const sampleTickets = [
      {
        ticketNumber: "TKT-2026-000001",
        summary: "Laptop battery drains in less than 1 hour",
        description: "Dell Latitude laptop drains battery very rapidly even on idle mode.",
        requestedPriority: "MEDIUM",
        itPriority: "HIGH",
        currentStatus: "IN_PROGRESS",
        categoryId: catHardware.id,
        relatedSystemId: sysLaptop.id,
        requesterId: reqJennifer.id,
        ownerId: staffAlex?.id,
      },
      {
        ticketNumber: "TKT-2026-000002",
        summary: "Cannot connect to VPN from home network",
        description: "VPN client shows timeout error after entering 2FA code.",
        requestedPriority: "HIGH",
        itPriority: "HIGH",
        currentStatus: "OPEN",
        categoryId: catNetwork.id,
        relatedSystemId: sysVPN.id,
        requesterId: reqMichael.id,
        ownerId: staffBob?.id,
      },
      {
        ticketNumber: "TKT-2026-000003",
        summary: "Outlook email search is returning no results",
        description: "Indexing seems stuck at 0 items remaining.",
        requestedPriority: "LOW",
        itPriority: "LOW",
        currentStatus: "NEW",
        categoryId: catSoftware.id,
        relatedSystemId: sysEmail.id,
        requesterId: reqJennifer.id,
        ownerId: null, // Unassigned for testing claim workflow
      },
    ];

    for (const t of sampleTickets) {
      const existingTicket = await prisma.ticket.findUnique({ where: { ticketNumber: t.ticketNumber } });
      if (!existingTicket) {
        const createdTicket = await prisma.ticket.create({ data: t });

        // Add a sample public comment and internal note
        if (staffAlex) {
          await prisma.comment.create({
            data: {
              content: "Hello Jennifer, we have received your ticket and are looking into replacement batteries.",
              ticketId: createdTicket.id,
              authorId: staffAlex.id,
            },
          });

          await prisma.internalNote.create({
            data: {
              content: "Checked battery cycle count via Dell diagnostics: 820 cycles. Qualifies for warranty replacement.",
              ticketId: createdTicket.id,
              authorId: staffAlex.id,
            },
          });
        }
      }
    }
    console.log("Seeded sample tickets with public comments and internal notes.");
  }

  console.log("Lab 3 seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
