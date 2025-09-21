// import type { PrismaClient } from "@prisma/client";
// import bcrypt from "bcrypt";
// import { HttpError } from "./errors";

// type LoginInput = { email: string; password: string };

// export async function verifyCredentials(prisma: PrismaClient, input: LoginInput) {
//   const user = await prisma.user.findUnique({ where: { email: input.email } });
//   if (!user) throw new HttpError(401, "UNAUTHORIZED", "Invalid credentials");

//   const ok = await bcrypt.compare(input.password, user.passwordHash);
//   if (!ok) throw new HttpError(401, "UNAUTHORIZED", "Invalid credentials");

//   return { sub: user.id, email: user.email };
// }
import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { HttpError } from "./errors";

type LoginInput = { email: string; password: string };

export async function verifyCredentials(prisma: PrismaClient, input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new HttpError(401, "UNAUTHORIZED", "Invalid credentials");
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new HttpError(401, "UNAUTHORIZED", "Invalid credentials");
  }

  return { sub: user.id, email: user.email };
}
