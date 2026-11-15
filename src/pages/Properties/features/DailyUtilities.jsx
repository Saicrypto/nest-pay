import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LuArrowLeft,
  LuPlus,
  LuZap,
  LuX,
  LuPhone,
  LuUser,
  LuFileText,
  LuPencil,
  LuTrash2,
  LuCheck,
} from "react-icons/lu";
import PropertyManagementService from "../services/PropertyManagementService";
import "../styles/DailyUtilities.css";

const emptyForm = {
  utility_name: "",
  contact_person: "",
  phone: "",
  description: "",
};

const QUICK_UTILITIES = [
  "Water Supplier",
  "Electricity Board",
  "Gas Agency",
  "Broadband / Wi-Fi",
  "Garbage Collection",
  "Generator / Diesel",
];

export default function DailyUtilities() {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const [providers, setProviders] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  async function loadUtilities() {
    try {
      setError("");
      const data =
        await PropertyManagementService.getUtilityProviders(propertyId);
      setProviders(data);
    } catch (err) {
      setError(err.message || "Unable to load utilities.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUtilities();
  }, [propertyId]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEditForm(provider) {
    setEditingId(provider.id);
    setForm({
      utility_name: provider.utility_name || "",
      contact_person: provider.contact_person || "",
      phone: provider.phone || "",
      description: provider.description || "",
    });
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = { ...form, property_id: propertyId };

      if (editingId) {
        await PropertyManagementService.updateUtilityProvider(
          editingId,
          form
        );
      } else {
        await PropertyManagementService.addUtilityProvider(payload);
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await loadUtilities();
    } catch (err) {
      setError(err.message || "Unable to save utility.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this utility provider?")) return;

    try {
      setError("");
      await PropertyManagementService.deleteUtilityProvider(id);
      await loadUtilities();
    } catch (err) {
      setError(err.message || "Unable to delete utility.");
    }
  }

  // Dynamic filter pills derived from existing utility providers
  const filterCategories = [
    "All",
    ...Array.from(
      new Set(
        providers
          .map((p) => (p.utility_name || "").trim())
          .filter(Boolean)
      )
    ),
  ];

  const filteredProviders =
    activeFilter === "All"
      ? providers
      : providers.filter(
          (p) =>
            (p.utility_name || "").trim().toLowerCase() ===
            activeFilter.toLowerCase()
        );

  return (
    <main className="daily-utilities-page">
      {/* Sticky Light-Canvas Top Bar */}
      <header className="du-topbar">
        <button
          className="daily-utilities-back"
          type="button"
          onClick={() => navigate(`/properties/${propertyId}`)}
        >
          <span className="du-back-circle">
            <LuArrowLeft size={16} />
          </span>
          <span>Properties</span>
        </button>

        <div className="du-brand-badge">
          <span className="du-brand-mark">N</span>
          <span>Nest Pay</span>
        </div>
      </header>

      {/* Hero Title + Active Utility Pill */}
      <div className="daily-utilities-header">
        <div>
          <h1>Daily Utilities</h1>
          <p>Manage utility providers for this property.</p>
        </div>

        <span className="du-count-pill">
          {providers.length} {providers.length === 1 ? "Utility" : "Utilities"}
        </span>
      </div>

      {/* Section Header & + Add Utility CTA */}
      <section className="daily-utilities-section">
        <div className="daily-utilities-section-header">
          <h2>Utilities</h2>
          <button
            className="daily-utilities-add"
            type="button"
            onClick={openAddForm}
          >
            <LuPlus size={16} strokeWidth={2.5} /> Add Utility
          </button>
        </div>

        {/* Category Filter Pills */}
        {providers.length > 0 && (
          <div className="du-filter-row" role="tablist">
            {filterCategories.map((category) => (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={activeFilter === category}
                className={`du-filter-pill ${
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
          <p className="du-error-banner" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="du-loading-text">Loading utilities...</p>
        ) : filteredProviders.length === 0 ? (
          <div className="du-empty-card">
            <div className="du-empty-icon">
              <LuZap size={26} />
            </div>
            <h3>No utility providers added yet</h3>
            <p>
              Add water suppliers, electricity boards, gas agencies, and internet contacts.
            </p>
          </div>
        ) : (
          <div className="du-cards-list">
            {filteredProviders.map((provider) => (
              <article className="daily-utility-card" key={provider.id}>
                <div className="du-card-top">
                  <div className="du-card-icon">
                    <LuZap size={20} />
                  </div>

                  <div className="du-card-info">
                    <div className="du-card-title-row">
                      <h3>{provider.utility_name}</h3>
                    </div>

                    <p className="du-card-person">
                      {provider.contact_person || "Contact not provided"}
                    </p>

                    <p className="du-card-phone">{provider.phone}</p>

                    {provider.description && (
                      <p className="du-card-desc">{provider.description}</p>
                    )}
                  </div>
                </div>

                <div className="daily-utility-actions">
                  {provider.phone && (
                    <a
                      href={`tel:${provider.phone}`}
                      className="du-action-btn du-call-btn"
                    >
                      <LuPhone size={14} />
                      <span>Call</span>
                    </a>
                  )}

                  <button
                    type="button"
                    className="du-action-btn du-edit-btn"
                    onClick={() => openEditForm(provider)}
                  >
                    <LuPencil size={14} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    className="du-action-btn du-delete-btn"
                    onClick={() => handleDelete(provider.id)}
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
          className="daily-utilities-overlay"
          role="presentation"
          onClick={() => !saving && setShowForm(false)}
        >
          <form
            className="daily-utilities-form"
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Grab Handle */}
            <div className="du-sheet-handle-wrap">
              <span className="du-sheet-handle" />
            </div>

            {/* Sheet Header */}
            <div className="du-sheet-header">
              <div>
                <span className="du-sheet-eyebrow">
                  {editingId ? "UPDATE UTILITY" : "NEW UTILITY"}
                </span>
                <h2>{editingId ? "Edit Utility" : "Add Utility"}</h2>
              </div>

              <button
                type="button"
                className="du-sheet-close"
                onClick={() => setShowForm(false)}
                disabled={saving}
                aria-label="Close form"
              >
                <LuX size={18} />
              </button>
            </div>

            {/* Quick Utility Chips */}
            <div className="du-quick-roles">
              {QUICK_UTILITIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`du-role-chip ${
                    form.utility_name.toLowerCase() === item.toLowerCase()
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setForm((current) => ({ ...current, utility_name: item }))
                  }
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="du-sheet-fields">
              <label>
                <span className="du-label-row">
                  <LuZap size={14} />
                  <span>Utility name</span>
                </span>
                <input
                  name="utility_name"
                  placeholder="e.g. Water supplier"
                  value={form.utility_name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                <span className="du-label-row">
                  <LuUser size={14} />
                  <span>Contact person</span>
                </span>
                <input
                  name="contact_person"
                  placeholder="Contact person"
                  value={form.contact_person}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span className="du-label-row">
                  <LuPhone size={14} />
                  <span>Phone number</span>
                </span>
                <input
                  name="phone"
                  type="tel"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                <span className="du-label-row">
                  <LuFileText size={14} />
                  <span>Description</span>
                </span>
                <textarea
                  name="description"
                  placeholder="Optional details (e.g. Tanker delivery hours or meter ID)"
                  value={form.description}
                  onChange={handleChange}
                />
              </label>
            </div>

            {error && (
              <p className="du-error-banner" role="alert">
                {error}
              </p>
            )}

            {/* Sticky Bottom Sheet Action Bar */}
            <div className="du-sheet-footer">
              <button
                type="button"
                className="du-sheet-cancel"
                onClick={() => setShowForm(false)}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="du-sheet-submit"
                disabled={saving}
              >
                <span>
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Save Changes"
                    : "Save Utility"}
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