# Design — Calculadora ICMS-ST em Lote

## Conceito Visual

Ferramenta fiscal profissional com visual clean, sóbrio e de alta legibilidade. Paleta azul corporativo com acentos verdes para valores positivos e vermelhos para alertas. Tipografia monoespaçada para valores numéricos, garantindo alinhamento e leitura rápida.

---

## Paleta de Cores

| Token       | Claro       | Escuro      | Uso                          |
|-------------|-------------|-------------|------------------------------|
| primary     | #1E40AF     | #3B82F6     | Botões principais, destaques |
| background  | #F8FAFC     | #0F172A     | Fundo geral                  |
| surface     | #FFFFFF     | #1E293B     | Cards, tabelas                |
| foreground  | #0F172A     | #F1F5F9     | Texto principal              |
| muted       | #64748B     | #94A3B8     | Texto secundário             |
| border      | #E2E8F0     | #334155     | Bordas, divisores            |
| success     | #16A34A     | #4ADE80     | Valores calculados, OK       |
| warning     | #D97706     | #FBBF24     | Avisos, NCM não cadastrado   |
| error       | #DC2626     | #F87171     | Erros, validações            |
| accent      | #0EA5E9     | #38BDF8     | Dashboard, totais            |

---

## Telas

### 1. Home / Calculadora (Tab Principal)
- **Header**: Logo + título "ICMS-ST Calc" + botão de tema (claro/escuro)
- **Dashboard Card**: Total de ST calculado (destaque grande), quantidade de itens, itens com erro
- **Seção de Input**:
  - Textarea para colar lista de NCMs com formato: `NCM | ValorProduto | IPI | AlíquotaInter`
  - Botão "Calcular" (primário, azul)
  - Botão "Limpar"
- **Tabela de Resultados**: FlatList com colunas NCM, Valor, Base ST, ICMS ST, Status
- **Botão Exportar Excel**: Flutuante ou fixo no rodapé

### 2. Base NCM (Tab Secundária)
- **Header**: Título "Base de Dados NCM"
- **Botão Upload**: Importar arquivo Excel com colunas NCM, MVA%, Redução%
- **Lista de NCMs**: FlatList com NCM, MVA%, Redução%
- **Contador**: Total de NCMs cadastrados
- **Busca**: Campo de pesquisa por NCM

### 3. Ajuda / Fórmulas (Tab Terciária)
- Explicação das fórmulas utilizadas
- Exemplo de formato de entrada
- Instruções de uso

---

## Fluxos Principais

### Fluxo 1: Upload da Base NCM
1. Usuário acessa tab "Base NCM"
2. Toca em "Importar Excel"
3. Seleciona arquivo .xlsx com colunas NCM, MVA%, Redução%
4. Sistema processa e exibe lista de NCMs cadastrados
5. Confirmação com contador atualizado

### Fluxo 2: Cálculo em Lote
1. Usuário acessa tab "Calculadora"
2. Cola lista no textarea (formato: NCM|Valor|IPI|Alíquota)
3. Toca em "Calcular"
4. Sistema valida NCMs contra base carregada
5. Exibe tabela com resultados linha a linha
6. Dashboard atualiza com totais

### Fluxo 3: Exportação
1. Usuário visualiza resultados calculados
2. Toca em "Exportar Excel"
3. Arquivo .xlsx gerado e compartilhado via sistema

---

## Componentes Chave

- `DashboardCard`: Card com valor total de ST em destaque
- `InputArea`: Textarea com placeholder de exemplo e validação
- `ResultTable`: FlatList com linhas coloridas por status
- `ResultRow`: Linha individual com NCM, valores e badge de status
- `NCMListItem`: Item da lista de NCMs cadastrados
- `StatusBadge`: Badge verde (OK), amarelo (NCM não cadastrado), vermelho (erro)
