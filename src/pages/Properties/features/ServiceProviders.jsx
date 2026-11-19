import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LuArrowLeft,
  LuPlus,
  LuWrench,
  LuX,
  LuPhone,
  LuUser,
  LuFileText,
  LuPencil,
  LuTrash2,
  LuCheck,
} from "react-icons/lu";
import PropertyManagementService from "../services/PropertyManagementService";
import "../styles/ServiceProviders.css";

const QUICK_ROLES = [
  "Electrician",
  "Plumber",
  "Cleaning",
  "Security",
  "Carpenter",
  "Painter",
];

function ServiceProviders() {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  const emptyForm = {
    service_name: "",
    contact_person: "",
    phone: "",
    description: "",
  };

  const [form, setForm] = useState(emptyForm);

async function loadProviders(signal) {
    if (!propertyId) return;

    try {
      setError("");
      const data =
        await PropertyManagementService.getServiceProviders(propertyId);
      if (!signal?.aborted) {
        setProviders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      if (!signal?.aborted) {
        setError(err.message || "Unable to load service providers.");
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setProviders([]);
    setActiveFilter("All");
    loadProviders(controller.signal);

    return () => controller.abort();
  }, [propertyId]);

  function openAddForm() {
    setEditingProvider(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEditForm(provider) {
    setEditingProvider(provider);
    setForm({
      service_name: provider.service_name || "",
      contact_person: provider.contact_person || "",
      phone: provider.phone || "",
      description: provider.description || "",
    });
    setError("");
    setShowForm(true);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;

    const cleanName = form.service_name.trim();
    const cleanPhone = form.phone.trim();

    if (!cleanName) {
      setError("Service name is required.");
      return;
    }

    if (!cleanPhone || !/^[+\d\s()-]{7,20}$/.test(cleanPhone)) {
      setError("Please enter a valid contact number.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const cleanFields = {
        service_name: cleanName,
        contact_person: form.contact_person.trim(),
        phone: cleanPhone,
        description: form.description.trim(),
      };

      if (editingProvider) {
        const updated =
          await PropertyManagementService.updateServiceProvider(
            editingProvider.id,
            cleanFields
          );

        setProviders((current) =>
          current.map((item) =>
            item.id === updated.id ? updated : item
          )
        );
      } else {
        const created =
          await PropertyManagementService.addServiceProvider({
            ...cleanFields,
            property_id: propertyId,
          });

        setProviders((current) => [created, ...current]);
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingProvider(null);
      setActiveFilter("All");
    } catch (err) {
      setError(err.message || "Unable to save service provider.");
    } finally {
      setSaving(false);
    }
  }


async function handleDelete(provider) {
    if (deletingId) return;

    const confirmed = window.confirm(
      `Delete ${provider.service_name}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(provider.id);
      setError("");
      await PropertyManagementService.deleteServiceProvider(provider.id);
      setProviders((current) =>
        current.filter((item) => item.id !== provider.id)
      );
    } catch (err) {
      setError(err.message || "Unable to delete service provider.");
    } finally {
      setDeletingId(null);
    }
  }

  // Dynamic filter pills derived from existing providers
  const filterCategories = [
    "All",
    ...Array.from(
      new Set(
        providers
          .map((p) => (p.service_name || "").trim())
          .filter(Boolean)
      )
    ),
  ];

  const filteredProviders =
    activeFilter === "All"
      ? providers
      : providers.filter(
          (p) =>
            (p.service_name || "").trim().toLowerCase() ===
            activeFilter.toLowerCase()
        );

  return (
    <main className="service-providers-page">
      {/* Sticky Light-Canvas Top Bar */}
      <header className="sp-topbar">
        <button
          type="button"
          className="sp-back-btn"
          onClick={() => navigate(`/properties/${propertyId}`)}
        >
          <span className="sp-back-circle">
            <LuArrowLeft size={16} />
          </span>
          <span>Properties</span>
        </button>

        <div className="sp-brand-badge">
          <span className="sp-brand-mark">N</span>
          <span>Nest Pay</span>
        </div>
      </header>

      {/* Hero Title + Active Vendor Pill */}
      <div className="service-providers-header">
        <div>
          <h1>Service Providers</h1>
          <p>Manage professional services for this property.</p>
        </div>

        <span className="sp-count-pill">
          {providers.length} {providers.length === 1 ? "Vendor" : "Vendors"}
        </span>
      </div>

      {/* Section Header & + Add Provider CTA */}
      <section>
        <div className="service-providers-section-header">
          <h2>Providers</h2>
          <button
            className="service-providers-add"
            type="button"
            onClick={openAddForm}
          >
            <LuPlus size={16} strokeWidth={2.5} /> Add Provider
          </button>
        </div>

        {/* Category Filter Pills */}
        {providers.length > 0 && (
          <div className="sp-filter-row" role="tablist">
            {filterCategories.map((category) => (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={activeFilter === category}
                className={`sp-filter-pill ${
                  activeFilter === category ? "active" : ""
                }`}
                onClick={() => setActiveFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {error && !showForm && (
          <p className="sp-error-banner" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="sp-loading-text">Loading providers...</p>
        ) : filteredProviders.length === 0 ? (
          <div className="sp-empty-card">
            <div className="sp-empty-icon">
              <LuWrench size={26} />
            </div>
            <h3>No service providers added</h3>
            <p>
              Add electricians, plumbers, painters and other professionals.
            </p>
          </div>
        ) : (
          <div className="sp-cards-list">
            {filteredProviders.map((provider) => (
              <article className="service-provider-card" key={provider.id}>
                <div className="sp-card-top">
                  <div className="sp-card-icon">
                    <LuWrench size={20} />
                  </div>

                  <div className="sp-card-info">
                    <div className="sp-card-title-row">
                      <h3>{provider.service_name}</h3>
                    </div>

                    {provider.contact_person && (
                      <p className="sp-card-person">
                        {provider.contact_person}
                      </p>
                    )}

                    <p className="sp-card-phone">{provider.phone}</p>

                    {provider.description && (
                      <p className="sp-card-desc">{provider.description}</p>
                    )}
                  </div>
                </div>

                <div className="service-provider-actions">
                 {provider.phone && (
                    <a
                      href={`tel:${provider.phone.replace(/[^\d+]/g, "")}`}
                      className="sp-action-btn sp-call-btn"
                    >
                      <LuPhone size={14} />
                      <span>Call</span>
                    </a>
                  )}

                  <button
                    type="button"
                    className="sp-action-btn sp-edit-btn"
                    onClick={() => openEditForm(provider)}
                  >
                    <LuPencil size={14} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    className="sp-action-btn sp-delete-btn"
                    onClick={() => handleDelete(provider)}
                  >
                    <LuTrash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Slide-Up Bottom Sheet Drawer */}
      {showForm && (
        <div
          className="service-provider-overlay"
          role="presentation"
          onClick={() => !saving && setShowForm(false)}
        >
          <form
            className="service-provider-form"
            onSubmit={handleSubmit}
            onClick={(event) => event.stopPropagation()}
          >
            {/* Top Grab Handle */}
            <div className="sp-sheet-handle-wrap">
              <span className="sp-sheet-handle" />
            </div>

            {/* Sheet Header */}
            <div className="sp-sheet-header">
              <div>
                <span className="sp-sheet-eyebrow">
                  {editingProvider ? "UPDATE VENDOR" : "NEW VENDOR"}
                </span>
                <h2>{editingProvider ? "Edit Provider" : "Add Provider"}</h2>
              </div>

              <button
                type="button"
                className="sp-sheet-close"
                onClick={() => setShowForm(false)}
                disabled={saving}
                aria-label="Close form"
              >
                <LuX size={18} />
              </button>
            </div>

            {/* Quick Category Chips */}
            <div className="sp-quick-roles">
              {QUICK_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`sp-role-chip ${
                    form.service_name.toLowerCase() === role.toLowerCase()
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setForm((current) => ({ ...current, service_name: role }))
                  }
                >
                  {role}
                </button>
              ))}
            </div>

            <div className="sp-sheet-fields">
              <label>
                <span className="sp-label-row">
                  <LuWrench size={14} />
                  <span>Service name</span>
                </span>
                <input
                  name="service_name"
                  value={form.service_name}
                  onChange={handleChange}
                  placeholder="e.g. Electrician"
                  required
                />
              </label>

              <label>
                <span className="sp-label-row">
                  <LuUser size={14} />
                  <span>Contact person</span>
                </span>
                <input
                  name="contact_person"
                  value={form.contact_person}
                  onChange={handleChange}
                  placeholder="Provider's name"
                />
              </label>

              <label>
                <span className="sp-label-row">
                  <LuPhone size={14} />
                  <span>Contact number</span>
                </span>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Mobile number"
                  required
                />
              </label>

              <label>
                <span className="sp-label-row">
                  <LuFileText size={14} />
                  <span>Description</span>
                </span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Optional details (e.g. Available 9 AM – 8 PM)"
                />
              </label>
            </div>

            {error && (
              <p className="sp-error-banner" role="alert">
                {error}
              </p>
            )}

            {/* Sticky Bottom Sheet Action Bar */}
            <div className="sp-sheet-footer">
              <button
                type="button"
                className="sp-sheet-cancel"
                onClick={() => setShowForm(false)}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="sp-sheet-submit"
                disabled={saving}
              >
                <span>
                  {saving
                    ? "Saving..."
                    : editingProvider
                    ? "Save Changes"
                    : "Add Provider"}
                </span>
                {!saving && <LuCheck size={17} strokeWidth={2.5} />}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

export default ServiceProviders;