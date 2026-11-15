
import { useState } from "react";
import "../styles/TenantLogin.css";
import { supabase } from "../../../../src/lib/supabase";
import { useTenant } from "../../../context/TenantContext";
import { useNavigate } from "react-router-dom";

function TenantLogin() {
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const { login } = useTenant();
const navigate = useNavigate();

  function handleCodeChange(event) {
    const value = event.target.value.replace(/\D/g, "").slice(0, 6);
    setAccessCode(value);
  }

 async function handleSubmit(event) {
  event.preventDefault();

  if (accessCode.length !== 6) return;

  setLoading(true);
  setError("");

  try {
    const { data, error: loginError } =
      await supabase.functions.invoke("tenant-login", {
        body: {
          code: accessCode,
        },
      });

    if (loginError) throw loginError;

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
          autoComplete="one-time-code"
          placeholder="Enter 6-digit code"
          value={accessCode}
          onChange={handleCodeChange}
          maxLength={6}
          required
        />
{error && <p className="tenant-login-error">{error}</p>}
        <button type="submit" disabled={loading || accessCode.length !== 6}>
  {loading ? "Verifying..." : "Continue"}
</button>
      </form>

      <p className="tenant-login-help">
        Don't have a code? Contact your property owner.
      </p>
    </section>
  );
}

export default TenantLogin;
