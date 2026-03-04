import { describe, it, expect } from "vitest";

// Simular a função de auto-formatter
function autoFormatInput(text: string): string {
  if (text && !text.includes("|") && (text.includes(" ") || text.includes("\t"))) {
    const formatted = text
      .split("\n")
      .map((line) => {
        return line
          .trim()
          .split(/[\s\t]+/)
          .join(" | ");
      })
      .join("\n");
    return formatted;
  }
  return text;
}

describe("Auto-Formatter", () => {
  it("deve converter espaços em | para uma linha", () => {
    const input = "85182200 1005,68 98,05 4";
    const expected = "85182200 | 1005,68 | 98,05 | 4";
    expect(autoFormatInput(input)).toBe(expected);
  });

  it("deve converter tabs em |", () => {
    const input = "85182200\t1005,68\t98,05\t4";
    const expected = "85182200 | 1005,68 | 98,05 | 4";
    expect(autoFormatInput(input)).toBe(expected);
  });

  it("deve converter múltiplas linhas com espaços", () => {
    const input = "85182200 1005,68 98,05 4\n84439923 2907,57 0,00 7";
    const expected = "85182200 | 1005,68 | 98,05 | 4\n84439923 | 2907,57 | 0,00 | 7";
    expect(autoFormatInput(input)).toBe(expected);
  });

  it("não deve converter se já contém |", () => {
    const input = "85182200 | 1005,68 | 98,05 | 4";
    expect(autoFormatInput(input)).toBe(input);
  });

  it("deve remover espaços extras", () => {
    const input = "85182200   1005,68   98,05   4";
    const expected = "85182200 | 1005,68 | 98,05 | 4";
    expect(autoFormatInput(input)).toBe(expected);
  });

  it("deve lidar com mistura de espaços e tabs", () => {
    const input = "85182200 \t 1005,68  \t98,05\t 4";
    const expected = "85182200 | 1005,68 | 98,05 | 4";
    expect(autoFormatInput(input)).toBe(expected);
  });

  it("não deve converter texto vazio", () => {
    expect(autoFormatInput("")).toBe("");
  });

  it("não deve converter se não houver espaços ou tabs", () => {
    const input = "85182200";
    expect(autoFormatInput(input)).toBe(input);
  });
});
