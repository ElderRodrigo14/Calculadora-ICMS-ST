import { describe, it, expect } from "vitest";
import { calcularICMSST, parseInputLine, processarLote } from "../lib/icms-calc";
import { NCMRecord } from "../lib/icms-context";

describe("parseInputLine", () => {
  it("deve parsear linha com novo formato (traço como separador)", () => {
    const result = parseInputLine("85285200-699,90-0,00-7");
    expect(result).not.toBeNull();
    expect(result?.ncm).toBe("85285200");
    expect(result?.valorProduto).toBe(699.90);
    expect(result?.ipi).toBe(0);
    expect(result?.aliquotaInter).toBe(7);
  });

  it("deve converter vírgulas em pontos", () => {
    const result = parseInputLine("84439923-2907,57-0,00-7");
    expect(result?.valorProduto).toBe(2907.57);
    expect(result?.ipi).toBe(0);
  });

  it("deve parsear com IPI informado", () => {
    const result = parseInputLine("12345678-1000,00-50,00-7");
    expect(result?.valorProduto).toBe(1000);
    expect(result?.ipi).toBe(50);
    expect(result?.aliquotaInter).toBe(7);
  });

  it("deve parsear alíquota 4%", () => {
    const result = parseInputLine("87654321-2500,00-0,00-4");
    expect(result?.aliquotaInter).toBe(4);
  });

  it("deve tratar corretamente números brasileiros com milhar", () => {
    // 4.124,40 deve ser convertido para 4124.40
    const result = parseInputLine("84433223-4.124,40-0,00-7");
    expect(result).not.toBeNull();
    expect(result?.ncm).toBe("84433223");
    expect(result?.valorProduto).toBe(4124.40);
    expect(result?.ipi).toBe(0);
    expect(result?.aliquotaInter).toBe(7);
  });

  it("deve tratar números com múltiplos separadores de milhar", () => {
    // 1.234.567,89 deve ser convertido para 1234567.89
    const result = parseInputLine("12345678-1.234.567,89-0,00-7");
    expect(result?.valorProduto).toBe(1234567.89);
  });

  it("deve tratar IPI com milhar", () => {
    // 1.500,00 deve ser convertido para 1500.00
    const result = parseInputLine("12345678-5000,00-1.500,00-7");
    expect(result?.valorProduto).toBe(5000);
    expect(result?.ipi).toBe(1500);
  });

  it("deve retornar null para linha inválida", () => {
    expect(parseInputLine("")).toBeNull();
    expect(parseInputLine("apenas texto")).toBeNull();
    expect(parseInputLine("85285200-699,90")).toBeNull();
  });
});

describe("calcularICMSST", () => {
  it("deve calcular corretamente o exemplo real do usuário", () => {
    // NCM: 84439923, Valor: 2907,57, IPI: 0,00, Alíquota: 7%
    // MVA: 53,86%, Redução: 41,17%
    const input = { ncm: "84439923", valorProduto: 2907.57, ipi: 0, aliquotaInter: 7 };
    const ncmRecord: NCMRecord = { ncm: "84439923", mva: 0.5386, reducao: 0.4117 };
    
    const result = calcularICMSST(input, ncmRecord);

    // redAux = 0.4117 (porque redução > 0)
    // Base ST = (2907.57 + 0) * (1 + 0.5386) * 0.4117 ≈ 1844.67
    const expectedBaseICMSST = (2907.57 + 0) * (1 + 0.5386) * 0.4117;
    expect(result.baseICMSST).toBeCloseTo(expectedBaseICMSST, 2);

    // ICMS ST Interno = 1844.67 * 0.17 ≈ 313.59
    const expectedICMSSTInterno = expectedBaseICMSST * 0.17;
    expect(result.icmsSTInterno).toBeCloseTo(expectedICMSSTInterno, 2);

    // ICMS Interestadual = (2907.57 * 7/100) * 0.4117 = (203.53) * 0.4117 ≈ 83.78
    const expectedICMSInter = (2907.57 * (7 / 100)) * 0.4117;
    expect(result.icmsInterestadual).toBeCloseTo(expectedICMSInter, 2);

    // ICMS ST Final = 313.59 - 83.78 ≈ 229.81 (próximo de 229.31)
    const expectedICMSSTFinal = expectedICMSSTInterno - expectedICMSInter;
    expect(result.icmsSTFinal).toBeCloseTo(expectedICMSSTFinal, 2);

    // Validar que está próximo do valor esperado de 229.31
    // Pequena variação pode ocorrer por arredondamentos
    expect(result.icmsSTFinal).toBeCloseTo(229.31, 1);
  });

  it("deve calcular corretamente com valor em formato brasileiro (4.124,40)", () => {
    // NCM: 84433223, Valor: 4.124,40 (4124.40), IPI: 0,00, Alíquota: 7%
    // MVA: 53,86%, Redução: 41,17%
    const input = { ncm: "84433223", valorProduto: 4124.40, ipi: 0, aliquotaInter: 7 };
    const ncmRecord: NCMRecord = { ncm: "84433223", mva: 0.5386, reducao: 0.4117 };
    
    const result = calcularICMSST(input, ncmRecord);

    // redAux = 0.4117
    // Base ST = (4124.40 + 0) * (1 + 0.5386) * 0.4117
    const expectedBaseICMSST = (4124.40 + 0) * (1 + 0.5386) * 0.4117;
    expect(result.baseICMSST).toBeCloseTo(expectedBaseICMSST, 2);
    
    // Base ST deve ser aproximadamente 2612.57 (pequena variação por arredondamento)
    expect(result.baseICMSST).toBeCloseTo(2612.57, 0);

    // ICMS ST Interno = 2612.41 * 0.17 ≈ 444.11
    const expectedICMSSTInterno = expectedBaseICMSST * 0.17;
    expect(result.icmsSTInterno).toBeCloseTo(expectedICMSSTInterno, 2);

    // ICMS Interestadual = (4124.40 * 7/100) * 0.4117 ≈ 118.43
    const expectedICMSInter = (4124.40 * (7 / 100)) * 0.4117;
    expect(result.icmsInterestadual).toBeCloseTo(expectedICMSInter, 2);

    // ICMS ST Final = 444.11 - 118.43 ≈ 325.68
    const expectedICMSSTFinal = expectedICMSSTInterno - expectedICMSInter;
    expect(result.icmsSTFinal).toBeCloseTo(expectedICMSSTFinal, 2);
  });

  it("deve calcular corretamente sem redução (redAux = 1)", () => {
    const input = { ncm: "12345678", valorProduto: 1000, ipi: 50, aliquotaInter: 7 };
    const ncmRecord: NCMRecord = { ncm: "12345678", mva: 0.40, reducao: 0 };

    const result = calcularICMSST(input, ncmRecord);

    // redAux = 1 (porque redução = 0)
    // Base ST = (1000 + 50) * (1 + 0.40) * 1 = 1050 * 1.40 = 1470
    expect(result.baseICMSST).toBeCloseTo(1470);

    // ICMS ST Interno = 1470 * 0.17 = 249.90
    expect(result.icmsSTInterno).toBeCloseTo(249.90);

    // ICMS Interestadual = (1000 * 7/100) * 1 = 70
    expect(result.icmsInterestadual).toBeCloseTo(70);

    // ICMS ST Final = 249.90 - 70 = 179.90
    expect(result.icmsSTFinal).toBeCloseTo(179.90);
  });

  it("deve calcular corretamente com redução", () => {
    const input = { ncm: "87654321", valorProduto: 2500, ipi: 0, aliquotaInter: 4 };
    const ncmRecord: NCMRecord = { ncm: "87654321", mva: 0.355, reducao: 0.70 };

    const result = calcularICMSST(input, ncmRecord);

    // redAux = 0.70
    // Base ST = (2500 + 0) * (1 + 0.355) * 0.70 = 2500 * 1.355 * 0.70 = 2371.25
    expect(result.baseICMSST).toBeCloseTo(2371.25);

    // ICMS ST Interno = 2371.25 * 0.17 = 403.1125
    expect(result.icmsSTInterno).toBeCloseTo(403.1125);

    // ICMS Interestadual = (2500 * 4/100) * 0.70 = 100 * 0.70 = 70
    expect(result.icmsInterestadual).toBeCloseTo(70);

    // ICMS ST Final = 403.1125 - 70 = 333.1125
    expect(result.icmsSTFinal).toBeCloseTo(333.1125);
  });
});

describe("processarLote", () => {
  const database: NCMRecord[] = [
    { ncm: "85285200", mva: 0.40, reducao: 0 },
    { ncm: "84439923", mva: 0.5386, reducao: 0.4117 },
    { ncm: "84433223", mva: 0.5386, reducao: 0.4117 },
    { ncm: "87654321", mva: 0.355, reducao: 0.70 },
  ];

  it("deve processar múltiplas linhas corretamente", () => {
    const input = "85285200-699,90-0,00-7\n87654321-2500,00-0,00-4";
    const results = processarLote(input, database);

    expect(results).toHaveLength(2);
    expect(results[0].status).toBe("ok");
    expect(results[1].status).toBe("ok");
  });

  it("deve processar corretamente valores com milhar", () => {
    const input = "84433223-4.124,40-0,00-7";
    const results = processarLote(input, database);

    expect(results).toHaveLength(1);
    expect(results[0].status).toBe("ok");
    expect(results[0].valorProduto).toBe(4124.40);
    expect(results[0].baseICMSST).toBeCloseTo(2612.57, 0);
  });

  it("deve marcar NCM não cadastrado", () => {
    const input = "99999999-1000,00-50,00-7";
    const results = processarLote(input, database);

    expect(results[0].status).toBe("ncm_nao_cadastrado");
    expect(results[0].errorMessage).toBe("NCM não cadastrado");
  });

  it("deve marcar linha com formato inválido", () => {
    const input = "linha inválida sem separadores";
    const results = processarLote(input, database);

    expect(results[0].status).toBe("erro");
  });

  it("deve ignorar linhas vazias", () => {
    const input = "85285200-699,90-0,00-7\n\n\n87654321-2500,00-0,00-4";
    const results = processarLote(input, database);

    expect(results).toHaveLength(2);
  });

  it("deve processar lote misto (ok + erro)", () => {
    const input = "85285200-699,90-0,00-7\n99999999-500,00-0,00-4\n87654321-2500,00-0,00-4";
    const results = processarLote(input, database);

    expect(results).toHaveLength(3);
    expect(results[0].status).toBe("ok");
    expect(results[1].status).toBe("ncm_nao_cadastrado");
    expect(results[2].status).toBe("ok");
  });
});
