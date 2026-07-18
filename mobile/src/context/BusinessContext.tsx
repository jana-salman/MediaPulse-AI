import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { getBusiness } from "../config/api";
import { Business } from "../types";

const STORAGE_KEY = "mediapulse:business_id";

interface BusinessContextValue {
  business: Business | null;
  loading: boolean;
  setBusiness: (b: Business) => Promise<void>;
  clearBusiness: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextValue | undefined>(
  undefined
);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [business, setBusinessState] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedId = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedId) {
          const { business: b } = await getBusiness(storedId);
          setBusinessState(b);
        }
      } catch (err) {
        // The stored business no longer exists (or the backend is unreachable).
        // Clear it so the user is sent back to Business Setup instead of getting stuck.
        await AsyncStorage.removeItem(STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setBusiness = async (b: Business) => {
    await AsyncStorage.setItem(STORAGE_KEY, b.id);
    setBusinessState(b);
  };

  const clearBusiness = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setBusinessState(null);
  };

  return (
    <BusinessContext.Provider
      value={{ business, loading, setBusiness, clearBusiness }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error("useBusiness must be used within a BusinessProvider");
  return ctx;
}
