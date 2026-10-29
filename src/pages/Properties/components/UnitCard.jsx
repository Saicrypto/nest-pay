

import "../styles/UnitCard.css";
import {
  LuDoorClosed,
  LuDoorOpen,
  LuLayers,
  LuUserRound,
} from "react-icons/lu";
import StatusDropdown from "../../../components/property/StatusDropdown";
import { useState } from "react";
import { createPortal } from "react-dom";

function UnitCard({ unit, tenants, onOccupancyChange, onEdit, onDelete, onUpdateTenant, }) {
  

  const activeTenant = (tenants || []).find(
    (tenant) => tenant.tenant_status === "active"
  );
  const [showDetails, setShowDetails] = useState(false);
  
  const isOccupied = unit.occupancy_status === "occupied";

  function handleCardClick(event) {
    if (
      event.target.closest(
        "select, button, input, form, textarea, a, label"
      )
    ) {
      return;
    }
         setShowDetails((prev) => !prev);
  }

  return (
    <article
      className={`unit-card ${activeTenant ? "has-active-tenant" : ""}`}
      onClick={handleCardClick}
    >
      <div className="unit-card-main">
        <div className="unit-card-icon">
          {isOccupied ? (
            <LuDoorClosed size={23} color="#DD6013" />
          ) : (
            <LuDoorOpen size={23} color="#777D73" />
          )}
        </div>

        <div className="unit-card-heading">
          <h3>{unit.unit_name}</h3>
        </div>

        <StatusDropdown
          value={unit.occupancy_status}
          label={`Occupancy status for ${unit.unit_name}`}
          variant="occupancy"
          onChange={(status) => onOccupancyChange(unit.id, status)}
          options={[
            { value: "occupied", label: "Occupied" },
            { value: "vacant", label: "Vacant" },
          ]}
        />

        <div className="unit-card-details">
          <span className="unit-card-detail-item">
            <LuLayers size={14} color="#858B82" />
            <span>Floor {unit.floor_number ?? "—"}</span>
          </span>

          <span className="unit-card-separator">·</span>

          <span className="unit-card-detail-item">
            <LuUserRound size={14} color="#858B82" />
            <span>{activeTenant?.full_name || "Vacant"}</span>
          </span>
        </div>
      </div>

{showDetails && createPortal(
  <div
    className="unit-details-overlay"
    onClick={() => setShowDetails(false)}
  >
    <div
      className="unit-details-modal"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="unit-details-close"
        onClick={() => setShowDetails(false)}
        aria-label="Close flat details"
      >
        ×
      </button>

      <h2>{unit.unit_name}</h2>
      <p>Floor: {unit.floor_number ?? "—"}</p>
      <p>Bedrooms: {unit.bedrooms ?? "—"}</p>
      <p>Occupancy: {unit.occupancy_status}</p>
      <p>Monthly rent: ₹{unit.monthly_rent ?? "—"}</p>
      <p>Security deposit: ₹{unit.security_deposit ?? "—"}</p>
      <p>Maintenance: ₹{unit.maintenance_amount ?? "—"}</p>
      <p>Rent due day: {unit.rent_due_day ?? "—"}</p>

      {activeTenant && (
        <>
          <hr />
          <h3>Tenant details</h3>
          <p>Name: {activeTenant.full_name}</p>
          <p>Phone: {activeTenant.phone || "—"}</p>
          <p>Email: {activeTenant.email || "—"}</p>
          <p>Status: {activeTenant.tenant_status}</p>
        </>
      )}

      <div className="unit-details-actions">
  <button
    type="button"
      onClick={() => {
    setShowDetails(false);
    onEdit(unit);
  }}
  >
    Edit Flat
  </button>

  <button
    type="button"
    className="unit-delete-button"
    onClick={() => {
    setShowDetails(false);
    onDelete(unit);
  }}
  >
    Delete Flat
  </button>
</div>
    </div>
  </div>,
  document.body
)}

    </article>
  );
}

export default UnitCard;
