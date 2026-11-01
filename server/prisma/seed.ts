import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting Lab 4 idempotent seed...");

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
  console.log("Seeded categories.");

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
  console.log("Seeded related systems.");

  // --- Hash default passwords ---
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash("Password123!", salt);
  const initialPasswordHash = await bcrypt.hash("InitialPassword123!", salt);

  // --- Seed Users (Requesters, IT Staff, Administrator) ---
  const seedUsers = [
    // Requesters
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
      mustChangePassword: true,
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

    // IT Staff
    {
      email: "staff.alex@toktickit.com",
      name: "Alex Thompson",
      role: Role.IT_STAFF,
      isActive: true,
      mustChangePassword: false,
      department: "IT Infrastructure",
      passwordHash: defaultPasswordHash,
    },
    {
      email: "staff.bob@toktickit.com",
      name: "Bob Martinez",
      role: Role.IT_STAFF,
      isActive: true,
      mustChangePassword: false,
      department: "IT Helpdesk",
      passwordHash: defaultPasswordHash,
    },
    {
      email: "staff.clara@toktickit.com",
      name: "Clara Oswald",
      role: Role.IT_STAFF,
      isActive: true,
      mustChangePassword: false,
      department: "IT Networks",
      passwordHash: defaultPasswordHash,
    },
    {
      email: "staff.inactive@toktickit.com",
      name: "Inactive Staff",
      role: Role.IT_STAFF,
      isActive: false,
      mustChangePassword: false,
      department: "IT Helpdesk",
      passwordHash: defaultPasswordHash,
    },

    // Administrator
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
      },
      create: u,
    });
  }
  console.log("Seeded 10 users.");

  // Retrieve references for tickets
  const catHardware = await prisma.category.findUnique({ where: { name: "Hardware" } });
  const catNetwork = await prisma.category.findUnique({ where: { name: "Network" } });
  const catSoftware = await prisma.category.findUnique({ where: { name: "Software" } });
  const catAccess = await prisma.category.findUnique({ where: { name: "Account and Access" } });

  const sysLaptop = await prisma.relatedSystem.findUnique({ where: { name: "Corporate Laptop" } });
  const sysVPN = await prisma.relatedSystem.findUnique({ where: { name: "VPN" } });
  const sysEmail = await prisma.relatedSystem.findUnique({ where: { name: "Email" } });
  const sysPrinter = await prisma.relatedSystem.findUnique({ where: { name: "Printer" } });

  const reqJennifer = await prisma.user.findUnique({ where: { email: "requester.jennifer@toktickit.com" } });
  const reqMichael = await prisma.user.findUnique({ where: { email: "requester.michael@toktickit.com" } });
  const reqSarah = await prisma.user.findUnique({ where: { email: "requester.sarah@toktickit.com" } });

  const staffAlex = await prisma.user.findUnique({ where: { email: "staff.alex@toktickit.com" } });
  const staffBob = await prisma.user.findUnique({ where: { email: "staff.bob@toktickit.com" } });
  const staffClara = await prisma.user.findUnique({ where: { email: "staff.clara@toktickit.com" } });

  if (
    catHardware &&
    catNetwork &&
    catSoftware &&
    catAccess &&
    sysLaptop &&
    sysVPN &&
    sysEmail &&
    sysPrinter &&
    reqJennifer &&
    reqMichael &&
    reqSarah &&
    staffAlex &&
    staffBob &&
    staffClara
  ) {
    // Tickets covering multiple statuses and ownership (Assigned vs Unassigned)
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
        ownerId: staffAlex.id,
      },
      {
        ticketNumber: "TKT-2026-000002",
        summary: "Cannot connect to VPN from home network",
        description: "VPN client shows timeout error after entering 2FA code.",
        requestedPriority: "HIGH",
        itPriority: "HIGH",
        currentStatus: "WAITING_FOR_REQUESTER",
        categoryId: catNetwork.id,
        relatedSystemId: sysVPN.id,
        requesterId: reqMichael.id,
        ownerId: staffBob.id,
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
        ownerId: null, // Unassigned
      },
      {
        ticketNumber: "TKT-2026-000004",
        summary: "Floor 3 Network Printer offline",
        description: "Cannot send print jobs to HP LaserJet on 3rd floor west wing.",
        requestedPriority: "MEDIUM",
        itPriority: "MEDIUM",
        currentStatus: "OPEN",
        categoryId: catHardware.id,
        relatedSystemId: sysPrinter.id,
        requesterId: reqSarah.id,
        ownerId: staffAlex.id,
      },
      {
        ticketNumber: "TKT-2026-000005",
        summary: "VPN access expired after password change",
        description: "Certificate needs renewal for remote work.",
        requestedPriority: "HIGH",
        itPriority: "MEDIUM",
        currentStatus: "RESOLVED",
        categoryId: catNetwork.id,
        relatedSystemId: sysVPN.id,
        requesterId: reqJennifer.id,
        ownerId: staffBob.id,
      },
    ];

    for (const t of sampleTickets) {
      let ticket = await prisma.ticket.findUnique({ where: { ticketNumber: t.ticketNumber } });
      if (!ticket) {
        ticket = await prisma.ticket.create({ data: t });
      } else {
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            currentStatus: t.currentStatus,
            itPriority: t.itPriority,
            ownerId: t.ownerId,
          },
        });
      }

      // Add Sample Actions Taken
      // Ticket 1: 2 Actions Taken (demonstrates multi-action & different staff coordinator vs performer)
      if (t.ticketNumber === "TKT-2026-000001") {
        const actionCount = await prisma.actionTaken.count({ where: { ticketId: ticket.id } });
        if (actionCount === 0) {
          await prisma.actionTaken.create({
            data: {
              ticketId: ticket.id,
              actionDateTime: new Date("2026-10-28T10:30:00Z"),
              actionDescription: "Ran Dell hardware battery diagnostic and verified charge degradation.",
              result: "Battery health reported at 42% capacity with 820 discharge cycles.",
              status: "COMPLETED",
              performedById: staffAlex.id, // Primary owner performed
              followUpRequired: true,
              followUpNote: "Order OEM replacement battery kit from certified vendor.",
              attachmentNotes: "dell_battery_diagnostic.pdf",
            },
          });

          await prisma.actionTaken.create({
            data: {
              ticketId: ticket.id,
              actionDateTime: new Date("2026-10-29T14:15:00Z"),
              actionDescription: "Received battery and installed into laptop.",
              result: "Battery calibrated to 100% capacity. Machine passed full diagnostic run.",
              status: "COMPLETED",
              performedById: staffClara.id, // Different IT staff member (satisfies BR-02!)
              followUpRequired: false,
              followUpNote: null,
              attachmentNotes: "post_install_burnin.txt",
            },
          });
        }
      }

      // Ticket 2: 1 Action Taken with follow up required
      if (t.ticketNumber === "TKT-2026-000002") {
        const actionCount = await prisma.actionTaken.count({ where: { ticketId: ticket.id } });
        if (actionCount === 0) {
          await prisma.actionTaken.create({
            data: {
              ticketId: ticket.id,
              actionDateTime: new Date("2026-10-29T11:00:00Z"),
              actionDescription: "Reset Cisco AnyConnect gateway profile and flushed DNS.",
              result: "Authentication successful from lab test runner.",
              status: "COMPLETED",
              performedById: staffBob.id,
              followUpRequired: true,
              followUpNote: "Awaiting user verification from residential ISP.",
              attachmentNotes: "vpn_gateway_logs.log",
            },
          });
        }
      }

      // Ticket 3: 0 Actions Taken (demonstrates zero-actions card/empty state!)
      // Ticket 4: 0 Actions Taken
      // Ticket 5: 1 Action Taken (completed resolution)
      if (t.ticketNumber === "TKT-2026-000005") {
        const actionCount = await prisma.actionTaken.count({ where: { ticketId: ticket.id } });
        if (actionCount === 0) {
          await prisma.actionTaken.create({
            data: {
              ticketId: ticket.id,
              actionDateTime: new Date("2026-10-27T16:00:00Z"),
              actionDescription: "Re-issued client SSL certificate and pushed via MDM profile.",
              result: "Client certificate verified active. User confirmed successful logon.",
              status: "COMPLETED",
              performedById: staffBob.id,
              followUpRequired: false,
              followUpNote: null,
              attachmentNotes: null,
            },
          });
        }
      }
    }
    console.log("Seeded realistic tickets with zero, one, and multiple Actions Taken.");
  }

  console.log("Lab 4 idempotent seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
