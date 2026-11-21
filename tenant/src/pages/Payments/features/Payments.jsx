import { useEffect, useMemo, useRef, useState } from "react";
import {
  LuWallet,
  LuCalendarDays,
  LuBuilding2,
  LuShieldCheck,
  LuCopy,
  LuCheck,
  LuExternalLink,
  LuX,
} from "react-icons/lu";
import { useTenant } from "../../../context/TenantContext";
import "../styles/Payments.css";
import { FEATURES } from "../../../../../src/config/features";

const UPI_APPS = {
  google_pay: {
    label: "Google Pay",
    iosScheme: "tez://upi/pay",
    androidPackage: "com.google.android.apps.nbu.paisa.user",
    badge: "G",
  },
  phonepe: {
    label: "PhonePe",
    iosScheme: "phonepe://pay",
    androidPackage: "com.phonepe.app",
    badge: "P",
  },
  paytm: {
    label: "Paytm",
    iosScheme: "paytmmp://pay",
    androidPackage: "net.one97.paytm",
    badge: "₹",
  },
  bhim: {
    label: "BHIM UPI",
    iosScheme: "bhim://upi/pay",
    androidPackage: "in.org.npci.upiapp",
    badge: "B",
  },
};

const appLabels = {
  google_pay: "Google Pay",
  phonepe: "PhonePe",
  paytm: "Paytm",
  bhim: "BHIM UPI",
  any: "UPI app",
};

const UPI_ID_REGEX = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/;

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatCurrency(amount) {
  const parsed = Number(amount);
  return inrFormatter.format(Number.isFinite(parsed) ? parsed : 0);
}

function formatOrdinal(dayVal) {
  const d = Number(dayVal);
  if (!Number.isInteger(d) || d < 1 || d > 31) return "Not specified";
  const mod10 = d % 10;
  const mod100 = d % 100;
  if (mod10 === 1 && mod100 !== 11) return `${d}st of every month`;
  if (mod10 === 2 && mod100 !== 12) return `${d}nd of every month`;
  if (mod10 === 3 && mod100 !== 13) return `${d}rd of every month`;
  return `${d}th of every month`;
}

function sanitizeUpiNote(text) {
  return String(text ?? "")
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 50);
}

function detectPlatform() {
  if (typeof navigator === "undefined") {
    return { isAndroid: false };
  }
  const ua = navigator.userAgent || "";
  const isAndroid = /Android/i.test(ua);
  return { isAndroid };
}

function Payments() {
  const { unit, property, ownerPayment } = useTenant();
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [showIosAppPicker, setShowIosAppPicker] = useState(false);
  const copyTimerRef = useRef(null);

  const { isAndroid } = useMemo(() => detectPlatform(), []);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const parsedRent = Number(unit?.monthly_rent);
  const rentAmount =
    Number.isFinite(parsedRent) && parsedRent > 0 ? parsedRent : 0;
  const dueDay = unit?.rent_due_day;
  const cleanUpiId = String(ownerPayment?.upi_id ?? "").trim();
  const isValidUpi = UPI_ID_REGEX.test(cleanUpiId);

  const paymentParams = useMemo(() => {
    if (!isValidUpi || rentAmount <= 0 || !property || !unit) {
      return "";
    }

    const payeeName =
      String(ownerPayment?.full_name ?? "Property Owner")
        .trim()
        .slice(0, 60) || "Property Owner";

    const note =
      sanitizeUpiNote(`Rent ${property.property_name || ""} ${unit.unit_name || ""}`) ||
      "Monthly Rent";

    return new URLSearchParams({
      pa: cleanUpiId,
      pn: payeeName,
      am: rentAmount.toFixed(2),
      cu: "INR",
      tn: note,
    }).toString();
  }, [isValidUpi, cleanUpiId, ownerPayment?.full_name, rentAmount, property, unit]);

  const preferredApp =
    ownerPayment?.preferred_app || ownerPayment?.preferred_upi_app || "any";
  const preferredAppLabel = appLabels[preferredApp] || "UPI app";

  function openPaymentApp(app = preferredApp) {
    if (!paymentParams) return;

    // On iOS / non-Android, never trigger bare "upi://pay" (which opens WhatsApp).
    // Show our custom UPI app chooser sheet instead.
    if (app === "any" && !isAndroid) {
      setShowIosAppPicker(true);
      return;
    }

    setShowIosAppPicker(false);

    const targetApp = UPI_APPS[app];
    if (targetApp) {
      if (isAndroid) {
        window.location.href = `intent://pay?${paymentParams}#Intent;scheme=upi;package=${targetApp.androidPackage};end`;
        return;
      }
      window.location.href = `${targetApp.iosScheme}?${paymentParams}`;
      return;
    }

    // Android native UPI chooser when app === "any"
    window.location.href = `upi://pay?${paymentParams}`;
  }

  async function handleCopyUpi() {
    if (!cleanUpiId) return;
    setCopyError("");

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }
      await navigator.clipboard.writeText(cleanUpiId);
      setCopiedUpi(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedUpi(false), 2000);
    } catch {
      setCopyError("Unable to copy automatically. Please copy the UPI ID manually.");
    }
  }

  if (!unit || !property) {
    return (
      <main className="tenant-payments-page">
        <header className="tenant-payments-header">
          <h1>Payments</h1>
          <p>Manage your rent payments</p>
        </header>
        <div className="tp-empty-state">
          <p>Unable to load your rent details. Please reopen the app.</p>
        </div>
      </main>
    );
  }

  const parsedMaintenance = Number(unit.maintenance_amount);
  const hasMaintenance =
    Number.isFinite(parsedMaintenance) && parsedMaintenance > 0;

  return (
    <main className="tenant-payments-page">
      {/* Full-Bleed Top Curved Burnt-Orange Hero Header */}
      <header className="tenant-payments-header">
        <h1>Payments</h1>
        <p>Manage your rent payments</p>
      </header>

      {/* Overlapping Elevated Monthly Rent Summary Card */}
      <section className="tenant-payment-summary">
        <div className="tp-summary-top">
          <div>
            <p className="tenant-payment-eyebrow">MONTHLY RENT</p>
            <h2>{formatCurrency(rentAmount)}</h2>
          </div>

          <div className="tp-summary-right">
            <div className="tenant-payment-summary-icon">
              <LuWallet size={19} aria-hidden="true" />
            </div>
            <span className="tenant-payment-status">Rent amount</span>
          </div>
        </div>

        <div className="tenant-payment-summary-divider" />

        <div className="tp-summary-rows">
          <div className="tenant-payment-summary-row">
            <span>
              <LuCalendarDays size={15} aria-hidden="true" />
              Rent due day
            </span>
            <strong>{formatOrdinal(dueDay)}</strong>
          </div>

          <div className="tenant-payment-summary-row">
            <span>
              <LuBuilding2 size={15} aria-hidden="true" />
              Your flat
            </span>
            <strong>
              {unit.unit_name || "Flat"} · {property.property_name || "Property"}
            </strong>
          </div>

          {hasMaintenance && (
            <div className="tenant-payment-summary-row">
              <span>Monthly maintenance</span>
              <strong>{formatCurrency(parsedMaintenance)}</strong>
            </div>
          )}
        </div>
      </section>

      {/* Payment Destination & UPI Checkout Card */}
      <section className="tenant-payment-owner-card">
        <p className="tenant-payment-section-label">PAYMENT DESTINATION</p>

        {cleanUpiId ? (
          <>
            <div className="tenant-payment-owner-details">
              <div className="tp-detail-item">
                <span>Paying to</span>
                <strong>
                  {ownerPayment.full_name || "Property Owner"}
                </strong>
              </div>

              <div className="tp-detail-item">
                <span>UPI ID</span>
                <div className="tp-upi-copy-wrap">
                  <strong>{cleanUpiId}</strong>
                  <button
                    type="button"
                    className="tp-copy-upi-btn"
                    onClick={handleCopyUpi}
                    aria-label="Copy UPI ID"
                  >
                    {copiedUpi ? (
                      <>
                        <LuCheck size={13} aria-hidden="true" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <LuCopy size={13} aria-hidden="true" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {copyError && (
                <p className="tenant-payment-copy-error" role="alert">
                  {copyError}
                </p>
              )}

              <div className="tp-detail-item">
                <span>Preferred app</span>
                <strong className="tp-preferred-pill">
                  {preferredAppLabel}
                </strong>
              </div>
            </div>

           {FEATURES.TENANT_PAYMENTS_ENABLED && (
  <button
    type="button"
    className="tenant-pay-rent-button"
    onClick={() => openPaymentApp()}
    disabled={!paymentParams}
  >
    <span>
      Pay {formatCurrency(rentAmount)} using {preferredAppLabel}
    </span>
    <LuExternalLink size={16} aria-hidden="true" />
  </button>
)}

            {preferredApp !== "any" && paymentParams && (
              <button
                type="button"
                className="tenant-payment-fallback-button"
                onClick={() => openPaymentApp("any")}
              >
                Use another UPI app
              </button>
            )}

            <div className="tenant-payment-security-note">
              <LuShieldCheck size={18} aria-hidden="true" />
              <p>
                Check the payee name and amount in your UPI app before approving
                the payment.
              </p>
            </div>
          </>
        ) : (
          <div className="tenant-payment-not-configured">
            <div className="tp-not-configured-icon">
              <LuWallet size={24} aria-hidden="true" />
            </div>
            <h3>UPI payment not available yet</h3>
            <p>
              Your property owner hasn't added UPI payment details. Please
              contact your owner.
            </p>
          </div>
        )}
      </section>

      <p className="tenant-payment-disclaimer">
        After completing payment, keep your UPI transaction reference for your
        records. Opening a UPI app does not automatically update your rent
        payment status in Nest Pay.
      </p>

      {/* iOS UPI App Chooser Modal */}
      {showIosAppPicker && (
        <div
          className="tp-upi-picker-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tp-upi-picker-title"
          onClick={() => setShowIosAppPicker(false)}
        >
          <div
            className="tp-upi-picker-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tp-upi-picker-header">
              <h3 id="tp-upi-picker-title">Choose UPI app</h3>
              <button
                type="button"
                className="tp-upi-picker-close"
                onClick={() => setShowIosAppPicker(false)}
                aria-label="Close"
              >
                <LuX size={18} aria-hidden="true" />
              </button>
            </div>

            <p className="tp-upi-picker-subtitle">
              Select an installed app to pay {formatCurrency(rentAmount)}
            </p>

            <div className="tp-upi-picker-list">
              {Object.entries(UPI_APPS).map(([appKey, appInfo]) => (
                <button
                  key={appKey}
                  type="button"
                  className="tp-upi-picker-option"
                  onClick={() => openPaymentApp(appKey)}
                >
                  <span className="tp-upi-picker-badge">{appInfo.badge}</span>
                  <span className="tp-upi-picker-name">{appInfo.label}</span>
                  <LuExternalLink size={15} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Payments;