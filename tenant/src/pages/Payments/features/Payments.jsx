import { useMemo, useState } from "react";
import {
  LuWallet,
  LuCalendarDays,
  LuBuilding2,
  LuShieldCheck,
  LuCopy,
  LuCheck,
  LuExternalLink,
} from "react-icons/lu";
import { useTenant } from "../../../context/TenantContext";
import "../styles/Payments.css";

const appSchemes = {
  google_pay: "tez://upi/pay",
  phonepe: "phonepe://pay",
  paytm: "paytmmp://pay",
  any: "upi://pay",
};

const appLabels = {
  google_pay: "Google Pay",
  phonepe: "PhonePe",
  paytm: "Paytm",
  any: "UPI app",
};

function Payments() {
  const { unit, property, ownerPayment } = useTenant();
  const [copiedUpi, setCopiedUpi] = useState(false);

  const rentAmount = Number(unit?.monthly_rent || 0);
  const dueDay = unit?.rent_due_day;

  const paymentParams = useMemo(() => {
    if (!ownerPayment?.upi_id || !rentAmount || !property || !unit) {
      return "";
    }

    return new URLSearchParams({
      pa: ownerPayment.upi_id,
      pn: ownerPayment.full_name || "Property Owner",
      am: rentAmount.toFixed(2),
      cu: "INR",
      tn: `Rent - ${property.property_name}, ${unit.unit_name}`,
    }).toString();
  }, [ownerPayment, rentAmount, property, unit]);

const preferredApp =
  ownerPayment?.preferred_app || ownerPayment?.preferred_upi_app || "any";
const preferredAppLabel = appLabels[preferredApp] || "UPI app";

  function openPaymentApp(app = preferredApp) {
    if (!paymentParams) return;

    const scheme = appSchemes[app] || appSchemes.any;
    window.location.href = `${scheme}?${paymentParams}`;
  }

  function handleCopyUpi() {
    if (!ownerPayment?.upi_id) return;
    navigator.clipboard.writeText(ownerPayment.upi_id);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  }

  function formatOrdinal(dayVal) {
    const d = Number(dayVal);
    if (!d) return "Not specified";
    const mod10 = d % 10;
    const mod100 = d % 100;
    if (mod10 === 1 && mod100 !== 11) return `${d}st of every month`;
    if (mod10 === 2 && mod100 !== 12) return `${d}nd of every month`;
    if (mod10 === 3 && mod100 !== 13) return `${d}rd of every month`;
    return `${d}th of every month`;
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
              <LuWallet size={19} />
            </div>
            <span className="tenant-payment-status">Rent amount</span>
          </div>
        </div>

        <div className="tenant-payment-summary-divider" />

        <div className="tp-summary-rows">
          <div className="tenant-payment-summary-row">
            <span>
              <LuCalendarDays size={15} />
              Rent due day
            </span>
            <strong>{formatOrdinal(dueDay)}</strong>
          </div>

          <div className="tenant-payment-summary-row">
            <span>
              <LuBuilding2 size={15} />
              Your flat
            </span>
            <strong>
              {unit.unit_name} · {property.property_name}
            </strong>
          </div>

          {Number(unit.maintenance_amount || 0) > 0 && (
            <div className="tenant-payment-summary-row">
              <span>Monthly maintenance</span>
              <strong>{formatCurrency(unit.maintenance_amount)}</strong>
            </div>
          )}
        </div>
      </section>

      {/* Payment Destination & UPI Checkout Card */}
      <section className="tenant-payment-owner-card">
        <p className="tenant-payment-section-label">PAYMENT DESTINATION</p>

        {ownerPayment?.upi_id ? (
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
                  <strong>{ownerPayment.upi_id}</strong>
                  <button
                    type="button"
                    className="tp-copy-upi-btn"
                    onClick={handleCopyUpi}
                    aria-label="Copy UPI ID"
                  >
                    {copiedUpi ? (
                      <>
                        <LuCheck size={13} />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <LuCopy size={13} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="tp-detail-item">
                <span>Preferred app</span>
                <strong className="tp-preferred-pill">
                  {preferredAppLabel}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="tenant-pay-rent-button"
              onClick={() => openPaymentApp()}
              disabled={!paymentParams}
            >
              <span>
                Pay {formatCurrency(rentAmount)} using {preferredAppLabel}
              </span>
              <LuExternalLink size={16} />
            </button>

            {preferredApp !== "any" && (
              <button
                type="button"
                className="tenant-payment-fallback-button"
                onClick={() => openPaymentApp("any")}
              >
                Use another UPI app
              </button>
            )}

            <div className="tenant-payment-security-note">
              <LuShieldCheck size={18} />
              <p>
                Check the payee name and amount in your UPI app before approving
                the payment.
              </p>
            </div>
          </>
        ) : (
          <div className="tenant-payment-not-configured">
            <div className="tp-not-configured-icon">
              <LuWallet size={24} />
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
    </main>
  );
}

export default Payments;