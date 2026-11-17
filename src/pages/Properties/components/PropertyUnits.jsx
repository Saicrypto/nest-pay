
import UnitForm from "./UnitForm";
import UnitCard from "./UnitCard";
import "../styles/PropertyUnits.css";
import "../styles/UnitForm.css";
import { useState } from "react";

function PropertyUnits({
  units,
  unitName,
  setUnitName,
  floorNumber,
  setFloorNumber,
  bedrooms,
  setBedrooms,
  monthlyRent,
  setMonthlyRent,
  securityDeposit,
  setSecurityDeposit,
  maintenanceAmount,
  setMaintenanceAmount,
  rentDueDay,
  setRentDueDay,
  savingUnit,
  unitError,
  unitSuccess,
  showUnitForm,
  setShowUnitForm,
  tenantsByUnit,
  toastMessage,
  closeDuplicateToast,
  handleCreateUnit,
  occupancyConfirmation,
  setOccupancyConfirmation,
  deletingTenantUnitId,
  handleConfirmVacate,
  editingUnit,
  setEditingUnit,
  unitToDelete,
  setUnitToDelete,
  deletingUnitId,
  handleEditUnit,
  handleUpdateUnit,
  handleRequestDeleteUnit,
  handleConfirmDeleteUnit,
  editingUnitName,
  setEditingUnitName,
  editingFloorNumber,
  setEditingFloorNumber,
  editingBedrooms,
  setEditingBedrooms,
  editingSquareFeet,
  setEditingSquareFeet,
  editingMonthlyRent,
  setEditingMonthlyRent,
  editingSecurityDeposit,
  setEditingSecurityDeposit,
  editingMaintenanceAmount,
  setEditingMaintenanceAmount,
  editingRentDueDay,
  setEditingRentDueDay,
  handleOccupancyChange,
}) {
  const sortedUnits = [...units].sort((a, b) => {
    const nameA = a.unit_name.replace(/^flat\s*/i, "").trim();
    const nameB = b.unit_name.replace(/^flat\s*/i, "").trim();

    return nameA.localeCompare(nameB, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  const [unitFilter, setUnitFilter] = useState("all"); // "all" | "occupied" | "vacant"

const occupiedCount = sortedUnits.filter(
    (unit) => unit.occupancy_status === "occupied"
  ).length;
  const vacantCount = sortedUnits.length - occupiedCount;

  const filteredUnits = sortedUnits.filter((unit) => {
    const isOccupied = unit.occupancy_status === "occupied";
    if (unitFilter === "occupied") return isOccupied;
    if (unitFilter === "vacant") return !isOccupied;
    return true;
  });

  return (
    <section className="property-units-section">
     <div className="property-units-heading">
        <div className="property-units-title-group">
          <h2>Flats &amp; Tenants</h2>
          <p className="property-units-description">
            Manage your flats, tenants, and rent.
          </p>
        </div>

        <button
          type="button"
          className="toggle-unit-form"
          onClick={() => setShowUnitForm((current) => !current)}
        >
          {showUnitForm ? "− Cancel" : "+ Add Flat"}
        </button>
      </div>

      {/* Filter Tabs: All / Occupied / Vacant */}
      {units.length > 0 && (
        <div className="unit-filter-tabs" role="tablist" aria-label="Filter flats">
          <button
            type="button"
            role="tab"
            aria-selected={unitFilter === "all"}
            className={`unit-filter-pill ${unitFilter === "all" ? "active" : ""}`}
            onClick={() => setUnitFilter("all")}
          >
            All ({sortedUnits.length})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={unitFilter === "occupied"}
            className={`unit-filter-pill ${unitFilter === "occupied" ? "active" : ""}`}
            onClick={() => setUnitFilter("occupied")}
          >
            Occupied ({occupiedCount})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={unitFilter === "vacant"}
            className={`unit-filter-pill ${unitFilter === "vacant" ? "active" : ""}`}
            onClick={() => setUnitFilter("vacant")}
          >
            Vacant ({vacantCount})
          </button>
        </div>
      )}
      

      {unitError && (
        <p className="property-details-error" role="alert">
          {unitError}
        </p>
      )}

      {unitSuccess && (
        <p className="property-details-success" role="status">
          {unitSuccess}
        </p>
      )}

      {toastMessage && (
        <div className="duplicate-toast duplicate-toast-inline" role="alert">
          <div className="duplicate-toast-content">
            <strong>Flat already exists</strong>
            <p>{toastMessage}</p>
          </div>

          <button
            type="button"
            className="duplicate-toast-close"
            onClick={closeDuplicateToast}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      {showUnitForm && (
        <UnitForm
          unitName={unitName}
          setUnitName={setUnitName}
          floorNumber={floorNumber}
          setFloorNumber={setFloorNumber}
          monthlyRent={monthlyRent}
          setMonthlyRent={setMonthlyRent}
          bedrooms={bedrooms}
          setBedrooms={setBedrooms}
          squareFeet={squareFeet}
          setSquareFeet={setSquareFeet}
          securityDeposit={securityDeposit}
          setSecurityDeposit={setSecurityDeposit}
          maintenanceAmount={maintenanceAmount}
          setMaintenanceAmount={setMaintenanceAmount}
          rentDueDay={rentDueDay}
          setRentDueDay={setRentDueDay}
          saving={savingUnit}
          error=""
          onSubmit={handleCreateUnit}
          onCancel={() => setShowUnitForm(false)}
        />
      )}

      {editingUnit && (
        <UnitForm
          isEditing
          unitName={editingUnitName}
          setUnitName={setEditingUnitName}
          floorNumber={editingFloorNumber}
          setFloorNumber={setEditingFloorNumber}
          bedrooms={editingBedrooms}
          setBedrooms={setEditingBedrooms}
          squareFeet={editingSquareFeet}
          setSquareFeet={setEditingSquareFeet}
          monthlyRent={editingMonthlyRent}
          setMonthlyRent={setEditingMonthlyRent}
          securityDeposit={editingSecurityDeposit}
          setSecurityDeposit={setEditingSecurityDeposit}
          maintenanceAmount={editingMaintenanceAmount}
          setMaintenanceAmount={setEditingMaintenanceAmount}
          rentDueDay={editingRentDueDay}
          setRentDueDay={setEditingRentDueDay}
          saving={savingUnit}
          error={unitError}
          onSubmit={(event) =>
            handleUpdateUnit(event, editingUnit.id, {
              unitName: editingUnitName,
              floorNumber: editingFloorNumber,
              bedrooms: editingBedrooms,
              monthlyRent: editingMonthlyRent,
              securityDeposit: editingSecurityDeposit,
              maintenanceAmount: editingMaintenanceAmount,
              rentDueDay: editingRentDueDay,
              squareFeet: editingSquareFeet,
            })
          }
          onCancel={() => setEditingUnit(null)}
        />
      )}

      <div className="unit-list">
        {units.length === 0 ? (
          <p className="unit-empty-state">
            No units added yet. Use the form above to add your first unit.
          </p>
        ) : (
         <div className="unit-list-grid">
            {filteredUnits.length === 0 ? (
              <p className="unit-empty-state">
                No {unitFilter} flats found.
              </p>
            ) : (
              filteredUnits.map((unit) => (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  tenants={tenantsByUnit[unit.id] || []}
                  onEdit={handleEditUnit}
                  onDelete={handleRequestDeleteUnit}
                  onOccupancyChange={handleOccupancyChange}
                />
              ))
            )}
          </div>
        )}
      </div>

      {occupancyConfirmation && (
        <div className="vacate-modal-overlay">
          <div
            className="vacate-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vacate-modal-title"
          >
            <h3 id="vacate-modal-title">Vacate this flat?</h3>

            <p>
              This will permanently delete the tenant details and
              associated rent-payment records stored in Nest Pay.
              The flat will then be marked as vacant.
            </p>

            <p className="vacate-modal-warning">
              This action cannot be undone.
            </p>

            <div className="vacate-modal-actions">
              <button
                type="button"
                className="vacate-cancel-btn"
                disabled={deletingTenantUnitId !== null}
                onClick={() => setOccupancyConfirmation(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="vacate-proceed-btn"
                disabled={deletingTenantUnitId !== null}
                onClick={handleConfirmVacate}
              >
                {deletingTenantUnitId === occupancyConfirmation.unitId && (
                  <span className="vacate-spinner" aria-hidden="true" />
                )}

                {deletingTenantUnitId === occupancyConfirmation.unitId
                  ? "Deleting..."
                  : "Proceed"}
              </button>
            </div>
          </div>
        </div>
      )}

      {unitToDelete && (
        <div
          className="vacate-modal-overlay"
          onClick={() => {
            if (deletingUnitId === null) setUnitToDelete(null);
          }}
        >
          <div
            className="vacate-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-flat-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="delete-flat-title">Delete this flat?</h3>

            <p>
              You are about to delete <strong>{unitToDelete.unit_name}</strong>.
              Linked tenant details or rent-payment records may prevent
              deletion or be affected depending on your database rules.
            </p>

            <p className="vacate-modal-warning">
              Before proceeding, check unpaid rent, pending dues, security
              deposits, and any payment history you need to retain.
              This action may not be reversible.
            </p>

            <div className="vacate-modal-actions">
              <button
                type="button"
                className="vacate-cancel-btn"
                disabled={deletingUnitId !== null}
                onClick={() => setUnitToDelete(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="vacate-proceed-btn"
                disabled={deletingUnitId !== null}
                onClick={handleConfirmDeleteUnit}
              >
                {deletingUnitId === unitToDelete.id && (
                  <span className="vacate-spinner" aria-hidden="true" />
                )}

                {deletingUnitId === unitToDelete.id
                  ? "Deleting..."
                  : "Delete Flat"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default PropertyUnits;
