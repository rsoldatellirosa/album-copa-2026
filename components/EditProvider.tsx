"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { checkToken } from "@/lib/album";

interface EditCtx {
  token: string | null; // PIN válido, ou null se bloqueado
  unlocked: boolean;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
}

const Ctx = createContext<EditCtx>({
  token: null,
  unlocked: false,
  unlock: async () => false,
  lock: () => {},
});

const STORAGE_KEY = "copa2026_edit_token";

export function EditProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      checkToken(saved).then((ok) => {
        if (ok) setToken(saved);
        else localStorage.removeItem(STORAGE_KEY);
      });
    }
  }, []);

  const unlock = useCallback(async (pin: string) => {
    const ok = await checkToken(pin);
    if (ok) {
      localStorage.setItem(STORAGE_KEY, pin);
      setToken(pin);
    }
    return ok;
  }, []);

  const lock = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
  }, []);

  return (
    <Ctx.Provider value={{ token, unlocked: !!token, unlock, lock }}>
      {children}
    </Ctx.Provider>
  );
}

export const useEdit = () => useContext(Ctx);
