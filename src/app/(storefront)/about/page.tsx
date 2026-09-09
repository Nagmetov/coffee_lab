export const metadata = { title: "О нас" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-heading mb-6 text-4xl font-semibold">О CoffeeLab</h1>
      <div className="text-muted-foreground space-y-4 text-lg">
        <p>
          CoffeeLab — небольшая обжарочная студия и кофейня. Мы закупаем зелёное зерно
          напрямую у фермерских кооперативов, обжариваем его сами небольшими партиями и в
          тот же день подаём в кофейне или отправляем клиентам.
        </p>
        <p>
          Меню строится вокруг сезонных партий: моносорта меняются по мере обжарки, а
          купажи остаются стабильными для тех, кто предпочитает знакомый вкус каждый день.
        </p>
        <p>
          Десерты и выпечка готовятся на месте нашей командой кондитеров — без
          полуфабрикатов.
        </p>
      </div>
    </div>
  );
}
