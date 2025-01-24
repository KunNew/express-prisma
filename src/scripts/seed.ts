import { startOfYear } from "date-fns";
import { permissionData } from "../data/role-permission";
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
    // Delete in correct order - delete dependent records first
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.counter.deleteMany();
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
            profile: {
              create: {
                roleGroup: ["super"],
                permissions: [],
              },
            },
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
    // First seed users
    const users = await seedUsers();

    // Then seed permissions
    console.log("🌱 Seeding permissions...");
    await prisma.permission.createMany({
      data: permissionData,
    });
    console.log("🌱 Seeding company...");

  await prisma.counter.create({
      data: {
        id: `app_companiesCode`,
        seqVal: "001",
      },
    });

    await prisma.company.create({
      data: {
        code: "001",
        name: "Pheak Coding",
        telephone: "096 56 56 740",
        email: "pheakcoding@gmail.com",
        address: "Phnom Penh, Cambodia",
        website: "https://pheak.dev",
        industry: "Software Development",
        setting: {
          fiscalDate: startOfYear(new Date()),
          baseCurrency: "USD",
          decimalNumber: 2,
          accountingIntegration: true,
          dateFormat: "DD/MM/YYYY H:mm:ss",
          lang: "en",
        },
      },
    });
    console.log("✅ Created company");

    console.log("✅ Created permissions");

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
