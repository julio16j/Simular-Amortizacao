# Verificação da primeira versão

Atualizado em 02/11/2026. Este arquivo registra as verificações efetivamente executadas e seus limites.

## Resultado final desta entrega

- Lint e TypeScript: aprovados, sem erros.
- Vitest: **48 testes financeiros aprovados**, incluindo conservação, precisão e projeções longas.
- Build de produção: aprovado, com exportação de páginas estáticas para `out/`.
- Playwright: **11 testes aprovados** no Edge contra o build exportado, incluindo os padrões mais recentes solicitados.
- Axe: nenhuma violação detectada nos conjuntos WCAG 2 A/AA e 2.1 A/AA nos estados auditados (formulário, resultados, opções avançadas e FGTS). Isso não equivale a certificação completa de acessibilidade.
- Página de desenvolvimento em `http://localhost:3000`: resposta HTTP 200 confirmada após a última atualização.
- Lighthouse: a tentativa de auditoria não concluiu por falha de conexão ao endpoint de depuração do navegador. Não há pontuação de desempenho, SEO ou Core Web Vitals publicada como resultado desta entrega.

## Ambiente

- Windows, Node 26.4.0, dependências fixadas em package-lock.json.
- Next.js 16.4.4 com exportação estática.
- Navegador automatizado: Microsoft Edge via Playwright, usando o build exportado.

## Cobertura

- Testes financeiros independentes para fórmulas, conversão, TR, Price, SAC, amortizações, FGTS e conservação de recursos.
- Testes de navegador para padrões, cálculo em Worker, recálculo, memória mensal, CSV, restauração, exemplo, elegibilidade e sistema SAC.
- Larguras de 320, 375, 768, 1024 e 1440 pixels, com checagem de ausência de rolagem horizontal na página.
- Verificação de conteúdo no HTML inicial, rotas institucionais e educativas, robots e sitemap.
- Verificação de ausência de requisições HTTP externas durante a simulação.
- Navegação inicial por teclado e viewport estreito equivalente ao reflow de uma tela de 1280 pixels com zoom de 200%. Não substitui teste manual do zoom real do navegador.

## Limites

- Ainda não verificado em dispositivos físicos, Safari/iOS, Firefox ou Chrome/Android.
- A responsividade é verificada por tamanhos de viewport no Edge; não implica compatibilidade universal já comprovada.
- Não há métricas de campo de Core Web Vitals, pois o site não foi publicado.
- A inspeção automatizada não substitui avaliação manual com leitor de tela.
- Sem domínio real, canonical é omitido e sitemap não lista URLs. A geração deve ser validada com a variável de domínio real antes da publicação.
- Contato e identificação do responsável permanecem pendentes do fornecimento dos dados reais.
