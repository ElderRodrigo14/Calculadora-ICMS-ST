import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { ScreenContainer } from "@/components/screen-container";
import { useICMS, NCMRecord } from "@/lib/icms-context";
import { lerBaseNCMExcel } from "@/lib/excel-utils";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

export default function BaseNCMScreen() {
  const colors = useColors();
  const { ncmDatabase, setNcmDatabase } = useICMS();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredNCMs = useMemo(() => {
    if (!search.trim()) return ncmDatabase;
    return ncmDatabase.filter((r) => r.ncm.includes(search.trim()));
  }, [ncmDatabase, search]);

  const handleImportarExcel = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
          "*/*",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];
      setLoading(true);

      const records = await lerBaseNCMExcel(asset.uri);

      if (records.length === 0) {
        Alert.alert(
          "Arquivo inválido",
          "Nenhum NCM encontrado. Verifique se o arquivo possui as colunas: NCM, MVA%, Redução%"
        );
        setLoading(false);
        return;
      }

      setNcmDatabase(records);
      Alert.alert(
        "Base importada!",
        `${records.length} NCMs carregados com sucesso.`
      );
    } catch (e) {
      Alert.alert("Erro ao importar", String(e));
    } finally {
      setLoading(false);
    }
  }, [setNcmDatabase]);

  const handleLimparBase = useCallback(() => {
    Alert.alert(
      "Limpar base",
      "Deseja remover todos os NCMs cadastrados?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpar",
          style: "destructive",
          onPress: () => setNcmDatabase([]),
        },
      ]
    );
  }, [setNcmDatabase]);

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 0 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1">
          {/* Header */}
          <View
            className="bg-surface border-b border-border px-8 py-6"
            style={{
              borderBottomColor: colors.border,
            }}
          >
            <Text className="text-4xl font-bold text-foreground">
              Base de NCMs
            </Text>
            <Text className="text-sm text-muted mt-2">
              Gerencie sua tabela fiscal
            </Text>
          </View>

          {/* Content */}
          <View className="flex-1 px-8 py-8 gap-8">
            {/* Stats Cards */}
            <View className="flex-row gap-4">
              <View
                className="flex-1 bg-surface rounded-lg border border-border p-6"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <Text className="text-xs text-muted font-medium mb-2">
                  NCMs CADASTRADOS
                </Text>
                <Text className="text-3xl font-bold text-foreground">
                  {ncmDatabase.length}
                </Text>
              </View>

              <View
                className="flex-1 bg-surface rounded-lg border border-border p-6"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <Text className="text-xs text-muted font-medium mb-2">
                  EXIBIDOS
                </Text>
                <Text className="text-3xl font-bold text-accent">
                  {filteredNCMs.length}
                </Text>
              </View>
            </View>

            {/* Import Card */}
            <View
              className="bg-surface rounded-lg border border-border p-6 gap-4"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <View className="gap-2">
                <Text className="text-lg font-semibold text-foreground">
                  Importar Base
                </Text>
                <Text className="text-sm text-muted">
                  Arquivo Excel (.xlsx) com colunas: NCM, MVA%, Redução%
                </Text>
              </View>

              <TouchableOpacity
                className="bg-accent rounded-md py-3 items-center justify-center active:opacity-90"
                onPress={handleImportarExcel}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="font-semibold text-white">Importar Excel</Text>
                )}
              </TouchableOpacity>

              {ncmDatabase.length > 0 && (
                <TouchableOpacity
                  className="bg-error/10 rounded-md py-3 items-center justify-center active:opacity-80 border border-error/30"
                  onPress={handleLimparBase}
                >
                  <Text className="font-semibold text-error">Limpar Base</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Search */}
            {ncmDatabase.length > 0 && (
              <View
                className="bg-surface rounded-lg border border-border p-6 gap-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <Text className="text-lg font-semibold text-foreground">
                  Buscar NCM
                </Text>
                <View
                  className="bg-background rounded-md border border-border overflow-hidden"
                  style={{ borderColor: colors.border }}
                >
                  <TextInput
                    className="p-3 text-sm text-foreground"
                    placeholder="Digite o NCM..."
                    placeholderTextColor={colors.muted}
                    value={search}
                    onChangeText={setSearch}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}

            {/* Table */}
            {filteredNCMs.length > 0 && (
              <View
                className="bg-surface rounded-lg border border-border overflow-hidden"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                {/* Table Header */}
                <View
                  className="flex-row px-6 py-4 border-b border-border"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text className="text-xs font-semibold text-muted uppercase flex-1">
                    NCM
                  </Text>
                  <Text className="text-xs font-semibold text-muted uppercase flex-1 text-right">
                    MVA%
                  </Text>
                  <Text className="text-xs font-semibold text-muted uppercase flex-1 text-right">
                    Redução%
                  </Text>
                </View>

                {/* Table Rows */}
                <FlatList
                  scrollEnabled={false}
                  data={filteredNCMs}
                  keyExtractor={(item) => item.ncm}
                  renderItem={({ item, index }) => (
                    <View
                      className={cn(
                        "flex-row px-6 py-4 border-b border-border items-center",
                        index % 2 === 0 ? "bg-background" : "bg-surface"
                      )}
                      style={{
                        borderBottomColor: colors.border,
                        backgroundColor:
                          index % 2 === 0 ? colors.background : colors.surface,
                      }}
                    >
                      <Text className="text-sm font-semibold text-foreground flex-1">
                        {item.ncm}
                      </Text>
                      <Text className="text-sm text-foreground flex-1 text-right">
                        {(item.mva * 100).toFixed(2)}%
                      </Text>
                      <Text className="text-sm text-foreground flex-1 text-right">
                        {item.reducao === 0
                          ? "Sem redução"
                          : `${(item.reducao * 100).toFixed(2)}%`}
                      </Text>
                    </View>
                  )}
                />
              </View>
            )}

            {/* Empty State */}
            {ncmDatabase.length === 0 && (
              <View className="items-center justify-center py-16 gap-4">
                <Text className="text-center text-muted text-sm">
                  Nenhuma base de NCMs importada
                </Text>
                <Text className="text-center text-muted text-xs">
                  Clique em "Importar Excel" para começar
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
