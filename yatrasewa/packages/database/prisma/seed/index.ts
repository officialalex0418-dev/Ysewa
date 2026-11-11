import { PrismaClient } from "@prisma/client";
import { seedCitiesAndCorridors } from "./nepal-cities.js";
import { seedOperatorsFleetAndUsers } from "./operators.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 YatraSewa seed starting...");
  await prisma.$transaction(async (tx) => {
    await seedCitiesAndCorridors(tx);
    await seedOperatorsFleetAndUsers(tx);
  });
  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
