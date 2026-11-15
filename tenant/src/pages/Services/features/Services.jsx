import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  LuPlus,
  LuWrench,
  LuDroplet,
  LuX,
  LuUserRound,
} from "react-icons/lu";
import { useTenant } from "../../../context/TenantContext";
import TenantPropertyService from "../../../services/TenantPropertyService";
import ProviderCard from "../components/ProviderCard";
import "../styles/Services.css";
import ServicesSkeleton from "../components/ServicesSkeleton";
import { getServicesCache, setServicesCache } from "../cache/servicesCache";

const initialForm = {
  contact_name: "",
  contact_person: "",
  phone: "",
  description: "",
};

export default function Services() {
  const { deviceToken } = useTenant();
  const location = useLocation();

  const [serviceProviders, setServiceProviders] = useState([]);
  const [utilityProviders, setUtilityProviders] = useState([]);
  const [tenantContacts, setTenantContacts] = useState([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState(
    location.state?.tab === "utility" ? "utility" : "service"
  );

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [editingContact, setEditingContact] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (location.state?.tab === "utility" || location.state?.tab === "service") {
      setActiveTab(location.state.tab);
    }
  }, [location.state?.tab]);

  useEffect(() => {
    let mounted = true;

    async function loadServices() {
      if (!deviceToken) {
        setLoading(false);
        return;
      }

      const cachedData = getServicesCache(deviceToken);

      if (cachedData) {
        setServiceProviders(cachedData.serviceProviders);
        setUtilityProviders(cachedData.utilityProviders);
        setTenantContacts(cachedData.tenantContacts);
        setLoading(false);
      } else {
        setLoading(true);
      }

      try {
        setError("");

        const data =
          await TenantPropertyService.getPropertyServices(deviceToken);

        if (!mounted) return;

        const freshData = {
          serviceProviders: data.serviceProviders || [],
          utilityProviders: data.utilityProviders || [],
          tenantContacts: data.tenantContacts || [],
        };

        setServiceProviders(freshData.serviceProviders);
        setUtilityProviders(freshData.utilityProviders);
        setTenantContacts(freshData.tenantContacts);

        setServicesCache(deviceToken, freshData);
      } catch (err) {
        if (mounted) {
          console.error("Services loading error:", err);

          if (!cachedData) {
            setError(err.message || "Unable to load property contacts.");
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadServices();

    return () => {
      mounted = false;
    };
  }, [deviceToken]);

  function updateTenantContacts(nextContacts) {
    setTenantContacts(nextContacts);

    setServicesCache(deviceToken, {
      serviceProviders,
      utilityProviders,
      tenantContacts: nextContacts,
    });
  }

  const providerType = activeTab === "service" ? "service" : "utility";

  const providers =
    activeTab === "service" ? serviceProviders : utilityProviders;

  const myProviders = tenantContacts.filter(
    (contact) => contact.contact_type === providerType
  );

  function openAddForm() {
    setForm(initialForm);
    setError("");
    setSuccessMessage("");
    setShowAddForm(true);
    setEditingContact(null);
  }

  function closeAddForm() {
    if (saving) return;

    setShowAddForm(false);
    setForm(initialForm);
    setError("");
    setEditingContact(null);
  }

  function handleInputChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleEditContact(contact) {
    setEditingContact(contact);

    setForm({
      contact_name: contact.contact_name || "",
      contact_person: contact.contact_person || "",
      phone: contact.phone || "",
      description: contact.description || "",
    });

    setActiveTab(contact.contact_type);
    setError("");
    setSuccessMessage("");
    setShowAddForm(true);
  }

  async function handleUpdateContact(e) {
    e.preventDefault();

    if (!editingContact) return;

    if (!form.contact_name.trim() || !form.phone.trim()) {
      setError("Contact name and phone number are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updatedContact =
        await TenantPropertyService.updateCustomContact(deviceToken, {
          contact_id: editingContact.id,
          contact_type: providerType,
          ...form,
        });

      updateTenantContacts(
        tenantContacts.map((contact) =>
          contact.id === updatedContact.id ? updatedContact : contact
        )
      );

      setEditingContact(null);
      setShowAddForm(false);
      setForm(initialForm);
      setSuccessMessage("Contact updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to update contact.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteContact(contact) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${contact.contact_name}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(contact.id);
      setError("");

      await TenantPropertyService.deleteCustomContact(deviceToken, contact.id);

      updateTenantContacts(
        tenantContacts.filter((item) => item.id !== contact.id)
      );

      setSuccessMessage("Contact deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete contact.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAddContact(e) {
    e.preventDefault();

    if (!form.contact_name.trim() || !form.phone.trim()) {
      setError("Contact name and phone number are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const newContact = await TenantPropertyService.addCustomContact(
        deviceToken,
        {
          ...form,
          contact_type: providerType,
        }
      );

      updateTenantContacts([newContact, ...tenantContacts]);

      setForm(initialForm);
      setShowAddForm(false);
      setSuccessMessage("Contact added successfully.");
    } catch (err) {
      setError(err.message || "Unable to add contact.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <ServicesSkeleton />;
  }

  return (
    <main className="tenant-services-page">
      {/* Full-Bleed Top Curved Burnt-Orange Hero Header */}
      <header className="tenant-services-header">
        <div>
          <h1>Services</h1>
          <p>Find useful contacts for your property.</p>
        </div>

        <button
          type="button"
          className="tenant-add-contact-btn"
          onClick={openAddForm}
        >
          <LuPlus size={16} />
          <span>Add My Own</span>
        </button>
      </header>

      {/* Overlapping Floating Segmented Category Capsule */}
      <div className="tenant-services-tabs-wrap">
        <div className="tenant-services-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "service"}
            className={activeTab === "service" ? "active" : ""}
            onClick={() => setActiveTab("service")}
          >
            <LuWrench size={15} />
            <span>Service Providers</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "utility"}
            className={activeTab === "utility" ? "active" : ""}
            onClick={() => setActiveTab("utility")}
          >
            <LuDroplet size={15} />
            <span>Daily Utilities</span>
          </button>
        </div>
      </div>

      {error && !showAddForm && (
        <p className="tenant-services-error" role="alert">
          {error}
        </p>
      )}

      {successMessage && (
        <p className="tenant-contact-success" role="status">
          {successMessage}
        </p>
      )}

      <section className="tenant-services-section">
        {/* Property-provided contacts */}
        <div className="ts-group-block">
          <div className="ts-group-heading">
            <h2>
              {activeTab === "service"
                ? "Property Service Providers"
                : "Property Daily Utilities"}
            </h2>
            <span className="ts-count-pill">{providers.length}</span>
          </div>

          {providers.length === 0 ? (
            <div className="ts-empty-card">
              <p>
                No{" "}
                {activeTab === "service"
                  ? "service providers"
                  : "daily utilities"}{" "}
                added by your property owner yet.
              </p>
            </div>
          ) : (
            <div className="tenant-services-list">
              {providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  type={providerType}
                />
              ))}
            </div>
          )}
        </div>

        {/* Separate My Contacts section */}
        <div className="tenant-my-contacts-section">
          <div className="tenant-my-contacts-divider" />

          <div className="ts-group-heading">
            <h2>My Contacts</h2>
            <span className="ts-count-pill">{myProviders.length}</span>
          </div>

          {myProviders.length === 0 ? (
            <div className="ts-empty-card">
              <span className="ts-empty-icon">
                <LuUserRound size={20} />
              </span>
              <p>You haven't added any personal contacts yet.</p>
              <button
                type="button"
                className="ts-empty-add-btn"
                onClick={openAddForm}
              >
                <LuPlus size={14} />
                <span>Add your first contact</span>
              </button>
            </div>
          ) : (
            <div className="tenant-services-list">
              {myProviders.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  type={providerType}
                  isCustom
                  deleting={deletingId === provider.id}
                  onEdit={handleEditContact}
                  onDelete={handleDeleteContact}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Add / Edit Custom Contact Slide-Up Bottom Sheet */}
      {showAddForm && (
        <div
          className="tenant-add-contact-modal"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              closeAddForm();
            }
          }}
        >
          <div
            className="tenant-add-contact-form"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tenant-contact-modal-title"
          >
            <div className="ts-sheet-handle-wrap">
              <span className="ts-sheet-handle" />
            </div>

            <div className="tenant-add-contact-heading">
              <div>
                <p className="ts-modal-eyebrow">PERSONAL DIRECTORY</p>
                <h2 id="tenant-contact-modal-title">
                  {editingContact ? "Edit Contact" : "Add Your Own Contact"}
                </h2>
                <p>Add a contact that you want to keep handy.</p>
              </div>

              <button
                type="button"
                className="ts-modal-close"
                onClick={closeAddForm}
                disabled={saving}
                aria-label="Close"
              >
                <LuX size={18} />
              </button>
            </div>

            <form
              onSubmit={editingContact ? handleUpdateContact : handleAddContact}
            >
              <label>Contact category</label>

              <div className="tenant-contact-category">
                <button
                  type="button"
                  className={providerType === "service" ? "active" : ""}
                  onClick={() => {
                    setActiveTab("service");
                    setError("");
                  }}
                >
                  <LuWrench size={14} />
                  <span>Service Provider</span>
                </button>

                <button
                  type="button"
                  className={providerType === "utility" ? "active" : ""}
                  onClick={() => {
                    setActiveTab("utility");
                    setError("");
                  }}
                >
                  <LuDroplet size={14} />
                  <span>Daily Utility</span>
                </button>
              </div>

              <label htmlFor="contact_name">Contact / Business Name *</label>
              <input
                id="contact_name"
                name="contact_name"
                value={form.contact_name}
                onChange={handleInputChange}
                placeholder="e.g. ABC Plumbing Services"
                maxLength={100}
                required
              />

              <label htmlFor="contact_person">Contact Person</label>
              <input
                id="contact_person"
                name="contact_person"
                value={form.contact_person}
                onChange={handleInputChange}
                placeholder="Person's name"
                maxLength={100}
              />

              <label htmlFor="phone">Phone Number *</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                maxLength={20}
                required
              />

              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleInputChange}
                placeholder="What service do they provide?"
                maxLength={500}
                rows={3}
              />

              {error && (
                <p role="alert" className="tenant-contact-error">
                  {error}
                </p>
              )}

              <div className="tenant-contact-form-actions">
                <button
                  type="button"
                  onClick={closeAddForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button type="submit" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingContact
                    ? "Update Contact"
                    : "Save Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}