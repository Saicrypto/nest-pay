import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  LuSearch,
  LuX,
  LuHouse,
  LuUserRound,
  LuPlus,
  LuChevronRight,
  LuPencil,
  LuPhone,
  LuMail,
  LuCalendarDays,
  LuUsers,
  LuBriefcase,
  LuKeyRound,
  LuCopy,
  LuEye,
  LuEyeOff,
} from "react-icons/lu";
import PropertyService from "../../../services/PropertyService";
import UnitService from "../../../services/UnitService";
import TenantService from "../../../services/TenantService";
import { useUser } from "../../../context/UserContext";
import {
  getTenantsCache,
  setTenantsCache,
  clearTenantsCache,
} from "../cache/tenantsCache";
import TenantsSkeleton from "../components/TenantsSkeleton";
import { clearTenantDetailsCache } from "../cache/tenantDetailsCache";
import { clearRentStatusCache } from "../../RentStatus/cache/rentStatusCache";
import UnitAccessCodeService from "../../Properties/services/UnitAccessCodeService";
import "../styles/Tenants.css";



async function copyTextSafely(text) {
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to legacy textarea copy for restricted WebViews
    }
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

function Tenants() {
  const { user } = useUser();
  const userId = user?.id;

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
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [viewingUnit, setViewingUnit] = useState(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [rentStartDate, setRentStartDate] = useState("");
  const [viewingAccessCode, setViewingAccessCode] = useState("");
  const [loadingAccessCode, setLoadingAccessCode] = useState(false);
  const [accessCodeError, setAccessCodeError] = useState("");
  const [showAccessCode, setShowAccessCode] = useState(false);

  const loadData = useCallback(
    async (forceRefresh = false) => {
      if (!userId) {
        setProperties([]);
        setUnits([]);
        setTenants([]);
        setLoading(false);
        return;
      }

      const cached = getTenantsCache(userId);

      if (cached && !forceRefresh) {
        setProperties(Array.isArray(cached.properties) ? cached.properties : []);
        setUnits(Array.isArray(cached.units) ? cached.units : []);
        setTenants(Array.isArray(cached.tenants) ? cached.tenants : []);
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
          properties: Array.isArray(propertyData) ? propertyData : [],
          units: Array.isArray(unitData) ? unitData : [],
          tenants: Array.isArray(tenantData) ? tenantData : [],
        };

        setProperties(result.properties);
        setUnits(result.units);
        setTenants(result.tenants);
        setTenantsCache(userId, result);
      } catch (err) {
        setPageError(err.message || "Unable to load tenants and flats.");
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!viewingUnit && !selectedUnit) return;

    function handleKeyDown(event) {
      if (event.key !== "Escape") return;
      if (generatingCode || savingEdit || loadingAccessCode) return;

      if (viewingUnit) {
        setEditingTenant(false);
        setEditError("");
        setShowAccessCode(false);
        setViewingUnit(null);
      }

      if (selectedUnit) {
        setSelectedUnit(null);
        setGeneratedCode("");
        setShowAccessCode(false);
        setFormError("");
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [viewingUnit, selectedUnit, generatingCode, savingEdit, loadingAccessCode]);

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

        const propertyMatches = (property.property_name || "")
          .toLowerCase()
          .includes(query);

        return {
          ...property,
          units: query && propertyMatches ? propertyUnits : matchingUnits,
        };
      })
      .filter((property) => property.units.length > 0);
  }, [properties, units, tenantsByUnit, search]);

  function openTenantForm(unit) {
    setSelectedUnit(unit);
    setGeneratedCode("");
    setShowAccessCode(false);
    setFormError("");
    setSuccessMessage("");
    setRentStartDate(new Date().toISOString().slice(0, 10));
  }

  function closeTenantForm() {
    if (generatingCode) return;
    setSelectedUnit(null);
    setGeneratedCode("");
    setShowAccessCode(false);
    setFormError("");
  }

  async function handleGenerateAccessCode(event) {
    event.preventDefault();

    if (!selectedUnit || generatingCode) return;

    if (!rentStartDate) {
      setFormError("Please select a rent start date.");
      return;
    }

    setGeneratingCode(true);
    setFormError("");
    setGeneratedCode("");
    setShowAccessCode(false);

    try {
      const result = await UnitAccessCodeService.generateCode(
        selectedUnit.id,
        rentStartDate
      );

      setGeneratedCode(result.code);
      if (userId) {
        clearTenantsCache(userId);
      }
      setSuccessMessage(
        result.existing
          ? "Existing access code retrieved."
          : "Access code generated for new tenant."
      );
    } catch (err) {
      setFormError(err.message || "Unable to generate access code.");
    } finally {
      setGeneratingCode(false);
    }
  }

  async function handleViewAccessCode(unit) {
    if (!unit?.id || loadingAccessCode) return;

    setLoadingAccessCode(true);
    setViewingAccessCode("");
    setAccessCodeError("");
    setShowAccessCode(false);

    try {
      const result = await UnitAccessCodeService.generateCode(unit.id, "");
      setViewingAccessCode(result.code);
      setShowAccessCode(true);
    } catch (error) {
      setAccessCodeError(
        error.message || "Unable to retrieve access code."
      );
    } finally {
      setLoadingAccessCode(false);
    }
  }

  async function handleCopyCode(codeValue) {
    if (!codeValue) return;
    const copied = await copyTextSafely(codeValue);
    if (copied) {
      setSuccessMessage("Access code copied.");
    } else {
      setFormError("Unable to copy automatically. Please copy the code manually.");
    }
  }

  const handleUpdateTenant = async (e) => {
    e.preventDefault();
    if (savingEdit) return;

    if (!viewingUnit?.tenant?.id) {
      setEditError("Tenant details not found.");
      return;
    }

    const cleanName = tenantName.trim();
    const cleanPhone = tenantPhone.trim();
    const cleanEmail = tenantEmail.trim();

    if (!cleanName || !cleanPhone) {
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
          fullName: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
        }
      );

      const nextTenants = tenants.map((tenant) =>
        tenant.id === updatedTenant.id ? updatedTenant : tenant
      );

      setTenants(nextTenants);

      if (userId) {
        setTenantsCache(userId, {
          properties,
          units,
          tenants: nextTenants,
        });
      }

      setViewingUnit((current) =>
        current
          ? {
              ...current,
              tenant: updatedTenant,
            }
          : null
      );

      clearTenantDetailsCache(updatedTenant.id);
      clearRentStatusCache(userId);
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
      {/* Full-Bleed Top Curved Burnt-Orange Hero Header */}
      <header className="tenants-header">
        <h1>Tenants</h1>
        <p className="tenants-subtitle">
          Manage your flats and the people living in them.
        </p>
      </header>

      {/* Overlapping Floating Search Capsule */}
      <div className="tenants-search-wrap">
        <div className="tenants-search">
          <LuSearch size={18} aria-hidden="true" />
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
              className="tenants-search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <LuX size={15} aria-hidden="true" />
            </button>
          )}
        </div>
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
          <div className="tenants-empty-icon">
            <LuHouse size={26} aria-hidden="true" />
          </div>
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

      {/* Property-Grouped Flat Cards */}
      <div className="tenants-property-list">
        {filteredProperties.map((property) => (
          <section className="tenants-property" key={property.id}>
            <div className="tenants-property-heading">
              <span className="tenants-property-icon">
                <LuHouse size={20} aria-hidden="true" />
              </span>
              <div className="tenants-property-meta">
                <h2>{property.property_name}</h2>
                <p>
                  {[property.address, property.city]
                    .filter(Boolean)
                    .join(", ") || `${property.units.length} flats`}
                </p>
              </div>
            </div>

            <div className="tenants-unit-list">
              {[...property.units]
                .sort((a, b) => {
                  const nameA = (a.unit_name || "").replace(/^flat\s*/i, "").trim();
                  const nameB = (b.unit_name || "").replace(/^flat\s*/i, "").trim();

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
                      className={`tenants-unit ${
                        activeTenant ? "clickable" : ""
                      }`}
                      key={unit.id}
                      onClick={(event) => {
                        if (event.target.closest("button, a")) return;

                        setEditingTenant(false);
                        setEditError("");
                        setViewingAccessCode("");
                        setAccessCodeError("");
                        setShowAccessCode(false);

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
                          setViewingAccessCode("");
                          setAccessCodeError("");
                          setShowAccessCode(false);

                          setViewingUnit({
                            unit,
                            tenant: activeTenant || null,
                            property,
                          });
                        }
                      }}
                    >
                      <div className="tenants-unit-content">
                        <div className="tenants-unit-info">
                          <div className="tenants-unit-title-row">
                            <span
                              className={`tenants-unit-dot ${
                                occupied ? "occupied" : "vacant"
                              }`}
                            />
                            <h3>{unit.unit_name}</h3>
                          </div>

                          <div className="tenants-current-tenant">
                            <LuUserRound size={13} aria-hidden="true" />
                            <span>
                              {activeTenant
                                ? activeTenant.full_name
                                : "Vacant"}
                            </span>
                          </div>
                        </div>

                        <div className="tenants-unit-action">
                          {occupied ? (
                            <span className="tenants-status occupied">
                              Occupied
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="tenants-add-button"
                              onClick={() => openTenantForm(unit)}
                            >
                              <LuPlus size={14} aria-hidden="true" />
                              <span>Add tenant</span>
                            </button>
                          )}

                          <LuChevronRight
                            size={16}
                            className="tenants-unit-arrow"
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    </article>
                  );
                })}
            </div>
          </section>
        ))}
      </div>

      {/* Saved Tenant Details Slide-Up Bottom Sheet */}
      {viewingUnit && (
        <div
          className="tenant-details-overlay"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget && !savingEdit && !loadingAccessCode) {
              setEditingTenant(false);
              setEditError("");
              setShowAccessCode(false);
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
            <div className="tn-sheet-handle-wrap">
              <span className="tn-sheet-handle" />
            </div>

            <div className="tenant-details-heading">
              <div>
                <p className="tenants-eyebrow">
                  {viewingUnit.property.property_name}
                </p>
                <h2 id="tenant-details-title">
                  {viewingUnit.unit.unit_name}
                </h2>
              </div>

              <div className="tn-modal-header-actions">
                {viewingUnit.tenant && !editingTenant && (
                  <button
                    type="button"
                    className="tn-edit-trigger"
                    aria-label="Edit tenant details"
                    onClick={() => {
                      setTenantName(viewingUnit.tenant.full_name || "");
                      setTenantPhone(viewingUnit.tenant.phone || "");
                      setTenantEmail(viewingUnit.tenant.email || "");
                      setEditError("");
                      setEditingTenant(true);
                    }}
                  >
                    <LuPencil size={15} aria-hidden="true" />
                  </button>
                )}

                <button
                  type="button"
                  className="tenant-details-close"
                  onClick={() => {
                    setEditingTenant(false);
                    setEditError("");
                    setViewingUnit(null);
                    setShowAccessCode(false);
                  }}
                  aria-label="Close tenant details"
                >
                  <LuX size={18} aria-hidden="true" />
                </button>
              </div>
            </div>

            {viewingUnit.tenant ? (
              editingTenant ? (
                <form
                  className="tenant-edit-form"
                  onSubmit={handleUpdateTenant}
                >
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

                  {editError && (
                    <p className="tenant-form-error" role="alert">
                      {editError}
                    </p>
                  )}

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
                    <div className="tn-detail-row">
                      <span className="tn-detail-icon">
                        <LuUserRound size={16} aria-hidden="true" />
                      </span>
                      <div>
                        <span>Full name</span>
                        <strong>{viewingUnit.tenant.full_name || "—"}</strong>
                      </div>
                    </div>

                    <div className="tn-detail-row">
                      <span className="tn-detail-icon">
                        <LuPhone size={16} aria-hidden="true" />
                      </span>
                      <div>
                        <span>Phone number</span>
                        <strong>{viewingUnit.tenant.phone || "—"}</strong>
                      </div>
                    </div>

                    <div className="tn-detail-row">
                      <span className="tn-detail-icon">
                        <LuMail size={16} aria-hidden="true" />
                      </span>
                      <div>
                        <span>Email address</span>
                        <strong>{viewingUnit.tenant.email || "—"}</strong>
                      </div>
                    </div>

                    <div className="tn-detail-grid-3">
                      <div className="tn-mini-stat">
                        <LuCalendarDays size={14} aria-hidden="true" />
                        <span>Age</span>
                        <strong>{viewingUnit.tenant.age ?? "—"}</strong>
                      </div>

                      <div className="tn-mini-stat">
                        <LuUsers size={14} aria-hidden="true" />
                        <span>Family</span>
                        <strong>
                          {viewingUnit.tenant.family_members ?? "—"}
                        </strong>
                      </div>

                      <div className="tn-mini-stat">
                        <LuBriefcase size={14} aria-hidden="true" />
                        <span>Profession</span>
                        <strong>
                          {viewingUnit.tenant.profession || "—"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Permanent Access Code Drawer Card */}
                  <div className="tenant-access-code-section">
                    <button
                      type="button"
                      className="tenant-access-code-button"
                      onClick={() => {
                        if (viewingAccessCode) {
                          setShowAccessCode((current) => !current);
                        } else {
                          handleViewAccessCode(viewingUnit.unit);
                        }
                      }}
                      disabled={loadingAccessCode}
                    >
                      <LuKeyRound size={16} aria-hidden="true" />
                      <span>
                        {loadingAccessCode
                          ? "Loading access code..."
                          : viewingAccessCode
                          ? showAccessCode
                            ? "Hide access code"
                            : "Show access code"
                          : "View access code"}
                      </span>
                    </button>

                    {viewingAccessCode && (
                      <div className="generated-access-code">
                        <span>Tenant access code</span>

                        <div className="access-code-display">
                          <strong>
                            {showAccessCode ? viewingAccessCode : "••••••"}
                          </strong>

                          {showAccessCode && (
                            <button
                              type="button"
                              onClick={() => handleCopyCode(viewingAccessCode)}
                            >
                              <LuCopy size={13} aria-hidden="true" />
                              <span>Copy</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {accessCodeError && (
                      <p className="tenants-error" role="alert">
                        {accessCodeError}
                      </p>
                    )}
                  </div>
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
                  <LuPlus size={17} aria-hidden="true" />
                  <span>Add tenant</span>
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Add Tenant / Generate Access Code Slide-Up Bottom Sheet */}
      {selectedUnit && (
        <div
          className="tenant-form-overlay"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget && !generatingCode) {
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
            <div className="tn-sheet-handle-wrap">
              <span className="tn-sheet-handle" />
            </div>

            <div className="tenant-form-heading">
              <div>
                <p className="tenants-eyebrow">NEW TENANCY</p>
                <h2 id="tenant-form-title">Add tenant</h2>
                <p className="tn-unit-sub">
                  {selectedUnit.unit_name} ·{" "}
                  {properties.find(
                    (property) => property.id === selectedUnit.property_id
                  )?.property_name || "Property"}
                </p>
              </div>

              <button
                type="button"
                className="tenant-form-close"
                onClick={closeTenantForm}
                disabled={generatingCode}
                aria-label="Close form"
              >
                <LuX size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="tenant-form">
              <p className="tn-form-helper">
                Generate an access code and share it with your tenant. They
                will enter their personal details after logging in.
              </p>

              <label className="tenant-date-field">
                <span>Rent start date</span>
                <input
                  type="date"
                  value={rentStartDate}
                  onChange={(event) => setRentStartDate(event.target.value)}
                  required
                  disabled={generatingCode}
                />
              </label>

              {generatedCode && (
                <div className="generated-access-code">
                  <span>Tenant access code</span>

                  <div className="access-code-display">
                    <strong>
                      {showAccessCode ? generatedCode : "••••••"}
                    </strong>

                    {showAccessCode && (
                      <button
                        type="button"
                        onClick={() => handleCopyCode(generatedCode)}
                      >
                        <LuCopy size={13} aria-hidden="true" />
                        <span>Copy</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {formError && (
                <p className="tenants-error" role="alert">
                  {formError}
                </p>
              )}

              <button
                type="button"
                className="tenant-save-button"
                onClick={(event) => {
                  if (generatedCode) {
                    setShowAccessCode((current) => !current);
                  } else {
                    handleGenerateAccessCode(event);
                  }
                }}
                disabled={generatingCode}
              >
                {generatedCode ? (
                  showAccessCode ? (
                    <>
                      <LuEyeOff size={16} aria-hidden="true" />
                      <span>Hide access code</span>
                    </>
                  ) : (
                    <>
                      <LuEye size={16} aria-hidden="true" />
                      <span>View access code</span>
                    </>
                  )
                ) : (
                  <>
                    <LuKeyRound size={16} aria-hidden="true" />
                    <span>
                      {generatingCode
                        ? "Generating..."
                        : "Generate access code"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default Tenants;