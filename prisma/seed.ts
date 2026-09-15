import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type VariantSeed = {
  name: string;
  priceModifier: number;
  stock: number;
  sku: string;
  isDefault?: boolean;
};

type ProductSeed = {
  name: string;
  slug: string;
  description: string;
  tastingNotes: string[];
  tags: string[];
  basePrice: number;
  variants: VariantSeed[];
};

const drinkVariants = (sku: string): VariantSeed[] => [
  { name: "S · 250 мл", priceModifier: 0, stock: 999, sku: `${sku}-S`, isDefault: true },
  { name: "M · 350 мл", priceModifier: 60, stock: 999, sku: `${sku}-M` },
  { name: "L · 450 мл", priceModifier: 110, stock: 999, sku: `${sku}-L` },
];

const beanVariants = (sku: string): VariantSeed[] => [
  { name: "250 г", priceModifier: 0, stock: 120, sku: `${sku}-250`, isDefault: true },
  { name: "500 г", priceModifier: 420, stock: 80, sku: `${sku}-500` },
  { name: "1 кг", priceModifier: 780, stock: 40, sku: `${sku}-1000` },
];

const catalog: Record<string, ProductSeed[]> = {
  napitki: [
    {
      name: "Эспрессо",
      slug: "espresso",
      description:
        "Классический двойной эспрессо из смеси собственной обжарки — плотное тело, карамельная сладость, лёгкая кислинка.",
      tastingNotes: ["карамель", "фундук", "тёмный шоколад"],
      tags: ["классика", "крепкий"],
      basePrice: 190,
      variants: drinkVariants("ESP"),
    },
    {
      name: "Капучино",
      slug: "cappuccino",
      description:
        "Эспрессо с бархатистой молочной пеной в классической пропорции — мягкий и сбалансированный вкус.",
      tastingNotes: ["молочный шоколад", "ваниль"],
      tags: ["молочный", "бестселлер"],
      basePrice: 250,
      variants: drinkVariants("CAP"),
    },
    {
      name: "Латте",
      slug: "latte",
      description:
        "Нежный баланс эспрессо и молока с тонким слоем пены. Можно с сиропом на выбор.",
      tastingNotes: ["сливки", "карамель"],
      tags: ["молочный"],
      basePrice: 260,
      variants: drinkVariants("LAT"),
    },
    {
      name: "Раф",
      slug: "raf",
      description:
        "Фирменный раф на сливках и ванильном сахаре — густой, сладкий, воздушный.",
      tastingNotes: ["ваниль", "сливки"],
      tags: ["сезонный", "сладкий"],
      basePrice: 290,
      variants: drinkVariants("RAF"),
    },
    {
      name: "Американо",
      slug: "americano",
      description:
        "Эспрессо, разбавленный горячей водой — чистый кофейный вкус без молока.",
      tastingNotes: ["цитрус", "тёмный шоколад"],
      tags: ["классика", "без молока"],
      basePrice: 200,
      variants: drinkVariants("AME"),
    },
    {
      name: "Фильтр-кофе",
      slug: "filter-coffee",
      description:
        "Кофе, заваренный через пуровер на смене зерна недели — раскрывает мягкую кислотность и аромат.",
      tastingNotes: ["ягоды", "цветочные ноты"],
      tags: ["альтернатива", "лёгкий"],
      basePrice: 230,
      variants: drinkVariants("FIL"),
    },
  ],
  zerno: [
    {
      name: "Эфиопия Иргачеффе",
      slug: "ethiopia-yirgacheffe",
      description:
        "Мытая обработка, лёгкая обжарка. Яркая цветочная чашка с нотами бергамота и жасмина — фаворит для альтернативы.",
      tastingNotes: ["жасмин", "бергамот", "лимон"],
      tags: ["моносорт", "лёгкая обжарка"],
      basePrice: 890,
      variants: beanVariants("ETH"),
    },
    {
      name: "Колумбия Супремо",
      slug: "colombia-supremo",
      description:
        "Сбалансированный моносорт средней обжарки с карамельной сладостью и ореховым послевкусием.",
      tastingNotes: ["карамель", "орех", "яблоко"],
      tags: ["моносорт", "средняя обжарка"],
      basePrice: 760,
      variants: beanVariants("COL"),
    },
    {
      name: "Бразилия Сантос",
      slug: "brazil-santos",
      description:
        "Плотное тело, низкая кислотность, шоколадные тона — отличная база для эспрессо-купажей.",
      tastingNotes: ["тёмный шоколад", "миндаль"],
      tags: ["моносорт", "для эспрессо"],
      basePrice: 690,
      variants: beanVariants("BRZ"),
    },
    {
      name: "Купаж CoffeeLab #1",
      slug: "coffeelab-blend-1",
      description:
        "Фирменный купаж для эспрессо: Бразилия и Колумбия в пропорции для плотного крема и сладкого послевкусия.",
      tastingNotes: ["карамель", "тёмный шоколад", "инжир"],
      tags: ["купаж", "фирменный"],
      basePrice: 720,
      variants: beanVariants("BLN"),
    },
  ],
  deserty: [
    {
      name: "Чизкейк Нью-Йорк",
      slug: "cheesecake-newyork",
      description:
        "Классический запечённый чизкейк на песочной основе — плотный, сливочный, с лёгкой кислинкой.",
      tastingNotes: ["сливочный сыр", "ваниль"],
      tags: ["бестселлер"],
      basePrice: 320,
      variants: [
        { name: "Порция", priceModifier: 0, stock: 25, sku: "CHK-1", isDefault: true },
      ],
    },
    {
      name: "Тирамису",
      slug: "tiramisu",
      description:
        "Слои маскарпоне и савоярди, пропитанные эспрессо — классика итальянского десертного стола.",
      tastingNotes: ["маскарпоне", "какао", "эспрессо"],
      tags: ["итальянский"],
      basePrice: 310,
      variants: [
        { name: "Порция", priceModifier: 0, stock: 20, sku: "TIR-1", isDefault: true },
      ],
    },
    {
      name: "Круассан миндальный",
      slug: "croissant-almond",
      description:
        "Слоёный круассан с миндальным кремом и хлопьями миндаля, выпекается ежедневно.",
      tastingNotes: ["миндаль", "сливочное масло"],
      tags: ["выпечка", "к завтраку"],
      basePrice: 240,
      variants: [
        { name: "Штука", priceModifier: 0, stock: 30, sku: "CRO-1", isDefault: true },
      ],
    },
    {
      name: "Брауни с орехом пекан",
      slug: "brownie-pecan",
      description: "Плотный шоколадный брауни с карамелизированным пеканом.",
      tastingNotes: ["тёмный шоколад", "пекан", "карамель"],
      tags: ["без глютена"],
      basePrice: 260,
      variants: [
        { name: "Порция", priceModifier: 0, stock: 22, sku: "BRW-1", isDefault: true },
      ],
    },
  ],
};

const categoryMeta = [
  {
    key: "napitki",
    name: "Напитки",
    slug: "napitki",
    description: "Кофе на основе эспрессо и альтернативные методы заваривания",
    sortOrder: 1,
  },
  {
    key: "zerno",
    name: "Зерновой кофе",
    slug: "zerno",
    description: "Моносорта и купажи собственной обжарки на вынос и домой",
    sortOrder: 2,
  },
  {
    key: "deserty",
    name: "Десерты",
    slug: "deserty",
    description: "Выпечка и десерты собственного производства",
    sortOrder: 3,
  },
];

async function main() {
  console.log("Seeding database…");

  for (const cat of categoryMeta) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, sortOrder: cat.sortOrder },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sortOrder: cat.sortOrder,
      },
    });

    for (const product of catalog[cat.key]) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {
          name: product.name,
          description: product.description,
          tastingNotes: product.tastingNotes,
          tags: product.tags,
          basePrice: product.basePrice,
          categoryId: category.id,
        },
        create: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          tastingNotes: product.tastingNotes,
          tags: product.tags,
          basePrice: product.basePrice,
          categoryId: category.id,
          variants: {
            create: product.variants,
          },
        },
      });
    }
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@coffeelab.dev";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: "Администратор CoffeeLab",
      role: "ADMIN",
      emailVerified: true,
    },
  });

  const demoCustomerEmail = "customer@coffeelab.dev";
  const demoCustomer = await prisma.user.upsert({
    where: { email: demoCustomerEmail },
    update: {},
    create: {
      email: demoCustomerEmail,
      passwordHash: await bcrypt.hash("CustomerDemo123!", 12),
      name: "Демо-клиент",
      role: "CUSTOMER",
      emailVerified: true,
      loyaltyPoints: 340,
      loyaltyTier: "SILVER",
    },
  });

  await prisma.promotion.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      description: "Скидка 10% на первый заказ",
      type: "PERCENT",
      value: 10,
      minOrderAmount: 300,
      usageLimit: 1000,
      validFrom: new Date("2024-01-01"),
      validTo: new Date("2030-01-01"),
    },
  });

  // A handful of demo orders across different statuses so a fresh seed
  // isn't a completely empty admin panel — the dashboard/analytics charts
  // have something to show, and there's always at least one order still
  // in a non-terminal status for the admin order-list status dropdown.
  const skus = ["ESP-S", "CAP-M", "LAT-S", "CHK-1", "TIR-1", "CRO-1", "BRW-1"];
  const variants = await prisma.productVariant.findMany({
    where: { sku: { in: skus } },
    include: { product: true },
  });
  const variantBySku = new Map(variants.map((v) => [v.sku, v]));
  const priceOf = (sku: string) => {
    const v = variantBySku.get(sku)!;
    return Number(v.product.basePrice) + Number(v.priceModifier);
  };
  const now = Date.now();
  const daysAgo = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000);

  type DemoOrderItem = { sku: string; quantity: number };
  const demoOrders: {
    orderNumber: string;
    status: "PENDING" | "PAID" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
    createdAt: Date;
    items: DemoOrderItem[];
    note?: string;
  }[] = [
    {
      orderNumber: "CL-DEMO0001",
      status: "PENDING",
      createdAt: daysAgo(0),
      items: [{ sku: "CAP-M", quantity: 1 }],
    },
    {
      orderNumber: "CL-DEMO0002",
      status: "PAID",
      createdAt: daysAgo(1),
      items: [
        { sku: "LAT-S", quantity: 1 },
        { sku: "CRO-1", quantity: 1 },
      ],
    },
    {
      orderNumber: "CL-DEMO0003",
      status: "PREPARING",
      createdAt: daysAgo(2),
      items: [
        { sku: "ESP-S", quantity: 1 },
        { sku: "CHK-1", quantity: 1 },
      ],
    },
    {
      orderNumber: "CL-DEMO0004",
      status: "COMPLETED",
      createdAt: daysAgo(4),
      items: [
        { sku: "ESP-S", quantity: 2 },
        { sku: "BRW-1", quantity: 1 },
      ],
    },
    {
      orderNumber: "CL-DEMO0005",
      status: "CANCELLED",
      createdAt: daysAgo(6),
      items: [{ sku: "TIR-1", quantity: 1 }],
      note: "Клиент передумал",
    },
  ];

  for (const demo of demoOrders) {
    const subtotal = demo.items.reduce(
      (sum, item) => sum + priceOf(item.sku) * item.quantity,
      0,
    );
    const loyaltyPointsEarned =
      demo.status === "CANCELLED" ? 0 : Math.floor(subtotal / 10);

    const order = await prisma.order.upsert({
      where: { orderNumber: demo.orderNumber },
      update: {},
      create: {
        orderNumber: demo.orderNumber,
        userId: demoCustomer.id,
        status: demo.status,
        fulfillmentType: "PICKUP",
        subtotal,
        totalAmount: subtotal,
        loyaltyPointsEarned,
        note: demo.note,
        createdAt: demo.createdAt,
        items: {
          create: demo.items.map((item) => {
            const variant = variantBySku.get(item.sku)!;
            return {
              productVariantId: variant.id,
              productName: variant.product.name,
              variantName: variant.name,
              quantity: item.quantity,
              unitPrice: priceOf(item.sku),
            };
          }),
        },
      },
    });

    const alreadyHasHistory = await prisma.orderStatusHistory.findFirst({
      where: { orderId: order.id },
    });
    if (!alreadyHasHistory) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: null,
          toStatus: "PENDING",
          createdAt: demo.createdAt,
        },
      });
      if (demo.status !== "PENDING") {
        await prisma.orderStatusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: "PENDING",
            toStatus: demo.status,
            changedById: adminUser.id,
            createdAt: demo.createdAt,
          },
        });
      }
    }
  }

  console.log("Seeding complete.");
  console.log(`  Admin login:    ${adminEmail} / ${adminPassword}`);
  console.log(`  Customer login: ${demoCustomerEmail} / CustomerDemo123!`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
