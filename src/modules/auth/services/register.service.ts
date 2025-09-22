import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { HttpError } from "./errors";

type RegisterInput = { name: string; email: string; password: string };

export async function registerUser(prisma: PrismaClient, input: RegisterInput) {
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) throw new HttpError(409, "CONFLICT", "Email already registered");

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash },
  });

  return { id: user.id, name: user.name, email: user.email };
}
