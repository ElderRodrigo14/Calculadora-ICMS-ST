import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface NCMRecord {
  ncm: string;
  mva: number;      // MVA em decimal, ex: 0.40 para 40%
  reducao: number;  // Redução em decimal, ex: 0.70 para 70% (fator de redução)
}

export interface InputLine {
  ncm: string;
  valorProduto: number;
  ipi: number;
  aliquotaInter: number; // 0.04 ou 0.07
}

export interface ResultLine {
  id: string;
  ncm: string;
  valorProduto: number;
  ipi: number;
  aliquotaInter: number;
  mva: number;
  reducao: number;
  baseICMSST: number;
  icmsSTInterno: number;
  icmsInterestadual: number;
  icmsSTFinal: number;
  status: "ok" | "ncm_nao_cadastrado" | "erro";
  errorMessage?: string;
}

interface ICMSContextType {
  ncmDatabase: NCMRecord[];
  setNcmDatabase: (records: NCMRecord[]) => void;
  results: ResultLine[];
  setResults: (results: ResultLine[]) => void;
  totalST: number;
  totalItens: number;
  itensComErro: number;
}

const ICMSContext = createContext<ICMSContextType | null>(null);

const STORAGE_KEY = "@icms_ncm_database";

export function ICMSProvider({ children }: { children: React.ReactNode }) {
  const [ncmDatabase, setNcmDatabaseState] = useState<NCMRecord[]>([]);
  const [results, setResults] = useState<ResultLine[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        try {
          setNcmDatabaseState(JSON.parse(data));
        } catch {
          // ignore parse errors
        }
      }
    });
  }, []);

  const setNcmDatabase = useCallback((records: NCMRecord[]) => {
    setNcmDatabaseState(records);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, []);

  const totalST = results.reduce((acc, r) => acc + (r.status === "ok" ? r.icmsSTFinal : 0), 0);
  const totalItens = results.length;
  const itensComErro = results.filter((r) => r.status !== "ok").length;

  return (
    <ICMSContext.Provider
      value={{ ncmDatabase, setNcmDatabase, results, setResults, totalST, totalItens, itensComErro }}
    >
      {children}
    </ICMSContext.Provider>
  );
}

export function useICMS() {
  const ctx = useContext(ICMSContext);
  if (!ctx) throw new Error("useICMS must be used within ICMSProvider");
  return ctx;
}
