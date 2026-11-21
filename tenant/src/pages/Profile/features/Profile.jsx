import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../../src/lib/supabase";
import { useTenant } from "../../../context/TenantContext";
import { clearServicesCache } from "../../Services/cache/servicesCache";
import {
  LuUserRound,
  LuBuilding2,
  LuChevronRight,
  LuShieldCheck,
  LuHeadset,
  LuLogOut,
  LuX,
  LuPencil,
  LuArrowLeft,
  LuFileText,
} from "react-icons/lu";

import "../styles/Profile.css";

const initialForm = {
  full_name: "",
  family_members: "",
  profession: "",
  age: "",
  phone: "",
  email: "",
};

export default function TenantProfile() {
  const navigate = useNavigate();

  const {
    tenant,
    setTenant,
    property,
    unit,
    deviceToken,
    logout,
  } = useTenant();

  const [showPersonalDetails, setShowPersonalDetails] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (tenant) {
      setFormData({
        full_name: tenant.full_name || "",
        family_members: tenant.family_members ?? "",
        profession: tenant.profession || "",
        age: tenant.age ?? "",
        phone: tenant.phone || "",
        email: tenant.email || "",
      });
    }
  }, [tenant]);

  function openPersonalDetails() {
    setFormData({
      full_name: tenant?.full_name || "",
      family_members: tenant?.family_members ?? "",
      profession: tenant?.profession || "",
      age: tenant?.age ?? "",
      phone: tenant?.phone || "",
      email: tenant?.email || "",
    });

    setEditing(false);
    setError("");
    setSuccess("");
    setShowPersonalDetails(true);
  }

  function closePersonalDetails() {
    if (saving) return;

    setShowPersonalDetails(false);
    setEditing(false);
    setError("");
    setSuccess("");
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function startEditing() {
    setEditing(true);
    setError("");
    setSuccess("");
  }

  function cancelEditing() {
    setFormData({
      full_name: tenant?.full_name || "",
      family_members: tenant?.family_members ?? "",
      profession: tenant?.profession || "",
      age: tenant?.age ?? "",
      phone: tenant?.phone || "",
      email: tenant?.email || "",
    });

    setEditing(false);
    setError("");
  }

async function handleSave(event) {
    event.preventDefault();
    if (saving) return;

    setError("");
    setSuccess("");

    if (!deviceToken) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    const cleanName = formData.full_name.trim();
    const cleanPhone = formData.phone.trim();
    const cleanProfession = formData.profession.trim();
    const cleanEmail = formData.email.trim();

    if (
      !cleanName ||
      !cleanPhone ||
      formData.family_members === "" ||
      formData.age === ""
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (!/^[+\d\s()-]{7,20}$/.test(cleanPhone)) {
      setError("Enter a valid phone number.");
      return;
    }

    const familyMembers = Number(formData.family_members);
    const age = Number(formData.age);

    if (!Number.isInteger(familyMembers) || familyMembers < 1 || familyMembers > 50) {
      setError("Enter a valid number of family members.");
      return;
    }

    if (!Number.isInteger(age) || age < 18 || age > 120) {
      setError("Enter a valid age.");
      return;
    }

    setSaving(true);

    try {
      const { data, error: requestError } =
        await supabase.functions.invoke("complete-tenant-onboarding", {
          body: {
            device_token: deviceToken,
            action: "update_profile",
            full_name: cleanName,
            family_members: familyMembers,
            profession: cleanProfession,
            age,
            phone: cleanPhone,
            email: cleanEmail,
          },
        });

      if (requestError) {
        let message = requestError.message || "Unable to update your details.";
        try {
          if (
            requestError.context &&
            typeof requestError.context.json === "function"
          ) {
            const payload = await requestError.context.json();
            if (payload?.error) message = payload.error;
          }
        } catch {
          // Keep fallback message
        }
        throw new Error(message);
      }

      if (!data?.success || !data?.tenant) {
        throw new Error(data?.error || "Unable to update your details.");
      }

      setTenant(data.tenant);
      setEditing(false);
      setSuccess("Your details have been updated.");
    } catch (err) {
      console.error("Profile update failed:", err);
      setError(err?.message || "Unable to update your details.");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    clearServicesCache(deviceToken);
    logout();
    navigate("/tenant/login", { replace: true });
  }

  const initials = (tenant?.full_name || "T")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  const personalFields = [
    { label: "Full name", name: "full_name", required: true, type: "text" },
    {
      label: "Family members",
      name: "family_members",
      required: true,
      type: "number",
    },
    { label: "Profession", name: "profession", required: false, type: "text" },
    { label: "Age", name: "age", required: true, type: "number" },
    { label: "Phone number", name: "phone", required: true, type: "tel" },
    { label: "Email address", name: "email", required: false, type: "email" },
  ];

  return (
    <main className="tenant-profile-page">
      {/* Full-Bleed Top Curved Burnt-Orange Hero Header */}
      <header className="tenant-profile-header">
        <h1>Profile</h1>
        <p>Manage your account and personal information.</p>
      </header>

      {/* Overlapping Resident Identity Capsule Card */}
      <section className="tenant-profile-identity">
        <div className="tenant-profile-avatar">{initials || "T"}</div>

        <div className="tenant-profile-identity-info">
          <div className="tp-identity-top">
            <h2>{tenant?.full_name || "Tenant"}</h2>
            <span className="tp-resident-badge">
              <LuShieldCheck size={12} />
              <span>Resident</span>
            </span>
          </div>

          <p>
            {unit?.unit_name || "Your Flat"}
            {unit?.bedrooms ? ` · ${unit.bedrooms} BHK` : ""}
            {property?.property_name ? ` · ${property.property_name}` : ""}
          </p>
        </div>
      </section>

      {/* Profile Options Bento Card */}
<section className="tenant-profile-options">
     <button
       type="button"
       className="tenant-profile-option"
       onClick={openPersonalDetails}
     >
       <div className="tenant-profile-option-icon">
         <LuUserRound size={18} />
       </div>

       <div className="tenant-profile-option-info">
         <strong>Your Personal Details</strong>
         <span>View and edit your information</span>
       </div>

       <LuChevronRight size={17} className="tenant-profile-chevron" />
     </button>

     <button
       type="button"
       className="tenant-profile-option tenant-property-card"
       onClick={() => navigate("/tenant/flat-details")}
     >
       <div className="tenant-profile-option-icon tenant-property-icon">
         <LuBuilding2 size={18} />
       </div>

       <div className="tenant-profile-option-info tenant-property-info">
         <strong>{property?.property_name || "Your Property"}</strong>
         <span>
           {unit?.unit_name || "Flat"}
           {unit?.bedrooms ? ` · ${unit.bedrooms} BHK` : ""}
         </span>
       </div>

       <LuChevronRight size={17} className="tenant-profile-chevron" />
     </button>

     <a
       href="mailto:support@nestpay.in?subject=Nest%20Pay%20Tenant%20Support"
       className="tenant-profile-option"
       style={{ textDecoration: "none" }}
     >
       <div className="tenant-profile-option-icon">
         <LuHeadset size={18} />
       </div>

       <div className="tenant-profile-option-info">
         <strong>Help &amp; Support</strong>
         <span>support@nestpay.in</span>
       </div>

       <LuChevronRight size={17} className="tenant-profile-chevron" />
     </a>

     <button
       type="button"
       className="tenant-profile-option"
       onClick={() => navigate("/privacy-policy")}
     >
       <div className="tenant-profile-option-icon">
         <LuShieldCheck size={18} />
       </div>

       <div className="tenant-profile-option-info">
         <strong>Privacy Policy</strong>
         <span>How we collect, use, and protect your data</span>
       </div>

       <LuChevronRight size={17} className="tenant-profile-chevron" />
     </button>

     <button
       type="button"
       className="tenant-profile-option"
       onClick={() => navigate("/terms-and-conditions")}
     >
       <div className="tenant-profile-option-icon">
         <LuFileText size={18} />
       </div>

       <div className="tenant-profile-option-info">
         <strong>Terms &amp; Conditions</strong>
         <span>Rules and guidelines for using Nest Pay</span>
       </div>

       <LuChevronRight size={17} className="tenant-profile-chevron" />
     </button>
   </section>

      {/* Logout CTA */}
      <button
        type="button"
        className="tenant-profile-logout"
        onClick={handleLogout}
      >
        <LuLogOut size={17} />
        <span>Logout</span>
      </button>

      <p className="tenant-profile-footer">Nest Pay · Resident Account</p>

      {/* Personal Details Slide-Up Bottom Sheet */}
      {showPersonalDetails && (
        <div
          className="tenant-profile-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePersonalDetails();
            }
          }}
        >
          <section
            className="tenant-personal-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tenant-personal-title"
          >
            <div className="tp-sheet-handle-wrap">
              <span className="tp-sheet-handle" />
            </div>

            <div className="tenant-personal-modal-header">
              <button
                type="button"
                className="tenant-modal-back"
                onClick={editing ? cancelEditing : closePersonalDetails}
                disabled={saving}
                aria-label="Back"
              >
                {editing ? <LuArrowLeft size={16} /> : <LuX size={17} />}
              </button>

              <div>
                <p className="tp-modal-eyebrow">RESIDENT DIRECTORY</p>
                <h2 id="tenant-personal-title">Your Personal Details</h2>
                <p>
                  {editing
                    ? "Update your personal information."
                    : "Your registered information."}
                </p>
              </div>
            </div>

            {editing ? (
              <form onSubmit={handleSave} className="tenant-personal-form">
                {personalFields.map((field) => (
                  <label key={field.name}>
                    {field.label}
                    {field.required ? " *" : ""}

                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      min={
                        field.name === "age"
                          ? 18
                          : field.name === "family_members"
                          ? 1
                          : undefined
                      }
                      max={field.name === "age" ? 120 : undefined}
                      required={field.required}
                    />
                  </label>
                ))}

                {error && (
                  <p className="tenant-profile-error" role="alert">
                    {error}
                  </p>
                )}

                <div className="tenant-personal-actions">
                  <button
                    type="button"
                    className="tenant-profile-cancel"
                    onClick={cancelEditing}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="tenant-profile-save"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="tenant-personal-fields">
                  {personalFields.map((field) => (
                    <div className="tenant-personal-field" key={field.name}>
                      <span>{field.label}</span>
                      <strong>{tenant?.[field.name] || "Not provided"}</strong>
                    </div>
                  ))}
                </div>

                {success && (
                  <p className="tenant-profile-success" role="status">
                    {success}
                  </p>
                )}

                <button
                  type="button"
                  className="tenant-profile-save tenant-profile-edit"
                  onClick={startEditing}
                >
                  <LuPencil size={15} />
                  <span>Edit Details</span>
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}