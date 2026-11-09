
import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const destinationCount = await prisma.destination.count();
  const packageCount = await prisma.tourPackage.count();

  console.log("PostgreSQL connection successful!");
  console.log("Destinations currently in database:", destinationCount);
  console.log("Tour packages currently in database:", packageCount);
}

main()
  .catch((error) => {
    console.error("Database connection test failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
