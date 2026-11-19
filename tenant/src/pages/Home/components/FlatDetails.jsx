import { Navigate, useNavigate } from "react-router-dom";
import { useTenant } from "../../../context/TenantContext";
import { LuArrowLeft, LuBuilding2 } from "react-icons/lu";
import "../styles/FlatDetails.css";

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? inrFormatter.format(parsed) : null;
}

function formatOrdinal(dayVal) {
  if (dayVal === null || dayVal === undefined || dayVal === "") return null;
  const d = Number(dayVal);
  if (!Number.isInteger(d) || d < 1 || d > 31) return null;
  const mod10 = d % 10;
  const mod100 = d % 100;
  if (mod10 === 1 && mod100 !== 11) return `${d}st of every month`;
  if (mod10 === 2 && mod100 !== 12) return `${d}nd of every month`;
  if (mod10 === 3 && mod100 !== 13) return `${d}rd of every month`;
  return `${d}th of every month`;
}

export default function FlatDetails() {
  const navigate = useNavigate();
  const { property, unit, loading, isAuthenticated } = useTenant();

  if (loading) {
    return (
      <main className="tenant-flat-details-page">
        <p>Loading your flat details...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/tenant/login" replace />;
  }

  const propertyAddress = [
    property?.address,
    property?.city,
    property?.state,
    property?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const details = [
    ["Flat Number", unit?.unit_name],
    ["Floor", unit?.floor_number],
    ["Bedrooms", unit?.bedrooms],
    ["Monthly Rent", formatCurrency(unit?.monthly_rent)],
    ["Security Deposit", formatCurrency(unit?.security_deposit)],
    ["Maintenance", formatCurrency(unit?.maintenance_amount)],
    ["Rent Due Day", formatOrdinal(unit?.rent_due_day)],
    ...(propertyAddress ? [["Address", propertyAddress]] : []),
  ];

  return (
    <main className="tenant-flat-details-page">
      <button
        type="button"
        className="tenant-flat-back"
        onClick={() => navigate("/tenant/profile", { replace: true })}
      >
        <LuArrowLeft aria-hidden="true" /> Back to Profile
      </button>

      <header className="tenant-flat-header">
        <LuBuilding2 aria-hidden="true" />
        <div>
          <h1>Flat Details</h1>
          <p>{property?.property_name || "Your Property"}</p>
        </div>
      </header>

      <section className="tenant-flat-details-card">
        <h2>{unit?.unit_name || "Your Flat"}</h2>

        {details.map(([label, value]) => (
          <div className="tenant-flat-detail-row" key={label}>
            <span>{label}</span>
            <strong>
              {value !== null && value !== undefined && value !== ""
                ? value
                : "Not available"}
            </strong>
          </div>
        ))}
      </section>
    </main>
  );
}