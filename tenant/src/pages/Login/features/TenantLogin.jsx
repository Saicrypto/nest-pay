import { useState } from "react";
import "../styles/TenantLogin.css";
import { supabase } from "../../../../src/lib/supabase";
import { useTenant } from "../../../context/TenantContext";
import { Navigate, useNavigate } from "react-router-dom";
import { clearServicesCache } from "../../Services/cache/servicesCache";

function TenantLogin() {
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const {
    login,
    loading: sessionLoading,
    isAuthenticated,
    onboardingCompleted,
  } = useTenant();
  const navigate = useNavigate();

  if (!sessionLoading && isAuthenticated) {
    return (
      <Navigate
        to={onboardingCompleted ? "/tenant/home" : "/tenant/welcome"}
        replace
      />
    );
  }

  function handleCodeChange(event) {
    const value = event.target.value.replace(/\D/g, "").slice(0, 6);
    setAccessCode(value);
    if (error) setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading || accessCode.length !== 6) return;

    setLoading(true);
    setError("");

    try {
      // Ensure no stale owner session or previous tenant cache remains on this device
      clearServicesCache();
      await supabase.auth.signOut({ scope: "local" }).catch(() => {});

      const { data, error: loginError } = await supabase.functions.invoke(
        "tenant-login",
        {
          body: {
            code: accessCode,
          },
        }
      );

      if (loginError) {
        let serverMessage = data?.error;
        if (!serverMessage && typeof loginError.context?.json === "function") {
          const errBody = await loginError.context.json().catch(() => null);
          serverMessage = errBody?.error;
        }
        throw new Error(serverMessage || "Invalid or expired access code.");
      }

      if (!data?.device_token || !data?.unit_id) {
        throw new Error(data?.error || "Invalid access code.");
      }

      login(
        data.device_token,
        data.unit_id,
        data.onboarding_completed,
        data.unit,
        data.property,
        data.rent_start_date,
        data.tenant ?? null,
        data.owner_payment ?? null
      );

      navigate(
        data.onboarding_completed ? "/tenant/home" : "/tenant/welcome",
        { replace: true }
      );
    } catch (err) {
      setError(err.message || "Unable to verify access code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="tenant-login-card">
      <div className="tenant-login-heading">
        <h1>Welcome home.</h1>
        <p>Enter the access code shared by your property owner.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="tenant-access-code">Flat access code</label>

        <input
          id="tenant-access-code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          placeholder="Enter 6-digit code"
          value={accessCode}
          onChange={handleCodeChange}
          maxLength={6}
          disabled={loading}
          required
        />

        {error && (
          <p className="tenant-login-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading || accessCode.length !== 6}>
          {loading ? "Verifying..." : "Continue"}
        </button>
      </form>

      <p className="tenant-login-help">
        Don&apos;t have a code? Contact your property owner.
      </p>
    </section>
  );
}

export default TenantLogin;