import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropertyService from "../../../services/PropertyService";
import "../styles/Properties.css";
import {
  LuArrowLeft,
  LuHouse,
  LuBuilding2,
  LuBuilding,
  LuAlignLeft,
  LuCheck,
  LuMapPin,
  LuMap,
  LuHash,
  LuLayers,
} from "react-icons/lu";
import { clearPropertiesCache } from "../cache/propertiesCache";
import { clearTenantsCache } from "../../Tenants/cache/tenantsCache";
import { clearHomeCache } from "../../Home/cache/homeCache";
import { clearPropertyDetailsCache } from "../cache/propertyDetailsCache";

function AddProperty() {
  const navigate = useNavigate();

  const [propertyName, setPropertyName] = useState("");
  const [propertyType, setPropertyType] = useState("individual_house");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Telangana");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      await PropertyService.createProperty({
        propertyName,
        propertyType,
        address,
        city,
        state,
        pincode,
        totalUnits: 1, // Satisfies DB not-null & >= 1 constraint; actual count is tracked dynamically from added flats
      });

      clearPropertiesCache();
      clearHomeCache();
      clearPropertyDetailsCache();
      clearTenantsCache();

      navigate("/properties", {
        state: { propertyAdded: true },
      });
    } catch (err) {
      setError(err.message || "Unable to save property.");
    } finally {
      setLoading(false);
    }
  }

  const filledCount = [
    propertyName.trim(),
    address.trim(),
    city.trim(),
    state.trim(),
    pincode.trim(),
  ].filter(Boolean).length;
  const completionPct = Math.round((filledCount / 5) * 100);
  const isReady = Boolean(propertyName.trim() && city.trim() && state.trim());
  const locationPreview =
    [city.trim(), state.trim()].filter(Boolean).join(", ") || "Hyderabad, Telangana";
  const typeLabels = {
    individual_house: "Individual house",
    apartment: "Apartment",
    building: "Building",
    commercial: "Commercial",
  };

  return (
    <main className="properties-page">
      <header className="properties-header">
        <Link to="/properties" className="properties-back">
          <LuArrowLeft />
          Your Properties
        </Link>

        <span className="properties-brand">Nest Pay</span>
      </header>

      <div className="property-form-card">
        {/* Sticky Top Bar */}
        <div className="property-form-topbar">
          <button
            type="button"
            className="property-form-back"
            onClick={() => navigate(-1)}
          >
            <LuArrowLeft size={18} />
          </button>

          <div className="ap-title-group">
            <span className="ap-eyebrow">NEW LISTING</span>
            <h2>Add Property</h2>
          </div>

          <div className="ap-progress-pill">
            <span className="ap-progress-dot" />
            <span>{completionPct}%</span>
          </div>

          <div className="ap-progress-track">
            <div className="ap-progress-fill" style={{ width: `${completionPct}%` }} />
          </div>
        </div>

        <p className="property-form-subtitle">
          Enter the details of the property you manage.
        </p>

        {/* Live Card Preview Ticket */}
        <div className="ap-preview-ticket">
          <div className="ap-preview-top">
            <div className="ap-preview-icon-box">
              <LuBuilding2 size={24} />
            </div>

            <div className="ap-preview-meta">
              <span className="ap-preview-kicker">LIVE CARD PREVIEW</span>
              <h3 className={propertyName.trim() ? "filled" : ""}>
                {propertyName.trim() || "Lakshmi Apartments"}
              </h3>
              <p>{locationPreview}</p>
            </div>

            <span className={`ap-status-badge ${isReady ? "ready" : ""}`}>
              {isReady ? "Ready to save" : "Drafting"}
            </span>
          </div>

          <div className="ap-preview-divider" />

          <div className="ap-preview-bottom">
            <span className="ap-preview-type">
              <LuHouse size={14} />
              <span>{typeLabels[propertyType] || "Individual house"}</span>
            </span>

            <span className="ap-preview-units">Add flats after saving</span>
          </div>
        </div>

        <form id="add-property-form" onSubmit={handleSubmit}>
          {error && (
            <p className="property-error" role="alert">
              {error}
            </p>
          )}

          {/* Card 1: PROPERTY IDENTITY */}
          <div className="ap-section-card">
            <div className="ap-section-header">
              <h3>PROPERTY IDENTITY</h3>
              <span>Required</span>
            </div>

            <div className="ap-field-group">
              <label htmlFor="propertyName">
                <LuBuilding2 size={14} />
                Property name
              </label>
              <input
                id="propertyName"
                value={propertyName}
                onChange={(event) => setPropertyName(event.target.value)}
                placeholder="e.g. Lakshmi Apartments"
                required
              />
            </div>

            <div className="ap-field-group">
              <label>
                <LuAlignLeft size={14} />
                Property type
              </label>

              <div className="ap-type-grid" role="radiogroup" aria-label="Property type">
                {[
                  { value: "individual_house", label: "Individual house", icon: LuHouse },
                  { value: "apartment", label: "Apartment", icon: LuBuilding2 },
                  { value: "building", label: "Building", icon: LuBuilding },
                  { value: "commercial", label: "Commercial", icon: LuBuilding2 },
                ].map(({ value, label, icon: Icon }) => {
                  const selected = propertyType === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={`ap-type-tile ${selected ? "selected" : ""}`}
                      onClick={() => setPropertyType(value)}
                    >
                      <span className="ap-type-icon-wrap">
                        <Icon size={17} strokeWidth={2.1} />
                      </span>
                      <span className="ap-type-label">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 2: ADDRESS & LOCALITY */}
          <div className="ap-section-card">
            <div className="ap-section-header">
              <h3>ADDRESS &amp; LOCALITY</h3>
              <span>Location</span>
            </div>

            <div className="ap-field-group">
              <label htmlFor="address">
                <LuMapPin size={14} />
                Street, area or locality
              </label>
              <input
                id="address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="e.g. Krishna Nagar, Yousufguda"
              />
            </div>

            <div className="property-form-row">
              <div className="ap-field-group">
                <label htmlFor="city">
                  <LuMap size={14} />
                  City
                </label>
                <input
                  id="city"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="Hyderabad"
                />
              </div>

              <div className="ap-field-group">
                <label htmlFor="state">
                  <LuLayers size={14} />
                  State
                </label>
                <input
                  id="state"
                  value={state}
                  onChange={(event) => setState(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="ap-field-group">
              <label htmlFor="pincode">
                <LuHash size={14} />
                PIN code
              </label>
              <input
                id="pincode"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={pincode}
                onChange={(event) => setPincode(event.target.value)}
                placeholder="500045"
              />
            </div>
          </div>
        </form>

        {/* Sticky Bottom Action Bar */}
        <div className="ap-footer-bar">
          <button
            type="button"
            className="ap-cancel-btn"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            form="add-property-form"
            className="ap-save-btn"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Property"}
            {!loading && <LuCheck size={17} />}
          </button>
        </div>
      </div>
    </main>
  );
}

export default AddProperty;