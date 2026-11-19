
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuBuilding2,
  LuMapPin,
  LuPencil,
  LuTrash2,
  LuX,
} from "react-icons/lu";
import PropertyService from "../../../services/PropertyService";
import {
  clearPropertiesCache,
} from "../cache/propertiesCache";
import {
  clearPropertyDetailsCache,
} from "../cache/propertyDetailsCache";
import { clearHomeCache } from "../../Home/cache/homeCache";
import "../styles/PropertySummary.css";
import { clearTenantsCache } from "../../Tenants/cache/tenantsCache";
import { clearTenantDetailsCache } from "../../Tenants/cache/tenantDetailsCache";
import { clearRentStatusCache } from "../../RentStatus/cache/rentStatusCache";
import { useUser } from "../../../context/UserContext";


function PropertySummary({ property, unitCount }) {
  const navigate = useNavigate();
 const { user } = useUser();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    propertyName: property.property_name || "",
    propertyType: property.property_type || "apartment",
    address: property.address || "",
    city: property.city || "",
    state: property.state || "",
    pincode: property.pincode || "",
    totalUnits: String(property.total_units ?? unitCount ?? 1),
  });

const address = property.city || "City not provided";

  function changeField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

async function handleSave(event) {
    event.preventDefault();
    if (saving) return;

    const cleanName = form.propertyName.trim();
    const parsedUnits = Number.parseInt(form.totalUnits, 10);
    const cleanPincode = form.pincode.trim();

    if (!cleanName) {
      setError("Property name is required.");
      return;
    }

    if (!Number.isInteger(parsedUnits) || parsedUnits < Math.max(1, unitCount || 1)) {
      setError(
        `Total flats must be at least ${Math.max(1, unitCount || 1)}.`
      );
      return;
    }

    if (cleanPincode && !/^\d{6}$/.test(cleanPincode)) {
      setError("Enter a valid 6-digit pincode.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await PropertyService.updateProperty(property.id, {
        ...form,
        propertyName: cleanName,
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: cleanPincode,
        totalUnits: parsedUnits,
      });

      clearPropertiesCache();
      clearHomeCache();
      clearPropertyDetailsCache(user?.id, property.id);
      clearTenantsCache();
      clearTenantDetailsCache();
      clearRentStatusCache();

      window.location.reload();
    } catch (err) {
      setError(err.message || "Unable to update property.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleting) return;

    setDeleting(true);
    setError("");

    try {
      await PropertyService.deleteProperty(property.id);

      clearPropertiesCache();
      clearHomeCache();
      clearPropertyDetailsCache(user?.id, property.id);
      clearTenantsCache();
      clearTenantDetailsCache();
      clearRentStatusCache();

      navigate("/properties", { replace: true });
    } catch (err) {
      setError(
        err.message ||
          "Unable to delete property. Check whether it has flats or related records."
      );
      setDeleting(false);
    }
  }

  return (
    <>
<section className="property-summary">
        <div className="property-summary-heading">
          <div className="ps-title-row">
            <div className="ps-building-badge">
              <LuBuilding2 size={24} />
            </div>

            <div className="ps-title-meta">
              <h1>{property.property_name}</h1>
              <span className="property-summary-type">
                {(property.property_type || "Property").replaceAll("_", " ")}
              </span>
            </div>
          </div>

          <div className="property-summary-actions">
            <button
              type="button"
              className="property-summary-edit"
              aria-label="Edit property"
              onClick={() => {
                setForm({
                  propertyName: property.property_name || "",
                  propertyType: property.property_type || "apartment",
                  address: property.address || "",
                  city: property.city || "",
                  state: property.state || "",
                  pincode: property.pincode || "",
                  totalUnits: String(property.total_units ?? unitCount ?? 1),
                });
                setError("");
                setEditing(true);
              }}
            >
              <LuPencil size={16} aria-hidden="true" />
            </button>

            <button
              type="button"
              className="property-summary-delete"
              aria-label="Delete property"
              onClick={() => {
                setError("");
                setConfirmDelete(true);
              }}
            >
              <LuTrash2 size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="ps-meta-footer">
          <div className="ps-meta-pill">
            <LuMapPin size={15} />
            <span>
              {[property.city, property.state].filter(Boolean).join(", ") ||
                "City not provided"}
            </span>
          </div>

          <div className="ps-units-pill">
            <LuBuilding2 size={15} />
            <strong>{unitCount}</strong>
            <span>{unitCount === 1 ? "Flat" : "Flats"}</span>
          </div>
        </div>
      </section>

      {editing && (
        <div
          className="property-action-overlay"
          onClick={() => !saving && setEditing(false)}
        >
          <form
            className="property-action-modal"
            onSubmit={handleSave}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="property-action-close"
              onClick={() => setEditing(false)}
              disabled={saving}
              aria-label="Close edit form"
            >
              <LuX />
            </button>

            <h2>Edit Property</h2>

            <label>
              Property name
              <input
                name="propertyName"
                value={form.propertyName}
                onChange={changeField}
                required
              />
            </label>

            <label>
              Property type
              <select
                name="propertyType"
                value={form.propertyType}
                onChange={changeField}
                required
              >
                <option value="individual_house">Individual house</option>
                <option value="apartment">Apartment</option>
                <option value="building">Building</option>
                <option value="commercial">Commercial</option>
              </select>
            </label>

            <label>
              Address
              <input
                name="address"
                value={form.address}
                onChange={changeField}
              />
            </label>

            <label>
              City
              <input name="city" value={form.city} onChange={changeField} />
            </label>

            <label>
              State
              <input name="state" value={form.state} onChange={changeField} />
            </label>

            <label>
              Pincode
              <input
                name="pincode"
                value={form.pincode}
                onChange={changeField}
                inputMode="numeric"
              />
            </label>

            <label>
              Total flats
              <input
                name="totalUnits"
                type="number"
                min="1"
                value={form.totalUnits}
                onChange={changeField}
                required
              />
            </label>

            {error && <p className="property-action-error">{error}</p>}

            <div className="property-action-buttons">
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {confirmDelete && (
        <div
          className="property-action-overlay"
          onClick={() => !deleting && setConfirmDelete(false)}
        >
          <section
            className="property-action-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-property-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="delete-property-title">Delete this property?</h2>

<div className="property-delete-warning">
  <p>
    You are about to permanently delete{" "}
    <strong>{property.property_name}</strong>.
  </p>

  <ul>
    <li>All flats under this property may be deleted.</li>
    <li>Tenant records associated with those flats may be deleted.</li>
    <li>Rent and payment history may be affected.</li>
  </ul>

  <p className="property-delete-dues-warning">
    <strong>Before proceeding:</strong> Check all flats for unpaid rent,
    overdue payments, pending dues, and any outstanding security-deposit
    settlements. Save any records you may need later.
  </p>

  <p>Are you sure you want to continue?</p>
</div>


            {error && <p className="property-action-error">{error}</p>}

            <div className="property-action-buttons">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="property-action-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="property-delete-spinner" />
                    Deleting...
                  </>
                ) : (
                  "Delete Property"
                )}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default PropertySummary;
