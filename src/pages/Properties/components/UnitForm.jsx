
import {
  LuDoorClosed,
  LuLayers,
  LuIndianRupee,
  LuBedDouble,
  LuWallet,
  LuWrench,
  LuCalendarDays,
  LuSave,
  LuX,
} from "react-icons/lu";

import "../styles/UnitForm.css";

function UnitForm({
  unitName,
  setUnitName,
  floorNumber,
  setFloorNumber,
  monthlyRent,
  setMonthlyRent,
  bedrooms,
  setBedrooms,
  securityDeposit,
  setSecurityDeposit,
  maintenanceAmount,
  setMaintenanceAmount,
  rentDueDay,
  setRentDueDay,
  saving,
  error,
  onSubmit,
  onCancel,
    isEditing = false,
  initialError = "",
}) {
 
  return (
    <div className="unit-form-overlay">
      <header className="unit-form-overlay-header">
        <button
          type="button"
          className="unit-form-back"
          onClick={onCancel}
        >
          <LuX size={18} />
          Back to property
        </button>

        <span className="unit-form-brand">Nest Pay</span>
      </header>

      <form className="property-unit-form" onSubmit={onSubmit}>
        <div className="unit-form-heading">
          <div className="unit-form-heading-icon">
            <LuDoorClosed size={22} />
          </div>
          <div>
<h3>{isEditing ? "Edit Flat" : "Add Unit"}</h3>
<p>
  {isEditing
    ? "Update flat details and rent information."
    : "Enter flat details and rent information."}
</p>
          </div>
        </div>

       {(error || initialError) && (
  <p className="property-details-error" role="alert">
    {error || initialError}
  </p>
)}

        <div className="unit-form-field">
          <label htmlFor="unitName">
            <LuDoorClosed /> Flat number <span>*</span>
          </label>
          <input
            id="unitName"
            value={unitName}
            onChange={(event) => setUnitName(event.target.value)}
            placeholder="e.g. Flat 101"
            required
          />
        </div>

        <div className="unit-form-field">
          <label htmlFor="floorNumber">
            <LuLayers /> Floor number
          </label>
          <input
            id="floorNumber"
            type="number"
            value={floorNumber}
            onChange={(event) => setFloorNumber(event.target.value)}
            placeholder="e.g. 2"
          />
        </div>

        <div className="unit-form-field">
          <label htmlFor="monthlyRent">
            <LuIndianRupee /> Monthly rent <span>*</span>
          </label>
          <input
            id="monthlyRent"
            type="number"
            min="1"
            value={monthlyRent}
            onChange={(event) => setMonthlyRent(event.target.value)}
            placeholder="e.g. 12000"
            required
          />
        </div>

        <div className="unit-form-field">
          <label htmlFor="bedrooms">
            <LuBedDouble /> Bedrooms
          </label>
          <input
            id="bedrooms"
            type="number"
            min="0"
            value={bedrooms}
            onChange={(event) => setBedrooms(event.target.value)}
            placeholder="e.g. 2"
          />
        </div>

        <div className="unit-form-field">
          <label htmlFor="securityDeposit">
            <LuWallet /> Security deposit (₹)
          </label>
          <input
            id="securityDeposit"
            type="number"
            min="0"
            value={securityDeposit}
            onChange={(event) => setSecurityDeposit(event.target.value)}
            placeholder="e.g. 24000"
          />
        </div>

        <div className="unit-form-field">
          <label htmlFor="maintenanceAmount">
            <LuWrench /> Monthly maintenance (₹)
          </label>
          <input
            id="maintenanceAmount"
            type="number"
            min="0"
            value={maintenanceAmount}
            onChange={(event) => setMaintenanceAmount(event.target.value)}
            placeholder="e.g. 1000"
          />
        </div>

        <div className="unit-form-field">
          <label htmlFor="rentDueDay">
            <LuCalendarDays /> Rent due day <span>(1–28)</span>
          </label>
          <input
            id="rentDueDay"
            type="number"
            min="1"
            max="28"
            value={rentDueDay}
            onChange={(event) => setRentDueDay(event.target.value)}
            placeholder="e.g. 5"
          />
        </div>

        <div className="property-unit-form-actions">
          <button type="submit" disabled={saving}>
            <LuSave size={17} />
            {saving
  ? "Saving..."
  : isEditing
    ? "Save changes"
    : "Save unit"}
          </button>
        </div>
      </form>
    </div>
  );

}

export default UnitForm;
