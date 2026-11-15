
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

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

  async function verifySession(token, storedUnitId) {
    const { data, error } = await supabase.functions.invoke(
      "verify-tenant-session",
      {
        body: { device_token: token },
      }
    );

    if (error) throw error;

    if (!data?.valid || data.unit_id !== storedUnitId) {
      throw new Error("Tenant session is invalid or expired.");
    }

    return data;
  }

  useEffect(() => {
    let mounted = true;

    async function verifyStoredSession() {
      const token = sessionStorage.getItem("nest-pay-tenant-token");
      const storedUnitId = sessionStorage.getItem("nest-pay-tenant-unit");

      if (!token || !storedUnitId) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const data = await verifySession(token, storedUnitId);
        

        if (mounted) {
          setDeviceToken(token);
          setUnitId(data.unit_id);
          setUnit(data.unit);
          setProperty(data.property);
          setOnboardingCompleted(data.onboarding_completed);
          setRentStartDate(data.rent_start_date ?? null);
          setTenant(data.tenant ?? null);
          setOwnerPayment(data.owner_payment ?? null);
        }
      } catch (error) {
        console.error("Tenant session verification failed:", error);

        sessionStorage.removeItem("nest-pay-tenant-token");
        sessionStorage.removeItem("nest-pay-tenant-unit");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    verifyStoredSession();

    return () => {
      mounted = false;
    };
  }, []);

  function login(
    token,
    id,
    completed = false,
    unitData = null,
    propertyData = null,
    rentDate = null,
    tenantData = null,
    ownerPaymentData = null
  ) {
    sessionStorage.setItem("nest-pay-tenant-token", token);
    sessionStorage.setItem("nest-pay-tenant-unit", id);

    setDeviceToken(token);
    setUnitId(id);
    setOnboardingCompleted(completed);
    setUnit(unitData);
    setProperty(propertyData);
    setRentStartDate(rentDate);
    setTenant(tenantData);
    setOwnerPayment(ownerPaymentData);
  }

  function completeOnboarding(tenantData) {
    setTenant(tenantData);
    setOnboardingCompleted(true);
  }

  function logout() {
    sessionStorage.removeItem("nest-pay-tenant-token");
    sessionStorage.removeItem("nest-pay-tenant-unit");

    setDeviceToken(null);
    setUnitId(null);
    setTenant(null);
    setUnit(null);
    setProperty(null);
    setRentStartDate(null);
    setOnboardingCompleted(null);
    setOwnerPayment(null);
  }

  return (
    <TenantContext.Provider
      value={{
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
      }}
    >
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
