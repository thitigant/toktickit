import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function migrate() {
  console.log("Starting migration from RequesterUser to User...");

  const defaultPassword = "Password123!";
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  const requesters = await prisma.requesterUser.findMany({
    orderBy: { id: "asc" },
  });

  for (const r of requesters) {
    const existing = await prisma.user.findUnique({ where: { email: r.email } });
    if (!existing) {
      // Create user preserving the id
      await prisma.$executeRawUnsafe(
        `INSERT INTO "User" (id, email, name, "passwordHash", role, "isActive", "mustChangePassword", department, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5::"Role", $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        r.id,
        r.email,
        r.name,
        passwordHash,
        Role.REQUESTER,
        r.isActive,
        true,
        r.department,
        r.createdAt,
        new Date()
      );
      console.log(`Migrated RequesterUser [id=${r.id}] ${r.name} (${r.email}) to User.`);
    }
  }

  // Update Postgres ID sequence for User table so subsequent inserts get correct IDs
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"User"', 'id'), coalesce(max(id), 1)) FROM "User"`
  );

  console.log("Migration complete. All existing Requesters now exist in User table.");
}

migrate()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
