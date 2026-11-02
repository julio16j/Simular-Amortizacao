# Simula Amortização

Site de simulação imobiliária 100% frontend. Next.js App Router com exportação estática, TypeScript strict, motor financeiro em Decimal.js, testes Vitest, estilos próprios e gráfico SVG. Os cálculos usam um Web Worker para manter o formulário responsivo.

## Executar

Pré-requisito: Node.js compatível com a versão do Next no lockfile (testado com Node 26.4.0) e npm.

```powershell
npm.cmd ci
npm.cmd run dev
```

Abra **http://localhost:3000**. Em outros sistemas, use `npm` no lugar de `npm.cmd`. O sufixo `.cmd` evita depender da política de execução de scripts PowerShell. A cache npm é local ao projeto.

Os padrões de teste são **R$ 261.000 de saldo**, **7,9347% a.a. efetivos**, **prestação informada de R$ 1.864,86**, **TR de 1,5% a.a.**, **420 meses originais**, **2 pagos / 418 restantes** e **R$ 650 mensais para reduzir prazo**. FGTS com saque-aniversário destinado à amortização vem habilitado. As hipóteses complementares do fundo usam o exemplo: R$ 3.000 de saldo, R$ 720/mês de depósitos, 6,5% a.a. estimados e aniversário em setembro. Uso direto periódico fica desligado; seguro e tarifa ficam em zero até serem preenchidos. Todos os campos são editáveis. O exemplo Caixa preserva seus valores e encargos separadamente.

## Verificar

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

O build gera `out/`, hospedável como HTML/CSS/JS sem Node em produção. Para testar o conteúdo gerado:

```powershell
npm.cmd run preview
```

Os testes de navegador usam **out/** servido na porta 3001 e Microsoft Edge instalado:

```powershell
node node_modules/serve/build/main.js out -l 3001
# Em outro terminal:
npx.cmd playwright test
```

Outros ambientes podem ajustar `channel` em `playwright.config.ts` para um navegador Playwright instalado. São testes da aplicação real, incluindo execução do Worker, exportação e ausência de requisições externas. O servidor de desenvolvimento pode continuar em 3000 enquanto o build estático é testado em 3001.

## Funcionalidades

- Price e SAC, contrato novo ou em andamento; taxa nominal/efetiva, anual/mensal.
- Extra mensal único, com redução de prazo ou prestação; valor zero desativa o extra.
- TR fixa, presets ilustrativos e taxas por ano; três hipóteses de reajuste de referência.
- Prestação teórica ou informada, seguro e tarifas separados, reajuste anual estimado.
- FGTS com depósitos, rendimento total, saques anuais, bloqueios, elegibilidade assumida e intervalos mínimos.
- Comparação com o cenário sem extras, quitação, juros, custo e separação de recursos próprios/FGTS.
- Gráfico interativo acessível e resumo anual completo aberto por padrão; botão "Ver mês a mês" abaixo para abrir a memória mensal com filtro anual e paginação.
- CSV completo e impressão dos resultados visíveis. O CSV contém a projeção inteira, mesmo quando a tabela está paginada.
- Conteúdo educativo estático abaixo da ferramenta, guias, metodologia, privacidade, sobre e termos.

Não há backend, login, banco de dados, anúncios, analytics ou salvamento automático. Valores financeiros não são enviados por rede nem colocados na URL. Não existe publicação externa nesta entrega.

## Organização

```text
src/app/                 páginas estáticas, SEO e estilos
src/components/          formulário, resultados, gráfico e tabela
src/lib/finance/         tipos, validação, taxas, FGTS e motor puro
src/lib/export/          CSV sob demanda
src/lib/content.tsx      conteúdo educativo estático
src/data/scenarios.ts    padrões e exemplo independente
tests/finance/           testes financeiros e conservação
tests/browser/           fluxos no navegador e responsividade
docs/METODOLOGIA.md      hipóteses, fontes e limites
EspecificacaoProjeto     decisões e escopo vigente
```

## Antes de publicar

Defina o domínio real em uma variável de build, por exemplo em `.env.local`:

```text
NEXT_PUBLIC_SITE_URL=https://seu-dominio-real
```

Sem domínio configurado, omitimos canonical e URLs do sitemap em vez de publicar um domínio inventado. Configure HTTPS na hospedagem, sirva `out/404.html` com status 404 para rotas inexistentes e preserve os caminhos com barra final. Preencha identificação do responsável, contato e informações do provedor de hospedagem nas páginas institucionais. Confirme a versão aplicável das regras de FGTS e revise o conteúdo financeiro antes da publicação.

**AdSense fica para outra etapa**, conforme solicitado: não há script ou espaço vazio de publicidade. A futura integração exige identificadores reais e revisão das configurações de privacidade.

## Precisão e verificações

Consulte [metodologia](docs/METODOLOGIA.md) e [verificações](docs/VERIFICACOES.md). A simulação não reproduz todos os calendários e seguros contratuais e não autoriza movimentações do FGTS. Core Web Vitals reais só podem ser confirmados após publicação; verificações em laboratório não garantem resultados de SEO, tráfego ou receita.
