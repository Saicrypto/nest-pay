import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LuArrowLeft,
  LuWallet,
  LuShieldCheck,
  LuSmartphone,
  LuChevronRight,
} from "react-icons/lu";
import { supabase } from "../../../lib/supabase";
import "../styles/PaymentSettings.css";

const paymentApps = [
  { id: "any", label: "Any UPI app", icon: "↗" },
  { id: "google_pay", label: "Google Pay", icon: "G" },
  { id: "phonepe", label: "PhonePe", icon: "P" },
  { id: "paytm", label: "Paytm", icon: "₹" },
];

function PaymentSettings() {
  const [upiId, setUpiId] = useState("");
  const [preferredApp, setPreferredApp] = useState("any");
  const [savedUpiId, setSavedUpiId] = useState("");
  const [savedApp, setSavedApp] = useState("any");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPaymentSettings() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) throw new Error("Please log in again.");

        const { data, error: settingsError } = await supabase
          .from("owner_payment_settings")
          .select("upi_id, preferred_app")
          .eq("owner_id", user.id)
          .maybeSingle();

        if (settingsError) throw settingsError;

        if (active) {
          const savedId = data?.upi_id || "";
          const savedPreferredApp = data?.preferred_app || "any";

          setUpiId(savedId);
          setPreferredApp(savedPreferredApp);
          setSavedUpiId(savedId);
          setSavedApp(savedPreferredApp);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load payment settings.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPaymentSettings();

    return () => {
      active = false;
    };
  }, []);

  async function handleSave(event) {
    event.preventDefault();

    const cleanUpiId = upiId.trim();

    if (cleanUpiId.length < 3) {
      setError("Please enter a valid UPI ID (at least 3 characters).");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Please log in again.");

      const { error: saveError } = await supabase
        .from("owner_payment_settings")
        .upsert(
          {
            owner_id: user.id,
            upi_id: cleanUpiId,
            preferred_app: preferredApp,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "owner_id" }
        );

      if (saveError) throw saveError;

      setSavedUpiId(cleanUpiId);
      setSavedApp(preferredApp);
      setUpiId(cleanUpiId);
      setEditing(false);
      setSuccess("UPI payment details saved successfully.");
    } catch (err) {
      setError(err.message || "Unable to save payment details.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setUpiId(savedUpiId);
    setPreferredApp(savedApp);
    setEditing(false);
    setError("");
  }

  const selectedAppLabel =
    paymentApps.find((app) => app.id === savedApp)?.label || "Any UPI app";

  return (
    <main className="payment-settings-page">
      <header className="payment-settings-header">
        <Link to="/home" className="payment-back-link">
          <LuArrowLeft />
          <span>Dashboard</span>
        </Link>

        <div className="payment-brand">
          <span className="payment-brand-icon">N</span>
          <span>Nest Pay</span>
        </div>
      </header>

      <section className="payment-settings-content">
        <p className="payment-eyebrow">OWNER SETTINGS</p>
        <h1>Payment method</h1>
        <p className="payment-intro">
          Manage where tenants send rent for your properties.
        </p>

        <section className="payment-method-card">
          <div className="payment-card-heading">
            <div className="payment-heading-icon">
              <LuWallet />
            </div>
            <div>
              <h2>Your UPI details</h2>
              <p>One payment method for all your properties</p>
            </div>
          </div>

          {loading ? (
            <p>Loading payment settings...</p>
          ) : !editing && savedUpiId ? (
            <div className="payment-empty-state">
              <div className="payment-empty-icon">
                <LuSmartphone />
              </div>
              <h3>{savedUpiId}</h3>
              <p>Preferred app: {selectedAppLabel}</p>

              <button
                type="button"
                className="payment-primary-button"
                onClick={() => {
                  setEditing(true);
                  setError("");
                  setSuccess("");
                }}
              >
                Edit payment method
                <LuChevronRight />
              </button>
            </div>
          ) : !editing ? (
            <div className="payment-empty-state">
              <div className="payment-empty-icon">
                <LuSmartphone />
              </div>
              <h3>No payment method added</h3>
              <p>
                Add your UPI ID so tenants can pay rent directly
                to your account.
              </p>
              <button
                type="button"
                className="payment-primary-button"
                onClick={() => {
                  setEditing(true);
                  setError("");
                }}
              >
                Add payment method
                <LuChevronRight />
              </button>
            </div>
          ) : (
            <form className="payment-form" onSubmit={handleSave}>
              <label htmlFor="upi-id">Your UPI ID</label>
              <input
                id="upi-id"
                type="text"
                value={upiId}
                onChange={(event) => setUpiId(event.target.value)}
                placeholder="yourname@bank"
                autoComplete="off"
                required
              />

              <p className="payment-field-hint">
                Enter the UPI ID where you want to receive rent.
              </p>

              <fieldset className="payment-app-fieldset">
                <legend>Preferred UPI app for tenants</legend>
                <div className="payment-app-grid">
                  {paymentApps.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      className={`payment-app-option ${
                        preferredApp === app.id ? "selected" : ""
                      }`}
                      onClick={() => setPreferredApp(app.id)}
                      aria-pressed={preferredApp === app.id}
                    >
                      <span className="payment-app-icon">{app.icon}</span>
                      <span>{app.label}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="payment-notice">
                <LuShieldCheck />
                <p>
                  Tenants will see these details when they open
                  the payment page for your property.
                </p>
              </div>

              <div className="payment-form-actions">
                <button
                  type="button"
                  className="payment-secondary-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="payment-primary-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save payment method"}
                  {!saving && <LuChevronRight />}
                </button>
              </div>
            </form>
          )}

          {error && <p className="tenants-error" role="alert">{error}</p>}
          {success && <p className="tenants-success" role="status">{success}</p>}
        </section>

        <div className="payment-security-note">
          <LuShieldCheck />
          <div>
            <strong>Your security matters</strong>
            <p>
              Your UPI ID is shared with tenants linked to your properties
              so they can initiate rent payments.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default PaymentSettings;