import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropertyService from "../../../services/PropertyService";
import "../styles/Properties.css";
import {
  LuArrowLeft,
  LuHouse,
  LuBuilding2,
  LuMapPin,
  LuMap,
  LuHash,
  LuLayers,
  LuSave,
} from "react-icons/lu";
import StatusDropdown from "../../../components/property/StatusDropdown";
import { clearPropertiesCache } from "../cache/propertiesCache";
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
  const [totalUnits, setTotalUnits] = useState("1");
  const [propertyTypeOpen, setPropertyTypeOpen] = useState(false);
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
        totalUnits,
      });

      clearPropertiesCache();
clearHomeCache();
clearPropertyDetailsCache();

      // Return to the property list after successfully saving.
      navigate("/properties", {
        state: { propertyAdded: true },
      });
    } catch (err) {
      setError(err.message || "Unable to save property.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="properties-page">
      <header className="properties-header">
        <Link to="/properties" className="properties-back">
          <LuArrowLeft />
          Your Properties
        </Link>

        <span className="properties-brand">Nest Pay</span>
      </header>

      <section className="property-form-card">
        <h1>
          <LuHouse />
          Add a property
        </h1>

        <p>Enter the details of the property you manage.</p>

        <form onSubmit={handleSubmit}>
          {error && (
            <p className="property-error" role="alert">
              {error}
            </p>
          )}

          <label htmlFor="propertyName">Property name</label>
          <input
            id="propertyName"
            value={propertyName}
            onChange={(event) => setPropertyName(event.target.value)}
            placeholder="e.g. Lakshmi Apartments"
            required
          />

         <label>
  <LuBuilding2 />
  Property type
</label>

<StatusDropdown
  value={propertyType}
  label="Property type"
  variant="property-type"
  showDot={false}
  onChange={setPropertyType}
  options={[
    { value: "individual_house", label: "Individual house" },
    { value: "apartment", label: "Apartment" },
    { value: "building", label: "Building" },
    { value: "commercial", label: "Commercial property" },
  ]}
/>

          <label htmlFor="address">
            <LuMapPin />
            Address
          </label>

          <input
            id="address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Street, area or locality"
          />

          <div className="property-form-row">
            <div>
              <label htmlFor="city">
                <LuMap />
                City
              </label>

              <input
                id="city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Hyderabad"
              />
            </div>

            <div>
              <label htmlFor="state">
                <LuLayers />
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

          <label htmlFor="pincode">
            <LuHash />
            PIN code
          </label>

          <input
            id="pincode"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={pincode}
            onChange={(event) => setPincode(event.target.value)}
            placeholder="6-digit PIN code"
          />

          <label htmlFor="totalUnits">
            <LuLayers />
            Number of units
          </label>

          <input
            id="totalUnits"
            type="number"
            min="1"
            max="1000"
            value={totalUnits}
            onChange={(event) => setTotalUnits(event.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            <LuSave />
            {loading ? "Saving..." : "Save property"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AddProperty;