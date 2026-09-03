import { getPrisma } from "../src/prisma.js";

async function main() {
  const prisma = getPrisma();

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

  // --- Seed Requester Users ---
  const requesters = [
    { name: "Jennifer Anderson", email: "jennifer.anderson@example.com", department: "IT Support", isActive: true },
    { name: "Michael Brown", email: "michael.brown@example.com", department: "Finance", isActive: true },
    { name: "Sarah Johnson", email: "sarah.johnson@example.com", department: "Marketing", isActive: true },
    { name: "David Lee", email: "david.lee@example.com", department: "Engineering", isActive: true },
    { name: "Inactive Test User", email: "inactive.user@example.com", department: "HR", isActive: false },
  ];

  for (const user of requesters) {
    await prisma.requesterUser.upsert({
      where: { email: user.email },
      update: { name: user.name, department: user.department, isActive: user.isActive },
      create: user,
    });
  }
  console.log("Seeded 5 requester users (4 active, 1 inactive).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
