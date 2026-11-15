
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../../src/lib/supabase";
import { useTenant } from "../../../context/TenantContext";
import "../styles/TenantOnboarding.css";

function TenantOnboarding() {
  const {
    property,
    unit,
    deviceToken,
    completeOnboarding,
  } = useTenant();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    family_members: "",
    profession: "",
    age: "",
    phone: "",
    email: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!deviceToken) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    if (
      !formData.full_name.trim() ||
      !formData.phone.trim() ||
      !formData.family_members ||
      !formData.age
    ) {
      setError("Please complete all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      const { data, error: requestError } =
        await supabase.functions.invoke(
          "complete-tenant-onboarding",
          {
            body: {
              device_token: deviceToken,
              ...formData,
            },
          }
        );

      if (requestError) throw requestError;

      if (!data?.success) {
        throw new Error(
          data?.error || "Unable to complete registration."
        );
      }

      completeOnboarding({
        id: data.tenant_id,
        ...formData,
      });

      navigate("/tenant/home", { replace: true });
    } catch (err) {
      console.error("Tenant onboarding failed:", err);
      setError(
        err?.context?.error ||
        err?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!property || !unit) {
    return <p>Unable to load apartment details. Please log in again.</p>;
  }

  return (
    <main className="tenant-details-page">
      <header className="tenant-details-brand">
        <span>N</span>
        <strong>Nest Pay</strong>
      </header>

      <section className="tenant-details-intro">
        <p className="tenant-details-eyebrow">TENANT REGISTRATION</p>
        <h1>Let's get to know you</h1>
        <p>
          Please provide your details to complete your registration at{" "}
          <strong>{property.property_name}</strong>,{" "}
          <strong>{unit.unit_name}</strong>.
        </p>
      </section>

      <form className="tenant-registration-form" onSubmit={handleSubmit}>
        <label>
          Full name *
          <input
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </label>

        <label>
          Number of family members *
          <input
            type="number"
            name="family_members"
            min="1"
            value={formData.family_members}
            onChange={handleChange}
            placeholder="Including yourself"
            required
          />
        </label>

        <label>
          Profession
          <input
            name="profession"
            value={formData.profession}
            onChange={handleChange}
            placeholder="e.g. Software Engineer"
          />
        </label>

        <label>
          Age *
          <input
            type="number"
            name="age"
            min="18"
            max="120"
            value={formData.age}
            onChange={handleChange}
            placeholder="Enter your age"
            required
          />
        </label>

        <label>
          Phone number *
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            required
          />
        </label>

        <label>
          Email address
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
          />
        </label>

        {error && <p className="tenant-details-error">{error}</p>}

        <button
          type="submit"
          className="tenant-details-submit"
          disabled={submitting}
        >
          {submitting ? "Registering..." : "Complete Registration"}
        </button>

        <p className="tenant-details-privacy">
          Your information will be shared securely with your property owner.
        </p>
      </form>
    </main>
  );
}

export default TenantOnboarding;
