import * as XLSX from "xlsx";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { NCMRecord, ResultLine } from "./icms-context";
import { formatCurrency, formatPercent } from "./icms-calc";

/**
 * Lê um arquivo Excel de NCMs a partir de um URI local.
 * Espera colunas: NCM, MVA%, Redução% (ou variações)
 */
export async function lerBaseNCMExcel(uri: string): Promise<NCMRecord[]> {
  let base64: string;

  if (Platform.OS === "web") {
    // Na web, o URI já é um data URL base64
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    return extrairNCMsDoWorkbook(workbook);
  }

  base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const workbook = XLSX.read(base64, { type: "base64" });
  return extrairNCMsDoWorkbook(workbook);
}

function extrairNCMsDoWorkbook(workbook: XLSX.WorkBook): NCMRecord[] {
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const records: NCMRecord[] = [];

  for (const row of rows) {
    // Normaliza chaves para lowercase sem espaços/acentos
    const normalized: Record<string, string> = {};
    for (const [key, val] of Object.entries(row)) {
      normalized[normalizarChave(key)] = String(val).trim();
    }

    // Tenta encontrar as colunas NCM, MVA e Redução
    const ncmRaw =
      normalized["ncm"] ||
      normalized["codigoncm"] ||
      normalized["codigo"] ||
      "";

    const mvaRaw =
      normalized["mva"] ||
      normalized["mva%"] ||
      normalized["mvapercent"] ||
      normalized["margemvalor"] ||
      "";

    const reducaoRaw =
      normalized["reducao"] ||
      normalized["reducao%"] ||
      normalized["reducaopercent"] ||
      normalized["fatorReducao"] ||
      normalized["fator"] ||
      "";

    const ncm = ncmRaw.replace(/\D/g, "");
    if (!ncm) continue;

    let mva = parseFloat(mvaRaw.replace(",", "."));
    if (isNaN(mva)) mva = 0;
    // Se MVA informado como percentual (ex: 40 para 40%), converter para decimal
    if (mva > 1) mva = mva / 100;

    let reducao = parseFloat(reducaoRaw.replace(",", "."));
    if (isNaN(reducao)) reducao = 0;
    // Se Redução informada como percentual (ex: 70 para 70%), converter para decimal
    if (reducao > 1) reducao = reducao / 100;

    records.push({ ncm, mva, reducao });
  }

  return records;
}

function normalizarChave(key: string): string {
  return key
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Exporta os resultados calculados para um arquivo Excel e compartilha.
 */
export async function exportarResultadosExcel(results: ResultLine[]): Promise<void> {
  const rows = results.map((r) => ({
    NCM: r.ncm,
    "Valor Produto": r.valorProduto,
    IPI: r.ipi,
    "Alíquota Inter. (%)": (r.aliquotaInter * 100).toFixed(0) + "%",
    "MVA (%)": formatPercent(r.mva),
    "Redução (%)": r.reducao === 0 ? "0%" : formatPercent(r.reducao),
    "Base ICMS ST": r.baseICMSST,
    "ICMS ST Interno": r.icmsSTInterno,
    "ICMS Interestadual": r.icmsInterestadual,
    "ICMS ST Final": r.icmsSTFinal,
    Status: r.status === "ok" ? "OK" : r.errorMessage ?? r.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Formatação de largura das colunas
  worksheet["!cols"] = [
    { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 16 },
    { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 16 },
    { wch: 18 }, { wch: 14 }, { wch: 22 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "ICMS-ST Resultados");

  if (Platform.OS === "web") {
    XLSX.writeFile(workbook, "ICMS_ST_Resultados.xlsx");
    return;
  }

  const base64 = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });
  const fileUri = FileSystem.documentDirectory + "ICMS_ST_Resultados.xlsx";
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, {
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      dialogTitle: "Exportar Resultados ICMS-ST",
      UTI: "com.microsoft.excel.xlsx",
    });
  }
}
