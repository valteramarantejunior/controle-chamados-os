import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "admin@empresa.com";
  const senha = "admin123";

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    console.log(`Usuário admin já existe: ${email}`);
    return;
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  await prisma.user.create({
    data: {
      nome: "Administrador",
      email,
      senhaHash,
      papel: "ADMIN",
    },
  });

  console.log(`Usuário admin criado:`);
  console.log(`  email: ${email}`);
  console.log(`  senha: ${senha}`);
  console.log(`Troque a senha após o primeiro login.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
