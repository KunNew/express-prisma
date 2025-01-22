import { hashPassword } from "../utils/password";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultUsers = [
  {
    username: "super",
    email: "pheakcoding@gmail.com",
    password: `superpwd@${new Date().getFullYear()}`,
    profile: {
      avatar:
        "https://pheak.dev/_next/image?url=https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F47571500%3Fs%3D400%26u%3D7a5272427cd5185f06e20e14d28e650d43359ffe%26v%3D4&w=96&q=75",
      role: "Super",
    },
  },
  // You can easily add more default users here
];

async function cleanDatabase() {
  try {
    console.log("🧹 Cleaning database...");
    await prisma.user.deleteMany();
    console.log("✨ Database cleaned successfully");
  } catch (error) {
    console.error("Error cleaning database:", error);
    throw error;
  }
}

async function seedUsers() {
  try {
    console.log("🌱 Seeding users...");
    const users = await Promise.all(
      defaultUsers.map(async (user) => {
        return await prisma.user.create({
          data: {
            ...user,
            password: await hashPassword(user.password),
          },
        });
      })
    );
    console.log(`✅ Created ${users.length} users`);
    return users;
  } catch (error) {
    console.error("Error seeding users:", error);
    throw error;
  }
}

async function main() {
  try {
    await cleanDatabase();
    await seedUsers();
    console.log("🎉 Seeding completed successfully");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
