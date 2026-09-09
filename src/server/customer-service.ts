import { prisma } from "@/lib/prisma";

export async function listCustomers(search?: string) {
  return prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
    take: 100,
  });
}

export async function getCustomerDetail(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId, role: "CUSTOMER" },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 20, include: { items: true } },
      addresses: true,
    },
  });
}
