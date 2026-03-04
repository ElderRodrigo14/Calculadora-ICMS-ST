import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useICMS } from "@/lib/icms-context";
import { processarLote } from "@/lib/icms-calc";
import { exportarResultadosExcel } from "@/lib/excel-utils";
import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function HomeScreen() {
  const colors = useColors();
  const { ncmDatabase, results, setResults } = useICMS();
  const [inputText, setInputText] = useState("");
  const [totalST, setTotalST] = useState(0);
  const [clipboardRequested, setClipboardRequested] = useState(false);
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const total = results.reduce((sum, r) => {
      if (r.status === "ok") return sum + r.icmsSTFinal;
      return sum;
    }, 0);
    setTotalST(total);
  }, [results]);

  // Click-to-Paste: tenta ler clipboard quando usuario clica no campo
  const handleInputClick = async () => {
    if (Platform.OS === "web" && !inputText.trim()) {
      try {
        // Acessa clipboard via navigator.clipboard API
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText && clipboardText.trim()) {
          handleInputChange(clipboardText);
          setClipboardRequested(true);
        }
      } catch (error) {
        // Silenciosamente ignora erros de permissao
        console.log("Clipboard access denied or not available");
      }
    }
  };

  // Focus handler: tenta colar ao receber foco
  const handleInputFocus = async () => {
    if (Platform.OS === "web" && !clipboardRequested && !inputText.trim()) {
      try {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText && clipboardText.trim()) {
          handleInputChange(clipboardText);
          setClipboardRequested(true);
        }
      } catch (error) {
        console.log("Clipboard access denied or not available");
      }
    }
  };

  // Auto-formatter: detecta espacos/tabs e converte para |
  const handleInputChange = (text: string) => {
    // Se o texto contem espacos ou tabs mas nao contem |, faz a conversao
    if (text && !text.includes("|") && (text.includes(" ") || text.includes("\t"))) {
      // Converte cada linha: espacos/tabs -> |
      const formatted = text
        .split("\n")
        .map((line) => {
          // Remove espacos extras e substitui por |
          return line
            .trim()
            .split(/[\s\t]+/)
            .join(" | ");
        })
        .join("\n");
      setInputText(formatted);
    } else {
      setInputText(text);
    }
  };

  const handleCalcular = () => {
    if (!inputText.trim()) return;
    // Converte | para - para compatibilidade com processarLote
    const normalizedInput = inputText.replace(/\s*\|\s*/g, "-");
    const newResults = processarLote(normalizedInput, ncmDatabase);
    setResults(newResults);
  };

  const handleLimpar = () => {
    setInputText("");
    setResults([]);
    setClipboardRequested(false);
  };

  const handleExportar = async () => {
    if (results.length === 0) return;
    await exportarResultadosExcel(results);
  };

  const calculados = results.filter((r) => r.status === "ok").length;
  const erros = results.filter((r) => r.status !== "ok").length;

  return (
    <ScreenContainer containerClassName="bg-background">
      <View style={{ flex: 1, flexDirection: Platform.OS === "web" ? "column" : "column" }}>
        {/* Header */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
            paddingHorizontal: 32,
            paddingVertical: 24,
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: "800",
              color: colors.foreground,
              letterSpacing: 0.5,
            }}
          >
            Calculadora Inteligente ICMS-ST
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.muted,
              marginTop: 8,
              letterSpacing: 0.5,
            }}
          >
            Calculo em lote com precisao fiscal para sua operacao
          </Text>
        </View>

        {/* Main Content - Layout Lado a Lado 30% + 70% */}
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingVertical: 0 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              flex: 1,
              flexDirection: Platform.OS === "web" ? "row" : "column",
              paddingHorizontal: 32,
              paddingVertical: 24,
              gap: 24,
            }}
          >
            {/* Left Column: Input (30%) */}
            <View
              style={{
                width: Platform.OS === "web" ? "30%" : "100%",
                gap: 16,
              }}
            >
              {/* Input Card */}
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 20,
                  gap: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <View style={{ gap: 6 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: colors.foreground,
                    }}
                  >
                    Entrada em Lote
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.muted,
                    }}
                  >
                    Clique para colar automaticamente. Espacos/tabs em |
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: colors.border,
                    overflow: "hidden",
                  }}
                >
                  <TextInput
                    ref={textInputRef}
                    style={{
                      padding: 12,
                      fontSize: 12,
                      color: colors.foreground,
                      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                      minHeight: 200,
                      textAlignVertical: "top",
                    }}
                    placeholder="Clique aqui para colar dados"
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={10}
                    value={inputText}
                    onChangeText={handleInputChange}
                    onFocus={handleInputFocus}
                    onPress={handleInputClick}
                  />
                </View>

                {/* Action Buttons */}
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 6,
                      paddingVertical: 10,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={handleLimpar}
                  >
                    <Text
                      style={{
                        fontWeight: "500",
                        color: colors.foreground,
                        fontSize: 14,
                      }}
                    >
                      Limpar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: colors.accent,
                      borderRadius: 6,
                      paddingVertical: 10,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={handleCalcular}
                  >
                    <Text
                      style={{
                        fontWeight: "600",
                        color: "#FFFFFF",
                        fontSize: 14,
                      }}
                    >
                      Calcular
                    </Text>
                  </TouchableOpacity>
                </View>

                {results.length > 0 && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.success,
                      borderRadius: 6,
                      paddingVertical: 10,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={handleExportar}
                  >
                    <Text
                      style={{
                        fontWeight: "600",
                        color: "#FFFFFF",
                        fontSize: 14,
                      }}
                    >
                      Exportar Excel
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Stats Cards - Compactos */}
              {results.length > 0 && (
                <View style={{ gap: 10 }}>
                  <StatCard
                    label="TOTAL ICMS-ST"
                    value={`R$ ${totalST.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
                    color={colors.accent}
                    colors={colors}
                  />
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <StatCard
                      label="ITENS"
                      value={results.length.toString()}
                      color={colors.foreground}
                      colors={colors}
                      flex
                    />
                    <StatCard
                      label="OK"
                      value={calculados.toString()}
                      color={colors.success}
                      colors={colors}
                      flex
                    />
                    <StatCard
                      label="ERROS"
                      value={erros.toString()}
                      color={colors.error}
                      colors={colors}
                      flex
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Right Column: Results Table (70%) */}
            {results.length > 0 && (
              <View
                style={{
                  width: Platform.OS === "web" ? "70%" : "100%",
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                {/* Table Header */}
                <View
                  style={{
                    flexDirection: "row",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: colors.accent + "15",
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: "700",
                      color: colors.accent,
                      flex: 0.8,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    NCM
                  </Text>
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: "700",
                      color: colors.accent,
                      flex: 0.9,
                      textAlign: "right",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Valor
                  </Text>
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: "700",
                      color: colors.accent,
                      flex: 0.8,
                      textAlign: "right",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    IPI
                  </Text>
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: "700",
                      color: colors.accent,
                      flex: 0.7,
                      textAlign: "right",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    MVA%
                  </Text>
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: "700",
                      color: colors.accent,
                      flex: 1,
                      textAlign: "right",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Base ST
                  </Text>
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: "700",
                      color: colors.accent,
                      flex: 1.1,
                      textAlign: "right",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    ICMS ST Final
                  </Text>
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: "700",
                      color: colors.accent,
                      flex: 0.6,
                      textAlign: "center",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Status
                  </Text>
                </View>

                {/* Table Rows - Compactas */}
                <FlatList
                  scrollEnabled={false}
                  data={results}
                  keyExtractor={(_, idx) => idx.toString()}
                  renderItem={({ item, index }) => (
                    <View
                      style={{
                        flexDirection: "row",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        backgroundColor:
                          index % 2 === 0 ? colors.background : colors.surface,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          color: colors.foreground,
                          flex: 0.8,
                          fontFamily:
                            Platform.OS === "ios" ? "Menlo" : "monospace",
                        }}
                      >
                        {item.ncm}
                      </Text>
                      <Text
                        style={{
                          fontSize: 10,
                          color: colors.foreground,
                          flex: 0.9,
                          textAlign: "right",
                        }}
                      >
                        {item.valorProduto.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Text>
                      <Text
                        style={{
                          fontSize: 10,
                          color: colors.foreground,
                          flex: 0.8,
                          textAlign: "right",
                        }}
                      >
                        {item.ipi.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Text>
                      <Text
                        style={{
                          fontSize: 10,
                          color: colors.foreground,
                          flex: 0.7,
                          textAlign: "right",
                        }}
                      >
                        {item.mva?.toFixed(2)}%
                      </Text>
                      <Text
                        style={{
                          fontSize: 10,
                          color: colors.foreground,
                          flex: 1,
                          textAlign: "right",
                        }}
                      >
                        {item.baseICMSST.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Text>
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "700",
                          color:
                            item.status === "ok"
                              ? colors.success
                              : colors.error,
                          flex: 1.1,
                          textAlign: "right",
                        }}
                      >
                        {item.icmsSTFinal.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Text>
                      <View
                        style={{
                          flex: 0.6,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <View
                          style={{
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 4,
                            backgroundColor:
                              item.status === "ok"
                                ? colors.success + "20"
                                : colors.error + "20",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 8,
                              fontWeight: "600",
                              color:
                                item.status === "ok"
                                  ? colors.success
                                  : colors.error,
                              textTransform: "uppercase",
                              letterSpacing: 0.3,
                            }}
                          >
                            {item.status === "ok" ? "OK" : "ERRO"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

function StatCard({
  label,
  value,
  color,
  colors,
  flex,
}: {
  label: string;
  value: string;
  color: string;
  colors: ReturnType<typeof useColors>;
  flex?: boolean;
}) {
  return (
    <View
      style={{
        flex: flex ? 1 : undefined,
        backgroundColor: colors.surface,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      <Text
        style={{
          fontSize: 9,
          color: colors.muted,
          fontWeight: "600",
          marginBottom: 4,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          color: color,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
