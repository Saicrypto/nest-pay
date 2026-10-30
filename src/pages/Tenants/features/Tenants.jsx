
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  LuSearch,
  LuHouse,
  LuUserRound,
  LuPlus,
  LuX,
  LuPhone,
  LuMail,
  LuIndianRupee,
  LuShieldCheck,
  LuCalendarDays,
} from "react-icons/lu";
import { LuChevronDown } from "react-icons/lu";
import PropertyService from "../../../services/PropertyService";
import UnitService from "../../../services/UnitService";
import TenantService from "../../../services/TenantService";
import "./../styles/Tenants.css";
import {
  getTenantsCache,
  setTenantsCache,
} from "../cache/tenantsCache";
import TenantsSkeleton from "../components/TenantsSkeleton";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function Tenants() {
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [tenantName, setTenantName] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [editingTenant, setEditingTenant] = useState(false);
const [savingEdit, setSavingEdit] = useState(false);
const [editError, setEditError] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [viewingUnit, setViewingUnit] = useState(null);


const loadData = useCallback(async (forceRefresh = false) => {
  const cached = getTenantsCache();

  if (cached && !forceRefresh) {
    setProperties(cached.properties);
    setUnits(cached.units);
    setTenants(cached.tenants);
    setPageError("");
    setLoading(false);
    return;
  }

  setLoading(true);
  setPageError("");

  try {
    const [propertyData, unitData, tenantData] = await Promise.all([
      PropertyService.getMyProperties(),
      UnitService.getMyUnits(),
      TenantService.getMyTenants(),
    ]);

    const result = {
      properties: propertyData || [],
      units: unitData || [],
      tenants: tenantData || [],
    };

    setProperties(result.properties);
    setUnits(result.units);
    setTenants(result.tenants);
    setTenantsCache(result);
  } catch (err) {
    setPageError(err.message || "Unable to load tenants and flats.");
  } finally {
    setLoading(false);
  }
}, []);


  useEffect(() => {
    loadData();
  }, [loadData]);

  const tenantsByUnit = useMemo(() => {
    const grouped = {};

    tenants.forEach((tenant) => {
      if (!grouped[tenant.unit_id]) {
        grouped[tenant.unit_id] = [];
      }

      grouped[tenant.unit_id].push(tenant);
    });

    return grouped;
  }, [tenants]);

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase();

    return properties
      .map((property) => {
        const propertyUnits = units.filter(
          (unit) => unit.property_id === property.id
        );

        const matchingUnits = propertyUnits.filter((unit) => {
          const unitTenants = tenantsByUnit[unit.id] || [];
          const tenantNames = unitTenants
            .map((tenant) => tenant.full_name || "")
            .join(" ");

          return (
            !query ||
            (property.property_name || "").toLowerCase().includes(query) ||
            (unit.unit_name || "").toLowerCase().includes(query) ||
            tenantNames.toLowerCase().includes(query)
          );
        });

        const propertyMatches =
          (property.property_name || "").toLowerCase().includes(query);

        return {
          ...property,
          units: query && propertyMatches ? propertyUnits : matchingUnits,
        };
      })
      .filter((property) => property.units.length > 0);
  }, [properties, units, tenantsByUnit, search]);

  function openTenantForm(unit) {
    setSelectedUnit(unit);
    setTenantName("");
    setTenantPhone("");
    setTenantEmail("");
    setMoveInDate("");
    setFormError("");
    setSuccessMessage("");
  }

  function closeTenantForm() {
    if (saving) return;
    setSelectedUnit(null);
    setFormError("");
  }

  async function handleCreateTenant(event) {
    event.preventDefault();

    if (!selectedUnit) return;

    if (!tenantName.trim() || !tenantPhone.trim()) {
      setFormError("Please enter the tenant's name and phone number.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const newTenant = await TenantService.createTenant(selectedUnit.id, {
        fullName: tenantName,
        phone: tenantPhone,
        email: tenantEmail,
        moveInDate,
      });


setTenants((current) => {
  const updatedTenants = [newTenant, ...current];

  const cached = getTenantsCache();

  if (cached) {
    setTenantsCache({
      ...cached,
      tenants: updatedTenants,
    });
  }

  return updatedTenants;
});

setUnits((current) => {
  const updatedUnits = current.map((unit) =>
    unit.id === selectedUnit.id
      ? { ...unit, occupancy_status: "occupied" }
      : unit
  );

  const cached = getTenantsCache();

  if (cached) {
    setTenantsCache({
      ...cached,
      units: updatedUnits,
    });
  }

  return updatedUnits;
});


      setSuccessMessage("Tenant added successfully!");
      setSelectedUnit(null);
    } catch (err) {
      setFormError(
        err.message || "Unable to add tenant. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  const handleUpdateTenant = async (e) => {
  e.preventDefault();

  if (!viewingUnit?.tenant?.id) {
    setEditError("Tenant details not found.");
    return;
  }

  if (!tenantName.trim() || !tenantPhone.trim()) {
    setEditError("Tenant name and phone are required.");
    return;
  }

  setSavingEdit(true);
  setEditError("");
  setSuccessMessage("");

  try {
    const updatedTenant = await TenantService.updateTenant(
      viewingUnit.tenant.id,
      {
        fullName: tenantName,
        phone: tenantPhone,
        email: tenantEmail,
      }
    );

    setTenants((current) =>
      current.map((tenant) =>
        tenant.id === updatedTenant.id ? updatedTenant : tenant
      )
    );

    setTenantsCache((current) => {
      const cached = Array.isArray(current) ? current : tenants;
      return cached.map((tenant) =>
        tenant.id === updatedTenant.id ? updatedTenant : tenant
      );
    });

    setViewingUnit((current) => ({
      ...current,
      tenant: updatedTenant,
    }));

    setEditingTenant(false);
    setSuccessMessage("Tenant details updated successfully.");
  } catch (error) {
    console.error("Failed to update tenant:", error);
    setEditError(error.message || "Could not update tenant details.");
  } finally {
    setSavingEdit(false);
  }
};

  if (loading) {
return <TenantsSkeleton />;
  }

  return (
    <main className="tenants-page">
      <header className="tenants-header">
        <div>
          
          <h1>Tenants</h1>
          <p className="tenants-subtitle">
            Manage your flats and the people living in them.
          </p>
        </div>
      </header>

      <div className="tenants-search">
        <LuSearch size={19} aria-hidden="true" />
        <input
          type="search"
          placeholder="Search property, flat or tenant"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search property, flat or tenant"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            <LuX />
          </button>
        )}
      </div>

      {successMessage && (
        <p className="tenants-success" role="status">
          {successMessage}
        </p>
      )}

      {pageError && (
        <div className="tenants-error" role="alert">
          <p>{pageError}</p>
          <button type="button" onClick={() => loadData(true)}>
            Try again
          </button>
        </div>
      )}

      {!pageError && filteredProperties.length === 0 && (
        <section className="tenants-empty">
          <LuHouse size={28} />
          <h2>{search ? "No matches found" : "No flats yet"}</h2>
          <p>
            {search
              ? "Try a different property, flat or tenant name."
              : "Add a property and its flats to start managing tenants."}
          </p>
          {!search && (
            <Link to="/properties" className="tenants-primary-link">
              View properties
            </Link>
          )}
        </section>
      )}

      <div className="tenants-property-list">
        {filteredProperties.map((property) => (
          <section className="tenants-property" key={property.id}>
            <div className="tenants-property-heading">
              <span className="tenants-property-icon">
                <LuHouse size={20} />
              </span>
              <div>
                <h2>{property.property_name}</h2>
               <p>
  {[property.address, property.city].filter(Boolean).join(", ") ||
    `${property.units.length} flats`}
</p>

              </div>
            </div>

            <div className="tenants-unit-list">
              {[...property.units]
  .sort((a, b) => {
    const nameA = a.unit_name.replace(/^flat\s*/i, "").trim();
    const nameB = b.unit_name.replace(/^flat\s*/i, "").trim();

    return nameA.localeCompare(nameB, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  })
  .map((unit) => {
                const unitTenants = tenantsByUnit[unit.id] || [];
                const activeTenant = unitTenants.find(
                  (tenant) => tenant.tenant_status === "active"
                );

                const occupied =
                  unit.occupancy_status === "occupied" ||
                  Boolean(activeTenant);

                return (
 

<article
  className={`tenants-unit ${activeTenant ? "clickable" : ""}`}
  key={unit.id}
  onClick={(event) => {
  if (event.target.closest("button, a")) return;

  setViewingUnit({
    unit,
    tenant: activeTenant || null,
    property,
  });
}}
role="button"
tabIndex={0}
onKeyDown={(event) => {
  if (event.target.closest("button, a")) return;

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
setEditingTenant(false);
setEditError("");

    setViewingUnit({
      unit,
      tenant: activeTenant || null,
      property,
    });
  }
}}
>
  <div className="tenants-unit-content">
    <div className="tenants-unit-top">
      <div className="tenants-unit-info">
        <h3>{unit.unit_name}</h3>
      </div>

      <div className="tenants-unit-action">
        {occupied ? (
          <span className="tenants-status occupied">Occupied</span>
        ) : (
          <button
            type="button"
            className="tenants-add-button"
            onClick={() => openTenantForm(unit)}
          >
            Add tenant
          </button>
        )}
      </div>
    </div>

<div className="tenants-current-tenant">
  <LuUserRound size={13} />
  <span>
    {activeTenant ? activeTenant.full_name : "Vacant"}
  </span>
</div>
  </div>
</article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

    
{/* Saved tenant details overlay */}
{viewingUnit && (
  <div
    className="tenant-details-overlay"
onMouseDown={(e) => {
  if (e.target === e.currentTarget) {
    setEditingTenant(false);
    setEditError("");
    setViewingUnit(null);
  }
}}
  >
    <section
      className="tenant-details-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tenant-details-title"
    >
      <div className="tenant-details-heading">
        <div>
          <p className="tenants-eyebrow">
            {viewingUnit.property.property_name}
          </p>
          <h2 id="tenant-details-title">
            {viewingUnit.unit.unit_name}
          </h2>
        </div>

        <button
          type="button"
          className="tenant-details-close"
          onClick={() => {
  setEditingTenant(false);
  setEditError("");
  setViewingUnit(null);
}}
          aria-label="Close tenant details"
        >
          <LuX size={22} />
        </button>
      </div>

      {viewingUnit.tenant ? (
          editingTenant ? (
    <form className="tenant-edit-form" onSubmit={handleUpdateTenant}>
      <label>
        Tenant name
        <input
          type="text"
          value={tenantName}
          onChange={(e) => setTenantName(e.target.value)}
          required
        />
      </label>

      <label>
        Phone number
        <input
          type="tel"
          value={tenantPhone}
          onChange={(e) => setTenantPhone(e.target.value)}
          required
        />
      </label>

      <label>
        Email
        <input
          type="email"
          value={tenantEmail}
          onChange={(e) => setTenantEmail(e.target.value)}
        />
      </label>

      {editError && <p className="tenant-form-error">{editError}</p>}

      <div className="tenant-edit-actions">
        <button
          type="button"
          onClick={() => {
            setEditingTenant(false);
            setEditError("");
          }}
          disabled={savingEdit}
        >
          Cancel
        </button>

        <button type="submit" disabled={savingEdit}>
          {savingEdit ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  ) : (
    <>

        <div className="tenant-details-contact">
          <div>
            <LuUserRound size={18} />
            <div>
              <span>Full name</span>
              <strong>
                {viewingUnit.tenant.full_name || "—"}
              </strong>
            </div>
          </div>

          <div>
            <LuPhone size={18} />
            <div>
              <span>Phone number</span>
              <strong>
                {viewingUnit.tenant.phone || "—"}
              </strong>
            </div>
          </div>

          <div>
            <LuMail size={18} />
            <div>
              <span>Email address</span>
              <strong>
                {viewingUnit.tenant.email || "—"}
              </strong>
            </div>
          </div>

          <div>
            <LuCalendarDays size={18} />
            <div>
              <span>Move-in date</span>
              <strong>
                {viewingUnit.tenant.move_in_date
                  ? new Date(
                      `${viewingUnit.tenant.move_in_date}T00:00:00`
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </strong>
            </div>
          </div>
        </div>
              <button
        type="button"
        onClick={() => {
          setTenantName(viewingUnit.tenant.full_name || "");
          setTenantPhone(viewingUnit.tenant.phone || "");
          setTenantEmail(viewingUnit.tenant.email || "");
          setEditError("");
          setEditingTenant(true);
        }}
      >
        Edit Tenant
      </button>
    </>
  )
      ) : (
        <div className="tenant-details-vacant">
          <p>No active tenant is assigned to this flat.</p>
          <button
            type="button"
            className="tenant-details-add-button"
            onClick={() => {
              const unit = viewingUnit.unit;
              setViewingUnit(null);
              openTenantForm(unit);
            }}
          >
            <LuPlus size={17} />
            Add tenant
          </button>
        </div>
      )}
    </section>
  </div>
)}

{/* Separate Add Tenant form overlay */}
{selectedUnit && (
  <div
    className="tenant-form-overlay"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) {
        closeTenantForm();
      }
    }}
  >
    <section
      className="tenant-form-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tenant-form-title"
    >
      <div className="tenant-form-heading">
        <div>
          <p className="tenants-eyebrow">NEW TENANCY</p>
          <h2 id="tenant-form-title">Add tenant</h2>
          <p>
            {selectedUnit.unit_name} ·{" "}
            {properties.find(
              (property) =>
                property.id === selectedUnit.property_id
            )?.property_name || "Property"}
          </p>
        </div>

        <button
          type="button"
          className="tenant-form-close"
          onClick={closeTenantForm}
          disabled={saving}
          aria-label="Close form"
        >
          <LuX size={21} />
        </button>
      </div>

      <form
        className="tenant-form"
        onSubmit={handleCreateTenant}
      >
        <label>
          Full name <span>*</span>
          <input
            type="text"
            value={tenantName}
            onChange={(event) => setTenantName(event.target.value)}
            placeholder="Enter tenant's full name"
            autoComplete="name"
            required
          />
        </label>

        <label>
          Phone number <span>*</span>
          <span className="tenant-input-wrap">
            <LuPhone size={17} />
            <input
              type="tel"
              value={tenantPhone}
              onChange={(event) => setTenantPhone(event.target.value)}
              placeholder="Enter phone number"
              autoComplete="tel"
              required
            />
          </span>
        </label>

        <label>
          Email address
          <span className="tenant-input-wrap">
            <LuMail size={17} />
            <input
              type="email"
              value={tenantEmail}
              onChange={(event) => setTenantEmail(event.target.value)}
              placeholder="Enter email address"
              autoComplete="email"
            />
          </span>
        </label>

        <label>
          Move-in date
          <span className="tenant-input-wrap">
            <LuCalendarDays size={17} />
            <input
              type="date"
              value={moveInDate}
              onChange={(event) => setMoveInDate(event.target.value)}
            />
          </span>
        </label>

        {formError && (
          <p className="tenants-error" role="alert">
            {formError}
          </p>
        )}

        <button
          type="submit"
          className="tenant-save-button"
          disabled={saving}
        >
          {saving ? "Saving tenant..." : "Save tenant"}
        </button>
      </form>
    </section>
  </div>
)}

    </main>
  );
}

export default Tenants;
