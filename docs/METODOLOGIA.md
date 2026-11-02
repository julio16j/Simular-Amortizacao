# Motor financeiro da primeira versão

O motor fica em `src/lib/finance`, sem dependências de React, rede ou estado global. Dados do formulário são em reais e percentuais; valores monetários de saída são inteiros em centavos. Consulte também a página `/metodologia/`, gerada em HTML estático.

## Precisão

Decimal.js utiliza 36 dígitos, com arredondamento `ROUND_HALF_UP`. Saldo, juros, TR, pagamentos e fluxos do FGTS são liquidados mensalmente em centavos. Referências teóricas de prestação e amortização mantêm precisão decimal entre reajustes para evitar propagação de arredondamentos. `roundingDifference` mede a diferença entre juros + TR arredondados e os valores exatos em centavos; não é um fluxo adicional.

No vencimento estimado, admite-se ajuste de resíduo de até um centavo por mês do prazo inicial da projeção. A prestação final não é aumentada para absorver saldos maiores do que esse limite: não existe parcela-balão implícita. Projeções extremas que ultrapassem a representação segura de centavos inteiros são rejeitadas com uma mensagem, antes de apresentar resultados sem precisão.

## Taxas e sistemas

- Taxa mensal: aplicada diretamente, após dividir o percentual por 100.
- Nominal anual: percentual dividido por 100 e por 12, assumindo capitalização mensal.
- Efetiva anual, TR anual e rendimento total anual do FGTS: `(1 + taxa / 100)^(1/12) - 1`.
- Price: `PMT = PV * i / (1 - (1+i)^(-n))`. Com taxa zero, `PV/n`.
- SAC: amortização ordinária inicial `PV/n`; juros sobre o saldo corrigido.
- Contrato em andamento usa saldo atual e meses restantes. Novo contrato usa principal financiado e prazo original. Entrada e parcelas anteriores não entram no custo futuro.
- Prestação informada pode diferir da teórica. Encargos são deduzidos antes de definir a referência quando já estiverem incluídos. No SAC, a referência informada define a amortização inicial após deduzir os juros iniciais.

## Ordem por competência mensal

1. Saldo inicial → TR → saldo corrigido.
2. Atualização da referência de prestação/amortização segundo a hipótese de reajuste.
3. Juros sobre saldo corrigido, pagamento financeiro, principal ordinário, seguro e taxas.
4. Projeção do fundo: rendimento e depósito, ou depósito e rendimento, conforme escolha.
5. Extra próprio mensal, limitado ao principal disponível.
6. Saque-aniversário e uso direto de FGTS, na ordem escolhida. Cada retirada diminui o fundo imediatamente.
7. Recálculo do prazo ou pagamento após cada amortização e registro dos saldos e acumulados.

Datas indicam competência, sem pro rata diário. Datas dentro do mesmo mês não alteram a ordem acima. O vencimento mantém o dia âncora, limitado ao último dia de meses curtos. Reajustes anuais de seguro e tarifas ocorrem a cada 12 meses da projeção, não por idade do segurado. Depósitos reajustam a cada aniversário do início da projeção do fundo.

### Hipóteses de TR

O padrão é 1,5% a.a. e as alternativas de 0,5%, 2,5% e zero são ilustrativas. É possível editar a taxa fixa ou sobrepor taxas por ano civil.

- **Indexada:** corrige mensalmente a referência financeira Price ou amortização SAC pelo fator da TR.
- **Fixa:** preserva a referência, podendo alterar a data final e produzir capitalização de juros.
- **Recalculada:** recalcula mensalmente pelo saldo corrigido e prazo restante.

Essas hipóteses não reproduzem todos os contratos. Na recalculada, a referência informada é substituída pelo recálculo mensal; isso é sinalizado na interface. Preservar prazo ou prestação após extras depende da hipótese de reajuste selecionada.

## FGTS

Saldo agregado de contas, depósito e rendimento total estimado. A TR não é somada novamente ao rendimento. Depósitos futuros podem ser escalados por um percentual e reajuste anual estimado.

O saque anual utiliza a tabela oficial em sete faixas. Não é um empréstimo de antecipação. Na ausência de comprovação externa, o simulador usa as informações de bloqueio e disponibilidade fornecidas; não consulta sistemas da Caixa.

O uso direto exige premissa de elegibilidade explicitamente marcada. A versão adota intervalo mínimo de 24 meses (pode ser aumentado) e considera a última utilização anterior informada. Tentativas em intervalo menor são registradas como bloqueadas. Não são modeladas exceções ao intervalo usual.

Somente o saldo livre (`saldo - bloqueio fixo em reais`) pode ser movimentado. O bloqueio não é liberado automaticamente. Se saques estiverem comprometidos, podem ser desabilitados integralmente. O saque anual é calculado sobre o saldo agregado e limitado à disponibilidade livre, uma aproximação que não reproduz garantias de antecipação. Se o valor sacado exceder a dívida, o excedente sai do FGTS e fica registrado como dinheiro guardado; o uso direto retira apenas o efetivamente aplicado.

Se o fundo começar antes da próxima prestação, há projeção anterior de depósitos, rendimentos e saques. Valores retirados antes do horizonte da dívida não contam como pagamentos futuros. Operações diretas anteriores devem estar refletidas no saldo informado; não são retroativamente aplicadas.

Fontes consultadas/referências em 02/11/2026:

- [FGTS — Saque-Aniversário](https://www.fgts.gov.br/Paginas/trabalhador/saque/saque-aniversario.aspx): tabela e distinção de antecipação. Página consultada diretamente.
- [Caixa — uso do FGTS na casa própria](https://www.caixa.gov.br/voce/habitacao/Paginas/utilizacao-fgts.aspx): requisitos habitacionais. Referência localizada em busca oficial; leitura direta indisponível por redirecionamento do site.
- [Manual da Moradia Própria V034, 21/10/2024](https://www.caixa.gov.br/Downloads/fgts-moradia/MANUAL_DA_MORADIA_PROPRIA_21_10_2024_V_034.pdf): referência localizada para intervalo de dois anos. O acesso direto ao PDF apresentou redirecionamento; confirmar versão contratualmente aplicável antes de uma operação real.

## Conservação e custo

Em cada mês:

```text
saldo final = saldo inicial + TR + juros capitalizados - principal total amortizado
FGTS final = FGTS inicial + depósito + rendimento - saque-aniversário - uso direto
prestação total = juros pagos + amortização ordinária + seguro + taxa
custo = prestações + extras próprios + FGTS efetivamente aplicado
recursos próprios = prestações + extras próprios
```

TR já integra o saldo amortizado; somá-la novamente ao custo duplicaria o fluxo. Saque guardado e depósito no fundo não são pagamentos da dívida. Juros apropriados, pagos e capitalizados ficam separados na memória. O total de principal amortizado pode superar o saldo inicial por incluir correção e juros capitalizados.

Ambos os cenários devem quitar para calcular economia de juros e meses. Há limite de segurança de 1.200 competências ou crescimento excessivo do saldo. Resultados parciais não recebem data fictícia de quitação nem economia final.

## Limitações

Sem juros diários, feriados, reajustes por idade, regras específicas de seguros, carências, inadimplência, renegociação, portabilidade, tributos, valor presente, custo de oportunidade, rescisão trabalhista, liberações extraordinárias, empréstimos de antecipação ou liberação de garantias. Não há autenticação nem verificação efetiva de elegibilidade. Toda projeção é uma estimativa educativa.
