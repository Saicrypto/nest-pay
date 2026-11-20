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
const PROFILE_STORAGE_KEY = "nest-pay-tenant-profile";

function readStorage(key) {
  try {
    return (
      window.localStorage.getItem(key) ??
      window.sessionStorage.getItem(key)
    );
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
    window.sessionStorage.setItem(key, value);
  } catch {
    // Ignore storage quota/security errors on restricted WebViews
  }
}

function removeStorage(key) {
  try {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore storage errors on restricted WebViews
  }
}

function readCachedProfile() {
  try {
    const raw = readStorage(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCachedProfile(profile) {
  try {
    writeStorage(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore serialization/storage errors
  }
}

function clearAllTenantCaches(token) {
  clearServicesCache(token);
  clearComplaintsCache(token);
}

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const initialToken = useMemo(() => readStorage(TOKEN_STORAGE_KEY), []);
  const initialUnitId = useMemo(() => readStorage(UNIT_STORAGE_KEY), []);
  const initialProfile = useMemo(() => readCachedProfile(), []);

  const [deviceToken, setDeviceToken] = useState(initialToken);
  const [unitId, setUnitId] = useState(initialUnitId);
  const [tenant, setTenant] = useState(initialProfile?.tenant ?? null);
  const [unit, setUnit] = useState(initialProfile?.unit ?? null);
  const [property, setProperty] = useState(initialProfile?.property ?? null);
  const [rentStartDate, setRentStartDate] = useState(
    initialProfile?.rentStartDate ?? null
  );
  const [onboardingCompleted, setOnboardingCompleted] = useState(
    initialProfile ? Boolean(initialProfile.onboardingCompleted) : null
  );
  const [ownerPayment, setOwnerPayment] = useState(
    initialProfile?.ownerPayment ?? null
  );
  // Only block rendering on boot if we don't already have a cached profile snapshot
  const [loading, setLoading] = useState(
    Boolean(initialToken && initialUnitId && !initialProfile)
  );

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
      const token = readStorage(TOKEN_STORAGE_KEY);
      const storedUnitId = readStorage(UNIT_STORAGE_KEY);

      if (!token || !storedUnitId) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const data = await verifySession(token, storedUnitId);

        if (mounted) {
          const nextOnboarding = Boolean(data.onboarding_completed);
          const nextUnit = data.unit ?? null;
          const nextProperty = data.property ?? null;
          const nextRentDate = data.rent_start_date ?? null;
          const nextTenant = data.tenant ?? null;
          const nextOwnerPayment = data.owner_payment ?? null;

          // Migrate any legacy sessionStorage-only tokens into localStorage
          writeStorage(TOKEN_STORAGE_KEY, token);
          writeStorage(UNIT_STORAGE_KEY, String(data.unit_id));
          writeCachedProfile({
            onboardingCompleted: nextOnboarding,
            unit: nextUnit,
            property: nextProperty,
            rentStartDate: nextRentDate,
            tenant: nextTenant,
            ownerPayment: nextOwnerPayment,
          });

          setDeviceToken(token);
          setUnitId(data.unit_id);
          setUnit(nextUnit);
          setProperty(nextProperty);
          setOnboardingCompleted(nextOnboarding);
          setRentStartDate(nextRentDate);
          setTenant(nextTenant);
          setOwnerPayment(nextOwnerPayment);
        }
      } catch (error) {
        console.error("Tenant session verification failed:", error);

        if (error?.isAuthInvalid && mounted) {
          removeStorage(TOKEN_STORAGE_KEY);
          removeStorage(UNIT_STORAGE_KEY);
          removeStorage(PROFILE_STORAGE_KEY);
          clearAllTenantCaches(token);

          setDeviceToken(null);
          setUnitId(null);
          setTenant(null);
          setUnit(null);
          setProperty(null);
          setRentStartDate(null);
          setOnboardingCompleted(null);
          setOwnerPayment(null);
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

      const nextOnboarding = Boolean(completed);

      clearAllTenantCaches();
      writeStorage(TOKEN_STORAGE_KEY, cleanToken);
      writeStorage(UNIT_STORAGE_KEY, cleanUnitId);
      writeCachedProfile({
        onboardingCompleted: nextOnboarding,
        unit: unitData,
        property: propertyData,
        rentStartDate: rentDate,
        tenant: tenantData,
        ownerPayment: ownerPaymentData,
      });

      setDeviceToken(cleanToken);
      setUnitId(cleanUnitId);
      setOnboardingCompleted(nextOnboarding);
      setUnit(unitData);
      setProperty(propertyData);
      setRentStartDate(rentDate);
      setTenant(tenantData);
      setOwnerPayment(ownerPaymentData);
      setLoading(false);
    },
    []
  );

  const completeOnboarding = useCallback((tenantData) => {
    setTenant(tenantData);
    setOnboardingCompleted(true);

    const existing = readCachedProfile() ?? {};
    writeCachedProfile({
      ...existing,
      tenant: tenantData,
      onboardingCompleted: true,
    });
  }, []);

  const logout = useCallback(() => {
    const currentToken = readStorage(TOKEN_STORAGE_KEY);
    removeStorage(TOKEN_STORAGE_KEY);
    removeStorage(UNIT_STORAGE_KEY);
    removeStorage(PROFILE_STORAGE_KEY);
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