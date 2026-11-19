import "../styles/UnitCard.css";
import {
  LuDoorClosed,
  LuDoorOpen,
  LuLayers,
  LuBedDouble,
  LuMaximize2,
  LuIndianRupee,
} from "react-icons/lu";
import StatusDropdown from "../../../components/property/StatusDropdown";
import { useState } from "react";
import { createPortal } from "react-dom";

function UnitCard({
  unit,
  onOccupancyChange,
  onEdit,
  onDelete,
}) {
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
      className="unit-card"
      onClick={handleCardClick}
    >
      <div className="unit-card-main">
        <div className={`unit-card-icon ${isOccupied ? "occupied" : "vacant"}`}>
          {isOccupied ? (
            <LuDoorClosed size={22} />
          ) : (
            <LuDoorOpen size={22} />
          )}
        </div>

        <div className="unit-card-info">
          <div className="unit-card-heading">
            <h3>{unit.unit_name}</h3>
          </div>

          <div className="unit-card-details">
            <span className="unit-card-detail-item">
              <LuLayers size={13} />
              <span>Floor {unit.floor_number ?? "—"}</span>
            </span>

            {unit.bedrooms && (
              <span className="unit-card-detail-item">
                <LuBedDouble size={13} />
                <span>{unit.bedrooms} BHK</span>
              </span>
            )}

     {unit.square_feet != null &&
              unit.square_feet !== "" &&
              Number.isFinite(Number(unit.square_feet)) && (
                <span className="unit-card-detail-item">
                  <LuMaximize2 size={13} />
                  <span>
                    {Number(unit.square_feet).toLocaleString("en-IN")} sq. ft.
                  </span>
                </span>
              )}

            {unit.monthly_rent != null &&
              unit.monthly_rent !== "" &&
              Number.isFinite(Number(unit.monthly_rent)) && (
                <span className="unit-card-rent-pill">
                  <LuIndianRupee size={12} />
                  <span>
                    {Number(unit.monthly_rent).toLocaleString("en-IN")}/mo
                  </span>
                </span>
              )}
          </div>
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
      </div>

      {showDetails &&
        createPortal(
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
              <p>
                Area:{" "}
                {unit.square_feet != null && unit.square_feet !== ""
                  ? `${Number(unit.square_feet).toLocaleString("en-IN")} sq. ft.`
                  : "—"}
              </p>
              <p>Occupancy: {unit.occupancy_status}</p>
              <p>
                Monthly rent:{" "}
                {unit.monthly_rent != null && Number.isFinite(Number(unit.monthly_rent))
                  ? `₹${Number(unit.monthly_rent).toLocaleString("en-IN")}`
                  : "—"}
              </p>
              <p>
                Security deposit:{" "}
                {unit.security_deposit != null && Number.isFinite(Number(unit.security_deposit))
                  ? `₹${Number(unit.security_deposit).toLocaleString("en-IN")}`
                  : "—"}
              </p>
              <p>
                Maintenance:{" "}
                {unit.maintenance_amount != null && Number.isFinite(Number(unit.maintenance_amount))
                  ? `₹${Number(unit.maintenance_amount).toLocaleString("en-IN")}`
                  : "—"}
              </p>
              <p>Rent due day: {unit.rent_due_day ?? "—"}</p>

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