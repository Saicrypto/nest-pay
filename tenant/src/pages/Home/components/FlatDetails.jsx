
import { useNavigate } from "react-router-dom";
import { useTenant } from "../../../context/TenantContext";
import { LuArrowLeft, LuBuilding2 } from "react-icons/lu";
import "../styles/FlatDetails.css";

export default function FlatDetails() {
  const navigate = useNavigate();
  const { property, unit } = useTenant();

  const details = [
    ["Flat Number", unit?.unit_name],
    ["Floor", unit?.floor_number],
    ["Bedrooms", unit?.bedrooms],
    [
      "Monthly Rent",
      unit?.monthly_rent != null
        ? `₹${Number(unit.monthly_rent).toLocaleString("en-IN")}`
        : null,
    ],
    [
      "Security Deposit",
      unit?.security_deposit != null
        ? `₹${Number(unit.security_deposit).toLocaleString("en-IN")}`
        : null,
    ],
    [
      "Maintenance",
      unit?.maintenance_amount != null
        ? `₹${Number(unit.maintenance_amount).toLocaleString("en-IN")}`
        : null,
    ],
    ["Rent Due Day", unit?.rent_due_day],
  ];

  return (
    <main className="tenant-flat-details-page">
      <button
        type="button"
        className="tenant-flat-back"
        onClick={() => navigate("/tenant/profile", { replace: true })}
      >
        <LuArrowLeft /> Back to Profile
      </button>

      <header className="tenant-flat-header">
        <LuBuilding2 />
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
