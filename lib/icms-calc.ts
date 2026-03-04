import { NCMRecord, InputLine, ResultLine } from "./icms-context";

/**
 * Calcula ICMS-ST para uma linha de input.
 *
 * Fórmulas (CORRIGIDAS):
 * - redAux = (Redução% == 0 ? 1 : Redução%)
 * - Base ICMS ST = ((ValorProduto + IPI) * (1 + MVA%)) * redAux
 * - ICMS ST Interno = Base ICMS ST * 17%
 * - ICMS ST Final = (Base ST * 17%) - ((ValorProduto * AlíquotaInter/100) * redAux)
 */
export function calcularICMSST(
  input: InputLine,
  ncmRecord: NCMRecord
): Omit<ResultLine, "id" | "status" | "errorMessage"> {
  const { valorProduto, ipi, aliquotaInter } = input;
  const { mva, reducao } = ncmRecord;

  // redAux: se redução for 0 ou vazio, usa 1; senão usa o valor de redução
  const redAux = reducao === 0 ? 1 : reducao;

  // Base ICMS ST = ((ValorProduto + IPI) * (1 + MVA%)) * redAux
  const baseICMSST = (valorProduto + ipi) * (1 + mva) * redAux;

  // ICMS ST Interno = Base ICMS ST * 17%
  const icmsSTInterno = baseICMSST * 0.17;

  // ICMS Interestadual (Crédito) = (ValorProduto * AlíquotaInter/100) * redAux
  const icmsInterestadual = (valorProduto * (aliquotaInter / 100)) * redAux;

  // ICMS ST Final = (Base ST * 17%) - ((ValorProduto * AlíquotaInter/100) * redAux)
  const icmsSTFinal = icmsSTInterno - icmsInterestadual;

  return {
    ncm: input.ncm,
    valorProduto,
    ipi,
    aliquotaInter,
    mva,
    reducao,
    baseICMSST,
    icmsSTInterno,
    icmsInterestadual,
    icmsSTFinal,
  };
}

/**
 * Parseia uma linha de texto no novo formato:
 * NCM-ValorProduto-IPI-AlíquotaInter
 * 
 * Exemplo: 85285200-699,90-0,00-7 ou 84433223-4.124,40-0,00-7
 * 
 * Trata números no formato brasileiro:
 * - Remove pontos (.) que servem como separador de milhar
 * - Substitui vírgula (,) decimal por ponto (.)
 * Exemplo: 4.124,40 → 4124.40
 */
export function parseInputLine(line: string): InputLine | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Novo formato: NCM-ValorProduto-IPI-AlíquotaInter
  const parts = trimmed.split("-").map((p) => p.trim());
  if (parts.length < 4) return null;

  const ncm = parts[0].replace(/\D/g, ""); // apenas dígitos
  
  // Função auxiliar para converter números brasileiros
  const parseBrazilianNumber = (str: string): number => {
    // Remove todos os pontos (separador de milhar)
    let cleaned = str.replace(/\./g, "");
    // Substitui vírgula (decimal) por ponto
    cleaned = cleaned.replace(",", ".");
    return parseFloat(cleaned);
  };
  
  const valorProduto = parseBrazilianNumber(parts[1]);
  const ipi = parseBrazilianNumber(parts[2]);
  const aliquotaRaw = parseBrazilianNumber(parts[3]);

  if (!ncm || isNaN(valorProduto) || isNaN(ipi) || isNaN(aliquotaRaw)) return null;

  // A alíquota já vem como percentual (4 ou 7), não precisa converter
  // Mantém como está para usar em: (ValorProduto * AlíquotaInter/100)

  return { ncm, valorProduto, ipi, aliquotaInter: aliquotaRaw };
}

/**
 * Processa todas as linhas de input contra a base de NCMs.
 */
export function processarLote(
  inputText: string,
  ncmDatabase: NCMRecord[]
): ResultLine[] {
  const lines = inputText.split("\n");
  const results: ResultLine[] = [];
  let idCounter = 1;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const parsed = parseInputLine(trimmed);
    if (!parsed) {
      results.push({
        id: String(idCounter++),
        ncm: trimmed.substring(0, 20),
        valorProduto: 0,
        ipi: 0,
        aliquotaInter: 0,
        mva: 0,
        reducao: 0,
        baseICMSST: 0,
        icmsSTInterno: 0,
        icmsInterestadual: 0,
        icmsSTFinal: 0,
        status: "erro",
        errorMessage: "Formato inválido. Use: NCM-Valor-IPI-Alíquota (ex: 85285200-699,90-0,00-7)",
      });
      continue;
    }

    const ncmRecord = ncmDatabase.find((r) => r.ncm === parsed.ncm);
    if (!ncmRecord) {
      results.push({
        id: String(idCounter++),
        ncm: parsed.ncm,
        valorProduto: parsed.valorProduto,
        ipi: parsed.ipi,
        aliquotaInter: parsed.aliquotaInter,
        mva: 0,
        reducao: 0,
        baseICMSST: 0,
        icmsSTInterno: 0,
        icmsInterestadual: 0,
        icmsSTFinal: 0,
        status: "ncm_nao_cadastrado",
        errorMessage: "NCM não cadastrado",
      });
      continue;
    }

    const calc = calcularICMSST(parsed, ncmRecord);
    results.push({
      id: String(idCounter++),
      ...calc,
      status: "ok",
    });
  }

  return results;
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatPercent(value: number): string {
  return (value * 100).toFixed(2) + "%";
}
