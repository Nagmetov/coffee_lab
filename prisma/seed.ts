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
  images: string[];
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
      images: ["/products/espresso.jpg"],
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
      images: ["/products/cappuccino.jpg"],
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
      images: ["/products/latte.jpg"],
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
      images: ["/products/raf.jpg"],
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
      images: ["/products/americano.jpg"],
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
      images: ["/products/filter.jpg"],
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
      images: ["/products/ethiopia.jpg"],
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
      images: ["/products/colombia.jpg"],
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
      images: ["/products/brazil.jpg"],
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
      images: ["/products/blend.jpg"],
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
      images: ["/products/cheesecake.jpg"],
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
      images: ["/products/tiramisu.jpg"],
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
      images: ["/products/croissant.jpg"],
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
      images: ["/products/brownie.jpg"],
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
          images: product.images,
          categoryId: category.id,
        },
        create: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          tastingNotes: product.tastingNotes,
          tags: product.tags,
          basePrice: product.basePrice,
          images: product.images,
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

  await prisma.user.upsert({
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
  await prisma.user.upsert({
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
