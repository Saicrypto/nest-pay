import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../lib/supabase";
import { clearServicesCache } from "../pages/Services/cache/servicesCache";
import { clearComplaintsCache } from "../pages/Complaints/cache/complaintsCache";

const TOKEN_STORAGE_KEY = "nest-pay-tenant-token";
const UNIT_STORAGE_KEY = "nest-pay-tenant-unit";

function readSessionStorage(key) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSessionStorage(key, value) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Ignore storage quota/security errors on restricted WebViews
  }
}

function removeSessionStorage(key) {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore storage errors on restricted WebViews
  }
}

function clearAllTenantCaches(token) {
  clearServicesCache(token);
  clearComplaintsCache(token);
}

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const [deviceToken, setDeviceToken] = useState(null);
  const [unitId, setUnitId] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [unit, setUnit] = useState(null);
  const [property, setProperty] = useState(null);
  const [rentStartDate, setRentStartDate] = useState(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ownerPayment, setOwnerPayment] = useState(null);

  const verifySession = useCallback(async (token, storedUnitId) => {
    const { data, error } = await supabase.functions.invoke(
      "verify-tenant-session",
      {
        body: { device_token: token },
      }
    );

    if (error) {
      const status = error?.context?.status;
      let serverMessage = error?.message || "Unable to verify session.";

      try {
        if (error?.context && typeof error.context.json === "function") {
          const payload = await error.context.json();
          if (payload?.error) serverMessage = payload.error;
        }
      } catch {
        // Keep fallback message
      }

      const wrappedError = new Error(serverMessage);
      wrappedError.isAuthInvalid = status === 401 || status === 403;
      throw wrappedError;
    }

    if (!data?.valid || String(data.unit_id) !== String(storedUnitId)) {
      const invalidError = new Error("Tenant session is invalid or expired.");
      invalidError.isAuthInvalid = true;
      throw invalidError;
    }

    return data;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function verifyStoredSession() {
      const token = readSessionStorage(TOKEN_STORAGE_KEY);
      const storedUnitId = readSessionStorage(UNIT_STORAGE_KEY);

      if (!token || !storedUnitId) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const data = await verifySession(token, storedUnitId);

        if (mounted) {
          setDeviceToken(token);
          setUnitId(data.unit_id);
          setUnit(data.unit ?? null);
          setProperty(data.property ?? null);
          setOnboardingCompleted(Boolean(data.onboarding_completed));
          setRentStartDate(data.rent_start_date ?? null);
          setTenant(data.tenant ?? null);
          setOwnerPayment(data.owner_payment ?? null);
        }
      } catch (error) {
        console.error("Tenant session verification failed:", error);

        if (error?.isAuthInvalid) {
          removeSessionStorage(TOKEN_STORAGE_KEY);
          removeSessionStorage(UNIT_STORAGE_KEY);
          clearAllTenantCaches(token);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    verifyStoredSession();

    return () => {
      mounted = false;
    };
  }, [verifySession]);

  const login = useCallback(
    (
      token,
      id,
      completed = false,
      unitData = null,
      propertyData = null,
      rentDate = null,
      tenantData = null,
      ownerPaymentData = null
    ) => {
      const cleanToken = String(token ?? "").trim();
      const cleanUnitId = String(id ?? "").trim();
      if (!cleanToken || !cleanUnitId) return;

      clearAllTenantCaches();
      writeSessionStorage(TOKEN_STORAGE_KEY, cleanToken);
      writeSessionStorage(UNIT_STORAGE_KEY, cleanUnitId);

      setDeviceToken(cleanToken);
      setUnitId(cleanUnitId);
      setOnboardingCompleted(Boolean(completed));
      setUnit(unitData);
      setProperty(propertyData);
      setRentStartDate(rentDate);
      setTenant(tenantData);
      setOwnerPayment(ownerPaymentData);
    },
    []
  );

  const completeOnboarding = useCallback((tenantData) => {
    setTenant(tenantData);
    setOnboardingCompleted(true);
  }, []);

  const logout = useCallback(() => {
    const currentToken = readSessionStorage(TOKEN_STORAGE_KEY);
    removeSessionStorage(TOKEN_STORAGE_KEY);
    removeSessionStorage(UNIT_STORAGE_KEY);
    clearAllTenantCaches(currentToken);

    setDeviceToken(null);
    setUnitId(null);
    setTenant(null);
    setUnit(null);
    setProperty(null);
    setRentStartDate(null);
    setOnboardingCompleted(null);
    setOwnerPayment(null);
  }, []);

  const value = useMemo(
    () => ({
      deviceToken,
      unitId,
      tenant,
      setTenant,
      unit,
      property,
      rentStartDate,
      loading,
      onboardingCompleted,
      isAuthenticated: Boolean(deviceToken && unitId),
      login,
      logout,
      completeOnboarding,
      ownerPayment,
      setOwnerPayment,
    }),
    [
      deviceToken,
      unitId,
      tenant,
      unit,
      property,
      rentStartDate,
      loading,
      onboardingCompleted,
      login,
      logout,
      completeOnboarding,
      ownerPayment,
    ]
  );

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);

  if (!context) {
    throw new Error("useTenant must be used inside TenantProvider");
  }

  return context;
}