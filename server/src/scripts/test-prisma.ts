import { prisma } from "../config/prisma";

async function main() {
  const users = await prisma.user.findMany();

  console.log("Prisma connected successfully.");
  console.log(`Users found: ${users.length}`);
}

main()
  .catch((error) => {
    console.error("Prisma test failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });