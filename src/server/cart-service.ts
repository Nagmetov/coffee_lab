import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

const GUEST_CART_TTL_SECONDS = 30 * 24 * 60 * 60;

type GuestCartItems = Record<string, number>; // productVariantId -> quantity

function guestCartKey(guestToken: string) {
  return `cart:guest:${guestToken}`;
}

async function readGuestCart(guestToken: string): Promise<GuestCartItems> {
  const raw = await redis.get(guestCartKey(guestToken));
  return raw ? JSON.parse(raw) : {};
}

async function writeGuestCart(guestToken: string, items: GuestCartItems) {
  const key = guestCartKey(guestToken);
  if (Object.keys(items).length === 0) {
    await redis.del(key);
    return;
  }
  await redis.set(key, JSON.stringify(items), "EX", GUEST_CART_TTL_SECONDS);
}

export type CartView = {
  items: {
    variantId: string;
    productSlug: string;
    productName: string;
    categorySlug: string;
    variantName: string;
    unitPrice: number;
    quantity: number;
    stock: number;
    lineTotal: number;
  }[];
  subtotal: number;
  itemCount: number;
};

async function buildCartView(items: GuestCartItems): Promise<CartView> {
  const variantIds = Object.keys(items).filter((id) => items[id] > 0);
  if (variantIds.length === 0) {
    return { items: [], subtotal: 0, itemCount: 0 };
  }

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: { include: { category: true } } },
  });

  const view: CartView = { items: [], subtotal: 0, itemCount: 0 };
  for (const variant of variants) {
    const quantity = items[variant.id];
    const unitPrice = Number(variant.product.basePrice) + Number(variant.priceModifier);
    const lineTotal = round2(unitPrice * quantity);
    view.items.push({
      variantId: variant.id,
      productSlug: variant.product.slug,
      productName: variant.product.name,
      categorySlug: variant.product.category.slug,
      variantName: variant.name,
      unitPrice,
      quantity,
      stock: variant.stock,
      lineTotal,
    });
    view.subtotal = round2(view.subtotal + lineTotal);
    view.itemCount += quantity;
  }
  return view;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// ---------- Guest cart (Redis) ----------

export async function getGuestCartView(guestToken: string): Promise<CartView> {
  return buildCartView(await readGuestCart(guestToken));
}

export async function setGuestCartItem(
  guestToken: string,
  variantId: string,
  quantity: number,
) {
  const items = await readGuestCart(guestToken);
  if (quantity <= 0) {
    delete items[variantId];
  } else {
    items[variantId] = quantity;
  }
  await writeGuestCart(guestToken, items);
  return buildCartView(items);
}

// ---------- User cart (Postgres) ----------

async function getOrCreateUserCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function getUserCartView(userId: string): Promise<CartView> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });
  if (!cart) return { items: [], subtotal: 0, itemCount: 0 };
  const items = Object.fromEntries(
    cart.items.map((i) => [i.productVariantId, i.quantity]),
  );
  return buildCartView(items);
}

export async function setUserCartItem(
  userId: string,
  variantId: string,
  quantity: number,
) {
  const cart = await getOrCreateUserCart(userId);
  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productVariantId: variantId },
    });
  } else {
    await prisma.cartItem.upsert({
      where: {
        cartId_productVariantId: { cartId: cart.id, productVariantId: variantId },
      },
      update: { quantity },
      create: { cartId: cart.id, productVariantId: variantId, quantity },
    });
  }
  return getUserCartView(userId);
}

export async function clearUserCart(userId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
}

/**
 * Called right after login/register: folds the anonymous Redis-backed cart
 * into the user's persisted cart (quantities added together), then clears
 * the guest cart so it isn't double-counted on a future visit.
 */
export async function mergeGuestCartIntoUser(userId: string, guestToken: string) {
  const guestItems = await readGuestCart(guestToken);
  if (Object.keys(guestItems).length === 0) return;

  const cart = await getOrCreateUserCart(userId);
  for (const [variantId, quantity] of Object.entries(guestItems)) {
    await prisma.cartItem.upsert({
      where: {
        cartId_productVariantId: { cartId: cart.id, productVariantId: variantId },
      },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, productVariantId: variantId, quantity },
    });
  }
  await redis.del(guestCartKey(guestToken));
}
