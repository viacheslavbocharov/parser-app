import type { PrismaClient } from "@prisma/client";

export async function getMe(prisma: PrismaClient, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user
    ? { id: user.id, name: user.name, email: user.email }
    : { id: null, name: null, email: null };
}
