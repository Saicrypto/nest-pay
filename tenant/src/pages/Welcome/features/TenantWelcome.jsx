
import { useNavigate } from "react-router-dom";
import { useTenant } from "../../../context/TenantContext";
import {
  LuHouse,
  LuBuilding2,
  LuLayers,
  LuBedDouble,
  LuIndianRupee,
  LuShieldCheck,
} from "react-icons/lu";

import "../styles/TenantWelcome.css";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function TenantWelcome() {
  const { property, unit, loading, isAuthenticated, onboardingCompleted } =
    useTenant();
  const navigate = useNavigate();

  if (loading) return <p>Loading your apartment details...</p>;

  if (!isAuthenticated) {
    navigate("/tenant/login", { replace: true });
    return null;
  }

  if (onboardingCompleted) {
    navigate("/tenant/home", { replace: true });
    return null;
  }

  if (!property || !unit) {
    return (
      <main className="tenant-welcome-page">
        <p>Unable to load your apartment details. Please log in again.</p>
        <button onClick={() => navigate("/tenant/login", { replace: true })}>
          Back to login
        </button>
      </main>
    );
  }

  const apartmentAddress = [
    property.address,
    property.city,
    property.state,
    property.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const details = [
    {
      label: "Apartment",
      value: property.property_name,
      Icon: LuHouse,
      tone: "green",
    },
    {
      label: "Flat",
      value: unit.unit_name,
      Icon: LuBuilding2,
      tone: "cream",
    },
    {
      label: "Floor",
      value: unit.floor_number ?? "—",
      Icon: LuLayers,
      tone: "green",
    },
    {
      label: "Bedrooms",
      value: unit.bedrooms ?? "—",
      Icon: LuBedDouble,
      tone: "cream",
    },
    {
      label: "Monthly rent",
      value: formatCurrency(unit.monthly_rent),
      Icon: LuIndianRupee,
      tone: "cream",
    },
    {
      label: "Security deposit",
      value: formatCurrency(unit.security_deposit),
      Icon: LuShieldCheck,
      tone: "green",
    },
  ];

  return (
    <main className="tenant-welcome-page">
      <header className="tenant-welcome-brand">
        <span className="tenant-welcome-brand-icon">N</span>
        <span className="tenant-welcome-brand-name">Nest Pay</span>
      </header>

      <section className="tenant-welcome-intro">
        <p className="tenant-welcome-eyebrow">YOUR NEW HOME</p>

        <h1>
          Welcome to <span>{property.property_name}</span>, {unit.unit_name}!
        </h1>

        <p className="tenant-welcome-message">
          We're glad to have you here! 🎉
          <br />
          Let's get you settled in. Review your apartment details and complete
          your tenant registration.
        </p>

        {apartmentAddress && (
          <p className="tenant-welcome-address">
            <LuHouse size={16} />
            {apartmentAddress}
          </p>
        )}
      </section>

      <section className="tenant-welcome-details">
        <div className="tenant-welcome-details-heading">
          <span className="tenant-welcome-heading-icon">
            <LuBuilding2 size={22} />
          </span>
          <h2>Apartment Details</h2>
        </div>

        <div className="tenant-welcome-details-grid">
          {details.map(({ label, value, Icon, tone }) => (
            <article className="tenant-welcome-detail" key={label}>
              <span className={`tenant-welcome-detail-icon ${tone}`}>
                <Icon size={23} />
              </span>

              <div className="tenant-welcome-detail-text">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <button
        type="button"
        className="tenant-welcome-continue"
        onClick={() => navigate("/tenant/details")}
      >
        Fill Tenant Details
        <span aria-hidden="true">→</span>
      </button>

      <p className="tenant-welcome-footer">
        Your information will be securely shared with your property owner.
      </p>
    </main>
  );
}

export default TenantWelcome;
