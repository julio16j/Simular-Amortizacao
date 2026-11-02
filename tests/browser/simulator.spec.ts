import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("padrões, cálculo real, detalhes, CSV e restauração", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByLabel("Saldo devedor atual", { exact: true }),
  ).toHaveValue("261000");
  await expect(page.getByLabel("Taxa de juros", { exact: true })).toHaveValue(
    "7.9347",
  );
  await expect(
    page.getByLabel("Amortização extra mensal", { exact: true }),
  ).toHaveValue("650");
  await expect(
    page.getByLabel("Objetivo da amortização", { exact: true }),
  ).toHaveValue("term");
  await expect(
    page.getByLabel("Parcelas restantes", { exact: true }),
  ).toHaveValue("418");
  await page
    .getByText("TR, prestação e dados do contrato", { exact: true })
    .click();
  await expect(
    page.getByLabel("Prestação atual, se conhecida", { exact: true }),
  ).toHaveValue("1864.86");
  await expect(page.getByLabel("Prazo original", { exact: true })).toHaveValue(
    "420",
  );
  await expect(
    page.getByLabel("Parcelas já pagas", { exact: true }),
  ).toHaveValue("2");
  await expect(
    page.getByLabel("TR anual estimada", { exact: true }),
  ).toHaveValue("1.5");
  await expect(
    page.getByLabel("Prestação usada no cálculo", { exact: true }),
  ).toHaveValue("informed");
  await page
    .getByText("TR, prestação e dados do contrato", { exact: true })
    .click();
  await page.getByRole("button", { name: "Simular amortização" }).click();
  await expect(page.getByRole("status")).toHaveText("Simulação atualizada");
  await expect(page.getByText("Economia estimada de juros")).toBeVisible();
  await expect(page.locator(".saving-hero > div > strong").first()).toHaveText(
    /\d+ anos?( e \d+ m[eê]s(es)?)?/,
  );
  await expect(page.locator(".saving-hero .payoff-date")).toContainText(
    "Quitação estimada em",
  );
  await expect(page.locator(".metric-grid")).toContainText(
    "Economia estimada de juros",
  );
  await expect(page.locator(".saving-hero")).not.toContainText("R$");
  await expect(
    page.getByRole("region", { name: "Resumo anual", exact: true }),
  ).toBeVisible();
  await expect(page.locator("#monthly-evolution")).toBeHidden();
  await page
    .getByRole("button", { name: "Ver mês a mês", exact: true })
    .click();
  await expect(page.locator("#monthly-evolution")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Recolher mês a mês", exact: true }),
  ).toHaveAttribute("aria-expanded", "true");
  await page.locator(".row-expand").first().click();
  await expect(
    page.getByText("Amortização ordinária", { exact: true }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Baixar CSV" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("simula-amortizacao.csv");
  await page
    .getByRole("button", { name: "Recolher mês a mês", exact: true })
    .click();
  await expect(page.locator("#monthly-evolution")).toBeHidden();
  await page.getByLabel("Amortização extra mensal", { exact: true }).fill("0");
  await page.getByText("Incluir FGTS na estratégia", { exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Simulação atualizada");
  await expect(page.locator(".saving-time strong")).toHaveText("0 meses");
  await page.getByRole("button", { name: "Restaurar formulário" }).click();
  await expect(
    page.getByLabel("Amortização extra mensal", { exact: true }),
  ).toHaveValue("650");
  await expect(
    page.getByText("Pronto para simular", { exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("exemplo, elegibilidade FGTS e recálculo", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Carregar exemplo", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Simulação atualizada");
  await expect(
    page.getByText("Uso direto do FGTS desativado no cálculo:", {
      exact: false,
    }),
  ).toBeVisible();
  await page.getByText("Configurar FGTS e saques", { exact: true }).click();
  await page
    .getByText("Assumir elegibilidade para simular o uso direto", {
      exact: true,
    })
    .click();
  await expect(page.getByRole("status")).toHaveText("Simulação atualizada");
  await expect(
    page.getByText("Uso direto do FGTS desativado no cálculo:", {
      exact: false,
    }),
  ).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Sistema", exact: true })
    .selectOption("SAC");
  await expect(page.getByRole("status")).toHaveText("Simulação atualizada");
  await expect(page.getByText("Economia estimada de juros")).toBeVisible();
});
for (const width of [320, 375, 768, 1024, 1440]) {
  test(`layout de ${width}px preserva ferramenta, resultados e rolagem`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.getByRole("button", { name: "Simular amortização" }).click();
    await expect(page.getByRole("status")).toHaveText("Simulação atualizada");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBe(true);
    await expect(
      page.getByRole("heading", { name: "Sua previsão" }),
    ).toBeVisible();
    const positions = await page.evaluate(() => ({
      calculator: document.getElementById("simulador")!.offsetTop,
      content: document.getElementById("como-funciona")!.offsetTop,
    }));
    expect(positions.content).toBeGreaterThan(positions.calculator);
    await expect(
      page.getByRole("img", { name: "Comparação do saldo devedor" }),
    ).toBeVisible();
    if (width === 1440 || width === 375)
      await page.screenshot({
        path: `test-results/simulador-${width}.png`,
        fullPage: true,
      });
  });
}
test("conteúdo indexável, páginas internas e privacidade de rede", async ({
  page,
  request,
}) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain("Como simular uma amortização");
  expect(html).toContain('name="description"');
  for (const path of [
    "/metodologia/",
    "/sobre/",
    "/privacidade/",
    "/termos/",
    "/guias/price-ou-sac/",
    "/guias/reduzir-prazo-ou-prestacao/",
    "/guias/amortizar-com-fgts/",
    "/robots.txt",
    "/sitemap.xml",
  ])
    expect((await request.get(path)).status()).toBe(200);
  const external: string[] = [];
  page.on("request", (r) => {
    if (
      r.url().startsWith("http") &&
      !r.url().startsWith("http://localhost:3001")
    )
      external.push(r.url());
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Simular amortização" }).click();
  await expect(page.getByRole("status")).toHaveText("Simulação atualizada");
  expect(external).toEqual([]);
});
test("teclado e layout equivalente a zoom de 200%", async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 450 });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByText("Ir para o conteúdo", { exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Simular amortização" }).click();
  await expect(page.getByRole("status")).toHaveText("Simulação atualizada");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
});
test("acessibilidade automatizada do formulário e dos resultados", async ({
  page,
}) => {
  await page.goto("/");
  let audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(
    audit.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
  await page.getByRole("button", { name: "Simular amortização" }).click();
  await expect(page.getByRole("status")).toHaveText("Simulação atualizada");
  await expect(
    page.getByRole("img", { name: "Comparação do saldo devedor" }),
  ).toBeVisible();
  audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(
    audit.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
});
test("acessibilidade das opções avançadas e do FGTS", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Carregar exemplo", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Simulação atualizada");
  await page.locator(".form-panel details").evaluateAll((nodes) =>
    nodes.forEach((node) => {
      (node as HTMLDetailsElement).open = true;
    }),
  );
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(
    audit.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
});
