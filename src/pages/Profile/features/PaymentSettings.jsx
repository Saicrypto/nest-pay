
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LuArrowLeft,
  LuWallet,
  LuShieldCheck,
  LuSmartphone,
  LuChevronRight,
  LuLockKeyhole,
} from "react-icons/lu";
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
  const [editing, setEditing] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);

  function handleContinue(event) {
    event.preventDefault();

    if (!upiId.trim() || !upiId.includes("@")) {
      return;
    }

    // UI placeholder only. No payment details are saved.
    // Real OTP verification will be connected later.
    setVerificationPending(true);
  }

  function handleCancel() {
    setEditing(false);
    setVerificationPending(false);
    setUpiId("");
    setPreferredApp("any");
  }

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
          Manage where you receive rent from all your properties.
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

          {!editing && !verificationPending && (
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
                onClick={() => setEditing(true)}
              >
                Add payment method
                <LuChevronRight />
              </button>
            </div>
          )}

          {editing && !verificationPending && (
            <form
              className="payment-form"
              onSubmit={handleContinue}
            >
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
                <legend>Preferred UPI app</legend>
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
                      <span className="payment-app-icon">
                        {app.icon}
                      </span>
                      <span>{app.label}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="payment-notice">
                <LuShieldCheck />
                <p>
                  Your payment details will only be updated after
                  verification.
                </p>
              </div>

              <div className="payment-form-actions">
                <button
                  type="button"
                  className="payment-secondary-button"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="payment-primary-button"
                >
                  Continue
                  <LuChevronRight />
                </button>
              </div>
            </form>
          )}

          {verificationPending && (
            <div className="payment-verification-placeholder">
              <div className="payment-lock-icon">
                <LuLockKeyhole />
              </div>
              <h3>Verification will be available soon</h3>
              <p>
                Your UPI ID has not been saved. We'll connect
                phone OTP verification before enabling payment
                method changes.
              </p>
              <button
                type="button"
                className="payment-primary-button"
                onClick={() => setVerificationPending(false)}
              >
                Back to payment details
              </button>
              <button
                type="button"
                className="payment-text-button"
                onClick={handleCancel}
              >
                Cancel changes
              </button>
            </div>
          )}
        </section>

        <div className="payment-security-note">
          <LuShieldCheck />
          <div>
            <strong>Your security matters</strong>
            <p>
              Payment changes will require verification of your
              registered phone number.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default PaymentSettings;
