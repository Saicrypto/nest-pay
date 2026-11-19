import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "../../../../src/lib/supabase";
import { useTenant } from "../../../context/TenantContext";
import "../styles/TenantOnboarding.css";

function TenantOnboarding() {
  const {
    property,
    unit,
    deviceToken,
    loading,
    isAuthenticated,
    onboardingCompleted,
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

  if (loading) {
    return (
      <main className="tenant-details-page">
        <p>Loading your apartment details...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/tenant/login" replace />;
  }

  if (onboardingCompleted) {
    return <Navigate to="/tenant/home" replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    setError("");

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
      setError("Please enter a valid phone number.");
      return;
    }

    const familyMembers = Number(formData.family_members);
    const age = Number(formData.age);

    if (!Number.isInteger(familyMembers) || familyMembers < 1 || familyMembers > 50) {
      setError("Please enter a valid number of family members.");
      return;
    }

    if (!Number.isInteger(age) || age < 18 || age > 120) {
      setError("Age must be between 18 and 120.");
      return;
    }

    setSubmitting(true);

    try {
      const normalizedPayload = {
        full_name: cleanName,
        family_members: familyMembers,
        profession: cleanProfession,
        age,
        phone: cleanPhone,
        email: cleanEmail,
      };

      const { data, error: requestError } =
        await supabase.functions.invoke(
          "complete-tenant-onboarding",
          {
            body: {
              ...normalizedPayload,
              device_token: deviceToken,
            },
          }
        );

      if (requestError) {
        let message = requestError.message || "Unable to complete registration.";
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

      if (!data?.success) {
        throw new Error(
          data?.error || "Unable to complete registration."
        );
      }

      completeOnboarding(
        data.tenant ?? {
          id: data.tenant_id,
          ...normalizedPayload,
        }
      );

      navigate("/tenant/home", { replace: true });
    } catch (err) {
      console.error("Tenant onboarding failed:", err);
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!property || !unit) {
    return (
      <main className="tenant-details-page">
        <p>Unable to load apartment details. Please log in again.</p>
        <button
          type="button"
          onClick={() => navigate("/tenant/login", { replace: true })}
        >
          Back to login
        </button>
      </main>
    );
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
          <strong>{property.property_name || "your property"}</strong>,{" "}
          <strong>{unit.unit_name || "your flat"}</strong>.
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
            maxLength={100}
            disabled={submitting}
            required
          />
        </label>

        <label>
          Number of family members *
          <input
            type="number"
            name="family_members"
            min="1"
            max="50"
            value={formData.family_members}
            onChange={handleChange}
            placeholder="Including yourself"
            disabled={submitting}
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
            maxLength={100}
            disabled={submitting}
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
            disabled={submitting}
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
            maxLength={20}
            disabled={submitting}
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
            maxLength={254}
            disabled={submitting}
          />
        </label>

        {error && (
          <p className="tenant-details-error" role="alert">
            {error}
          </p>
        )}

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