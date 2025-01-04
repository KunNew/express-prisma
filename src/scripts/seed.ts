import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  await prisma.user.deleteMany();
  await prisma.user.create({
    data: {
      username: "super",
      email: "super@email.com",
      password: `superpwd@${new Date().getFullYear()}`,
      profile: {
        avatar:
          "https://pheak.dev/_next/image?url=https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F47571500%3Fs%3D400%26u%3D7a5272427cd5185f06e20e14d28e650d43359ffe%26v%3D4&w=96&q=75",
        role: "Super",
      },
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
