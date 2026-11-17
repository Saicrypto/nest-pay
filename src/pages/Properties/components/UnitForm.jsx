
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
  LuCheck,
  LuMaximize2,
} from "react-icons/lu";
import { useState } from "react";
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
  squareFeet,
  setSquareFeet,
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
 
const filledCount = [
    String(unitName || "").trim(),
    String(floorNumber ?? "").trim(),
    String(monthlyRent || "").trim(),
    String(bedrooms ?? "").trim(),
    String(securityDeposit ?? "").trim(),
    String(maintenanceAmount ?? "").trim(),
    String(rentDueDay ?? "").trim(),
    String(squareFeet ?? "").trim(),
  ].filter(Boolean).length;
  const completionPct = Math.round((filledCount / 8) * 100);

  const isReady = Boolean(
    String(unitName || "").trim() && Number(monthlyRent) > 0
  );

  function formatOrdinal(dayVal) {
    const d = Number(dayVal);
    if (!d || d < 1 || d > 28) return "5th";
    const mod10 = d % 10;
    const mod100 = d % 100;
    if (mod10 === 1 && mod100 !== 11) return `${d}st`;
    if (mod10 === 2 && mod100 !== 12) return `${d}nd`;
    if (mod10 === 3 && mod100 !== 13) return `${d}rd`;
    return `${d}th`;
  }

  const bhkText =
    bedrooms === "" || bedrooms === null || bedrooms === undefined
      ? "2 BHK"
      : Number(bedrooms) === 0
      ? "Studio"
      : Number(bedrooms) >= 4
      ? "4+ BHK"
      : `${bedrooms} BHK`;

  return (
<div className="unit-form-overlay">
      {/* Sticky Light-Canvas Editorial Top Bar */}
      <header className="uf-topbar">
        <button
          type="button"
          className="uf-close-btn"
          onClick={onCancel}
          aria-label="Back to property"
        >
          <LuX size={18} />
        </button>

        <div className="uf-title-group">
          <span className="uf-eyebrow">
            {isEditing ? "EDIT FLAT" : "NEW FLAT"}
          </span>
          <h2>{isEditing ? "Edit Flat" : "Add Flat"}</h2>
        </div>

        <div className="uf-progress-pill">
          <span className="uf-progress-dot" />
          <span>{completionPct}%</span>
        </div>

        <div className="uf-progress-track">
          <div
            className="uf-progress-fill"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </header>

      <p className="uf-subtitle">
        {isEditing
          ? "Update flat details and rent information."
          : "Enter flat details and rent information."}
      </p>

      {/* Live Flat Preview Ticket */}
      <div className="uf-preview-ticket">
        <div className="uf-preview-top">
          <div className="uf-preview-icon-box">
            <LuDoorClosed size={23} />
          </div>

          <div className="uf-preview-meta">
            <span className="uf-preview-kicker">LIVE FLAT PREVIEW</span>
            <h3 className={String(unitName || "").trim() ? "filled" : ""}>
              {String(unitName || "").trim() || "Flat 101"}
            </h3>
            <p>
              Floor {String(floorNumber ?? "").trim() || "2"} • {bhkText}
            </p>
          </div>

          <span className={`uf-status-badge ${isReady ? "ready" : ""}`}>
            {isReady ? "Ready to save" : "Drafting"}
          </span>
        </div>

        <div className="uf-preview-divider" />

        <div className="uf-preview-bottom">
          <div className="uf-preview-rent">
            <strong>
              ₹{Number(monthlyRent) > 0 ? Number(monthlyRent).toLocaleString("en-IN") : "12,000"}
            </strong>
            <span>/mo</span>
            {Number(maintenanceAmount) > 0 && (
              <small>
                + ₹{Number(maintenanceAmount).toLocaleString("en-IN")} maint.
              </small>
            )}
          </div>

          <span className="uf-preview-due-pill">
            Due {formatOrdinal(rentDueDay)}
          </span>
        </div>
      </div>

      <form
        id="unit-details-form"
        className="property-unit-form"
        onSubmit={onSubmit}
      >
        {(error || initialError) && (
          <p className="property-details-error" role="alert">
            {error || initialError}
          </p>
        )}


        {/* Card 1: FLAT DETAILS */}
<div className="uf-section-card">
  <div className="uf-section-header">
    <h3>FLAT DETAILS</h3>
    <span>Required</span>
  </div>

  <div className="uf-row-2col">
    <div className="unit-form-field">
      <label htmlFor="unitName">
        <LuDoorClosed size={14} /> Flat number <span>*</span>
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
        <LuLayers size={14} /> Floor
      </label>
      <input
        id="floorNumber"
        type="number"
        value={floorNumber}
        onChange={(event) => setFloorNumber(event.target.value)}
        placeholder="e.g. 2"
      />
    </div>
  </div>

  {/* Square Feet (sq. ft.) */}
  <div className="unit-form-field">
    <label htmlFor="squareFeet">
      <LuMaximize2 size={14} /> Area <span>(sq. ft.)</span>
    </label>
    <input
      id="squareFeet"
      type="number"
      inputMode="numeric"
      min="0"
      value={squareFeet}
      onChange={(event) => setSquareFeet(event.target.value)}
      placeholder="e.g. 1150"
    />
  </div>

  {/* 5-Option Visual Configuration (BHK) Selector */}
  <div className="unit-form-field">
    <label>
      <LuBedDouble size={14} /> Configuration (BHK)
    </label>

    <div className="uf-bhk-grid">
      {[
        { val: "0", label: "Studio" },
        { val: "1", label: "1 BHK" },
        { val: "2", label: "2 BHK" },
        { val: "3", label: "3 BHK" },
        { val: "4", label: "4+ BHK" },
      ].map((opt) => (
        <button
          key={opt.val}
          type="button"
          className={`uf-bhk-pill ${
            String(bedrooms) === opt.val ? "selected" : ""
          }`}
          onClick={() => setBedrooms(opt.val)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
</div>

        {/* Card 2: RENT & BILLING */}
        <div className="uf-section-card">
          <div className="uf-section-header">
            <h3>RENT &amp; BILLING</h3>
            <span>Monthly</span>
          </div>

          <div className="unit-form-field">
            <div className="uf-label-with-chips">
              <label htmlFor="monthlyRent">
                <LuIndianRupee size={14} /> Monthly rent <span>*</span>
              </label>

              <div className="uf-quick-chips">
                {["12000", "18000", "25000"].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={`uf-chip-btn ${
                      String(monthlyRent) === amt ? "active" : ""
                    }`}
                    onClick={() => setMonthlyRent(amt)}
                  >
                    ₹{Number(amt) / 1000}k
                  </button>
                ))}
              </div>
            </div>

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

          <div className="uf-row-2col">
            <div className="unit-form-field">
              <div className="uf-label-with-chips">
                <label htmlFor="securityDeposit">
                  <LuWallet size={14} /> Deposit (₹)
                </label>

                {Number(monthlyRent) > 0 && (
                  <button
                    type="button"
                    className="uf-chip-btn"
                    onClick={() =>
                      setSecurityDeposit(String(Number(monthlyRent) * 2))
                    }
                  >
                    2× Rent
                  </button>
                )}
              </div>

              <input
                id="securityDeposit"
                type="number"
                min="0"
                value={securityDeposit}
                onChange={(event) => setSecurityDeposit(event.target.value)}
                placeholder="24000"
              />
            </div>

            <div className="unit-form-field">
              <label htmlFor="maintenanceAmount">
                <LuWrench size={14} /> Maintenance (₹)
              </label>
              <input
                id="maintenanceAmount"
                type="number"
                min="0"
                value={maintenanceAmount}
                onChange={(event) => setMaintenanceAmount(event.target.value)}
                placeholder="1000"
              />
            </div>
          </div>

          <div className="unit-form-field">
            <label htmlFor="rentDueDay">
              <LuCalendarDays size={14} /> Rent due day <span>(1–28)</span>
            </label>

            <div className="uf-due-row">
              <div className="uf-due-pills">
                {[
                  { val: "1", label: "1st" },
                  { val: "5", label: "5th" },
                  { val: "10", label: "10th" },
                  { val: "15", label: "15th" },
                ].map((d) => (
                  <button
                    key={d.val}
                    type="button"
                    className={`uf-due-pill ${
                      String(rentDueDay) === d.val ? "selected" : ""
                    }`}
                    onClick={() => setRentDueDay(d.val)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              <input
                id="rentDueDay"
                className="uf-due-custom-input"
                type="number"
                min="1"
                max="28"
                value={rentDueDay}
                onChange={(event) => setRentDueDay(event.target.value)}
                placeholder="Day"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Sticky Bottom Action Footer */}
      <div className="uf-footer-bar">
        <button
          type="button"
          className="uf-cancel-btn"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>

        <button
          type="submit"
          form="unit-details-form"
          className="uf-save-btn"
          disabled={saving}
        >
          <span>
            {saving
              ? "Saving..."
              : isEditing
              ? "Save Changes"
              : "Save Flat"}
          </span>
          {!saving && <LuCheck size={17} />}
        </button>
      </div>
    </div>
  );

}

export default UnitForm;
