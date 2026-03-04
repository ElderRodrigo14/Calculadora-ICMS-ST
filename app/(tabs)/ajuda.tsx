import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function AjudaScreen() {
  const colors = useColors();

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={styles.headerTitle}>Ajuda & Fórmulas</Text>
          <Text style={styles.headerSubtitle}>Documentação do cálculo ICMS-ST</Text>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Formato de Entrada */}
          <Section title="Formato de Entrada" colors={colors}>
            <Text style={[styles.bodyText, { color: colors.foreground }]}>
              Cole no campo de entrada uma linha por produto, usando o separador{" "}
              <Code colors={colors}>-</Code> (traço). Use <Code colors={colors}>,</Code> (vírgula) para decimais:
            </Text>
            <View style={[styles.codeBlock, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.codeText, { color: colors.foreground }]}>
                NCM-ValorProduto-IPI-AlíquotaInter
              </Text>
            </View>
            <Text style={[styles.bodyText, { color: colors.foreground, marginTop: 16 }]}>
              Exemplos práticos:
            </Text>
            <View style={[styles.codeBlock, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.codeText, { color: colors.accent }]}>
                {"85285200-699,90-0,00-7\n84439923-2907,57-0,00-7\n84433223-4.124,40-125,50-7"}
              </Text>
            </View>
            <View style={[styles.infoBox, { backgroundColor: colors.warning + "18", borderColor: colors.warning }]}>
              <Text style={[styles.infoText, { color: colors.warning }]}>
                Use <Text style={{ fontWeight: "700" }}>ponto (.)</Text> para separar milhares e{" "}
                <Text style={{ fontWeight: "700" }}>vírgula (,)</Text> para decimais. Ex: 1.234,56
              </Text>
            </View>
          </Section>

          {/* Fórmulas */}
          <Section title="Fórmulas de Cálculo" colors={colors}>
            <FormulaCard
              number="1"
              title="Redução Auxiliar (redAux)"
              formula="redAux = (Redução% == 0 ? 1 : Redução%)"
              description="Se o campo Redução% for zero ou vazio na base de NCMs, utiliza-se o fator 1 (sem redução). Caso contrário, aplica-se o valor de Redução%."
              colors={colors}
            />
            <FormulaCard
              number="2"
              title="Base de Cálculo ICMS-ST"
              formula="Base ST = (ValorProduto + IPI) × (1 + MVA%) × redAux"
              description="A base de cálculo da Substituição Tributária considera o valor do produto acrescido do IPI, multiplicado pelo MVA (Margem de Valor Agregado) e pelo fator de redução."
              colors={colors}
            />
            <FormulaCard
              number="3"
              title="ICMS ST Interno"
              formula="ICMS ST Interno = Base ST × 17%"
              description="Aplica-se a alíquota interna de 17% sobre a base de cálculo do ICMS-ST para obter o imposto interno."
              colors={colors}
            />
            <FormulaCard
              number="4"
              title="ICMS Interestadual (Crédito)"
              formula="ICMS Inter. = (ValorProduto × AlíquotaInter/100) × redAux"
              description="O crédito do ICMS interestadual é calculado sobre o valor do produto, aplicando a alíquota interestadual (4% ou 7%) e o fator de redução."
              colors={colors}
            />
            <FormulaCard
              number="5"
              title="ICMS ST Final"
              formula="ICMS ST Final = ICMS ST Interno − ICMS Interestadual"
              description="O valor final de ICMS-ST a recolher é a diferença entre o ICMS ST Interno e o crédito do ICMS Interestadual."
              colors={colors}
              highlight
            />
          </Section>

          {/* Base de NCMs */}
          <Section title="Base de Dados NCM" colors={colors}>
            <Text style={[styles.bodyText, { color: colors.foreground }]}>
              Antes de calcular, importe sua base de NCMs na aba{" "}
              <Text style={{ fontWeight: "700", color: colors.accent }}>Base NCM</Text>.
              O arquivo Excel deve conter as seguintes colunas:
            </Text>
            <View style={[styles.table, { borderColor: colors.border }]}>
              <View style={[styles.tableHeader, { backgroundColor: colors.accent + "18" }]}>
                <Text style={[styles.tableHeaderCell, { color: colors.accent, flex: 1.5 }]}>Coluna</Text>
                <Text style={[styles.tableHeaderCell, { color: colors.accent, flex: 2.5 }]}>Descrição</Text>
              </View>
              <TableRow col1="NCM" col2="Código NCM (apenas dígitos)" colors={colors} even />
              <TableRow col1="MVA%" col2="Margem de Valor Agregado (ex: 40 para 40%)" colors={colors} />
              <TableRow col1="Redução%" col2="Fator de redução da base (0 = sem redução)" colors={colors} even />
            </View>
          </Section>

          {/* Exportação */}
          <Section title="Exportação para Excel" colors={colors}>
            <Text style={[styles.bodyText, { color: colors.foreground }]}>
              Após calcular, clique no botão{" "}
              <Text style={{ fontWeight: "700", color: colors.success }}>Exportar para Excel</Text>{" "}
              para gerar um arquivo .xlsx com todos os resultados. O arquivo inclui:
            </Text>
            <View style={styles.bulletList}>
              {[
                "NCM e dados de entrada",
                "MVA% e Redução% aplicados",
                "Base de Cálculo ICMS-ST",
                "ICMS ST Interno (17%)",
                "ICMS Interestadual (Crédito)",
                "ICMS ST Final a recolher",
                "Status de cada linha",
              ].map((item, i) => (
                <View key={i} style={styles.bulletItem}>
                  <View style={[styles.bullet, { backgroundColor: colors.success }]} />
                  <Text style={[styles.bulletText, { color: colors.foreground }]}>{item}</Text>
                </View>
              ))}
            </View>
          </Section>

          {/* Dúvidas */}
          <Section title="Dúvidas Frequentes" colors={colors}>
            <View style={styles.faqContainer}>
              <FAQItem
                question="O que significa 'NCM não cadastrado'?"
                answer="Significa que o NCM informado não existe na sua base de dados. Importe um arquivo com este NCM ou verifique se o código está correto."
                colors={colors}
              />
              <FAQItem
                question="Posso usar valores com ponto e vírgula?"
                answer="Sim! Use ponto (.) para separar milhares e vírgula (,) para decimais, conforme padrão brasileiro. Ex: 1.234,56"
                colors={colors}
              />
              <FAQItem
                question="Meus dados são salvos?"
                answer="A base de NCMs é salva localmente no seu navegador. Os resultados de cálculos são mantidos enquanto você estiver usando o app."
                colors={colors}
              />
              <FAQItem
                question="Qual é a alíquota interestadual padrão?"
                answer="Você pode informar 4 ou 7, dependendo do seu estado de destino. Consulte a legislação fiscal aplicável."
                colors={colors}
              />
            </View>
          </Section>

          {/* Footer */}
          <View style={styles.versionContainer}>
            <Text style={[styles.versionText, { color: colors.muted }]}>
              ICMS-ST Calc v2.0 — Plataforma Web Desktop
            </Text>
            <Text style={[styles.versionText, { color: colors.muted, marginTop: 4 }]}>
              Design minimalista inspirado em Gemini
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function Section({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      <View style={[styles.sectionDivider, { backgroundColor: colors.accent }]} />
      {children}
    </View>
  );
}

function Code({ children, colors }: { children: string; colors: ReturnType<typeof useColors> }) {
  return (
    <Text
      style={[
        styles.inlineCode,
        { backgroundColor: colors.accent + "18", color: colors.accent },
      ]}
    >
      {children}
    </Text>
  );
}

function FormulaCard({
  number,
  title,
  formula,
  description,
  colors,
  highlight,
}: {
  number: string;
  title: string;
  formula: string;
  description: string;
  colors: ReturnType<typeof useColors>;
  highlight?: boolean;
}) {
  return (
    <View
      style={[
        styles.formulaCard,
        {
          backgroundColor: highlight ? colors.accent + "10" : colors.background,
          borderColor: highlight ? colors.accent : colors.border,
          borderWidth: highlight ? 1.5 : 1,
        },
      ]}
    >
      <View style={styles.formulaHeader}>
        <View style={[styles.formulaNumber, { backgroundColor: colors.accent }]}>
          <Text style={styles.formulaNumberText}>{number}</Text>
        </View>
        <Text style={[styles.formulaTitle, { color: colors.foreground }]}>{title}</Text>
      </View>
      <View style={[styles.formulaBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.formulaText, { color: highlight ? colors.accent : colors.foreground }]}>
          {formula}
        </Text>
      </View>
      <Text style={[styles.formulaDesc, { color: colors.muted }]}>{description}</Text>
    </View>
  );
}

function TableRow({
  col1,
  col2,
  colors,
  even,
}: {
  col1: string;
  col2: string;
  colors: ReturnType<typeof useColors>;
  even?: boolean;
}) {
  return (
    <View
      style={[
        styles.tableRow,
        { backgroundColor: even ? colors.surface : colors.background, borderTopColor: colors.border },
      ]}
    >
      <Text style={[styles.tableCell, { color: colors.accent, flex: 1.5, fontWeight: "700", fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" }]}>
        {col1}
      </Text>
      <Text style={[styles.tableCell, { color: colors.foreground, flex: 2.5 }]}>{col2}</Text>
    </View>
  );
}

function FAQItem({
  question,
  answer,
  colors,
}: {
  question: string;
  answer: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.faqItem}>
      <Text style={[styles.faqQuestion, { color: colors.foreground }]}>{question}</Text>
      <Text style={[styles.faqAnswer, { color: colors.muted }]}>{answer}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    letterSpacing: 0.5,
  },
  contentContainer: {
    paddingHorizontal: 32,
    paddingVertical: 32,
    gap: 24,
  },
  section: {
    borderRadius: 8,
    padding: 24,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  sectionDivider: {
    height: 3,
    width: 40,
    borderRadius: 2,
    marginBottom: 16,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  codeBlock: {
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
  },
  codeText: {
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    lineHeight: 20,
  },
  inlineCode: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 13,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  infoBox: {
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
  formulaCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  formulaHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  formulaNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  formulaNumberText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  formulaTitle: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  formulaBox: {
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  formulaText: {
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    lineHeight: 20,
    fontWeight: "600",
  },
  formulaDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  table: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: 12,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tableCell: {
    fontSize: 13,
    lineHeight: 18,
  },
  bulletList: {
    marginTop: 12,
    gap: 8,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  bulletText: {
    fontSize: 14,
    flex: 1,
  },
  faqContainer: {
    gap: 16,
  },
  faqItem: {
    gap: 6,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: "700",
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 20,
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 12,
  },
});
