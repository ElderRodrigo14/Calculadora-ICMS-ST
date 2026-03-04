# TODO — Calculadora ICMS-ST em Lote

- [x] Gerar logo do aplicativo
- [x] Configurar tema de cores (azul corporativo fiscal)
- [x] Instalar dependências: xlsx, expo-document-picker, expo-sharing, expo-file-system
- [x] Configurar ícones de tabs (calculator, database, help)
- [x] Criar contexto global para base de dados NCM e resultados
- [x] Implementar tela Home/Calculadora (tab index)
  - [x] Dashboard card com total de ST
  - [x] Textarea de input em lote
  - [x] Botão Calcular com lógica ICMS-ST
  - [x] Tabela de resultados (FlatList)
  - [x] Botão Exportar Excel
- [x] Implementar tela Base NCM (tab 2)
  - [x] Botão de upload de Excel
  - [x] Lista de NCMs cadastrados
  - [x] Campo de busca
  - [x] Contador de NCMs
- [x] Implementar tela Ajuda (tab 3)
  - [x] Explicação das fórmulas
  - [x] Formato de entrada
- [x] Implementar lógica de leitura de Excel (xlsx)
- [x] Implementar lógica de cálculo ICMS-ST
  - [x] Base ICMS ST
  - [x] ICMS ST Interno (17%)
  - [x] ICMS Interestadual (Crédito)
  - [x] ICMS ST Final
- [x] Implementar exportação para Excel
- [x] Persistência local da base NCM (AsyncStorage)
- [x] Atualizar app.config.ts com nome e logo
- [x] Testes unitários (13 testes passando)

## Correções Aplicadas (v1.1)

- [x] Alterar formato de entrada: separador traço (-) em vez de pipe (|)
- [x] Converter vírgulas em pontos antes de calcular
- [x] Implementar redução auxiliar (redAux): se Redução% = 0, redAux = 1; senão redAux = Redução%
- [x] Corrigir fórmula Base ICMS ST: ((ValorProduto + IPI) * (1 + MVA%)) * redAux
- [x] Corrigir fórmula ICMS ST Final: (Base ST * 17%) - ((ValorProduto * AlíquotaInterestadual/100) * redAux)
- [x] Validar com exemplo: 84439923-2907,57-0,00-7 (MVA 53,86%, Redução 41,17%) = R$ 229,31 ✓
- [x] Atualizar testes unitários com nova lógica (13 testes passando)
- [x] Atualizar placeholder e hints de formato na UI

## Correções de Parsing Numérico (v1.2)

- [x] Corrigir parseInputLine: remover pontos (milhar) ANTES de converter vírgula em ponto
- [x] Atualizar função de conversão: 4.124,40 → 4124.40 (não 4.12)
- [x] Validar com exemplo: 84433223-4.124,40-0,00-7 (MVA 53,86%, Redução 41,17%) = Base ST R$ 2.612,41 ✓
- [x] Atualizar testes unitários com novos exemplos de parsing (18 testes passando)

## Redesign Visual Premium (v1.3)

- [x] Atualizar paleta de cores: Branco, Cinza Claro, Roxo Vibrante ✓
- [x] Aplicar bordas arredondadas (rounded-xl) em campos e containers ✓
- [x] Adicionar sombras suaves (soft shadows) aos cards ✓
- [x] Redesenhar layout: Card Principal centralizado com fundo acinzentado ✓
- [x] Atualizar título para "Calculadora Inteligente ICMS-ST" ✓
- [x] Adicionar ícones modernos aos campos (etiqueta para NCM, cifrão para Valor) ✓
- [x] Otimizar campo de entrada com fonte monoespaçada e rótulo flutuante ✓
- [x] Redesenhar resultados em Cards Individuais com zebra-striping e hover effect ✓
- [x] Destacar ICMS ST Final em negrito com cor vibrante ✓
- [x] Testar responsividade em monitores grandes e notebooks ✓

## Transformação Web Desktop (v2.0)

- [x] Atualizar paleta de cores: Branco, Cinza Claro, Azul Suave ✓
- [x] Implementar tipografia moderna (sans-serif, similar Google Sans) ✓
- [x] Criar layout desktop com header limpo e seções bem espaçadas ✓
- [x] Redesenhar entrada em lote em card central elegante ✓
- [x] Implementar tabela de resultados com colunas alinhadas ✓
- [x] Adicionar responsividade para HD, Full HD e monitores maiores ✓
- [x] Manter lógica de cálculo ICMS-ST (parsing, redAux, fórmulas) ✓
- [x] Testar em múltiplas resoluções de desktop ✓

## Refinamento de Interface (v2.1)

- [x] Implementar layout lado a lado: 35% entrada (esquerda) + 65% resultados (direita) ✓
- [x] Criar auto-formatter: detectar espaços/tabs e converter para separador | ✓
- [x] Compactar tabela de resultados: reduzir padding das células ✓
- [x] Ajustar cards de resumo para novo layout ✓
- [x] Usar fontes Google (Inter ou Roboto) para visual clean ✓
- [x] Validar lógica de cálculo com novo layout ✓
- [x] Testar responsividade do layout lado a lado ✓

## Auto-Paste e Otimização Desktop (v2.2)

- [x] Implementar auto-paste: event listener no campo de entrada ✓
- [x] Integrar clipboard API com permissão única do navegador ✓
- [x] Auto-delimitador: converter espaços/tabs em | após colar ✓
- [x] Ajustar layout para 30% entrada + 70% resultados ✓
- [x] Compactar tabela: reduzir padding e altura das linhas ✓
- [x] Manter precisão numérica: parsing de milhar e lógica redAux ✓
- [x] Testes de auto-formatter (8 testes passando) ✓

## Click-to-Paste Avançado (v2.3)

- [ ] Implementar click-to-paste com navigator.clipboard.readText()
- [ ] Adicionar tratamento de permissões de clipboard
- [ ] Auto-separator: converter espaços/tabs em | em tempo real
- [ ] Preservar estrutura de múltiplas linhas
- [ ] Validar layout 30% + 70% compacto
- [ ] Testes de click-to-paste e auto-separator
