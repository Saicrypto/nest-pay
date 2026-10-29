
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  LuArrowLeft,
  LuCalendarDays,
  LuHouse,
  LuIndianRupee,
  LuMail,
  LuMapPin,
  LuPhone,
  LuShieldCheck,
  LuWrench,
  LuBuilding2,
} from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import { supabase } from "../../../lib/supabase";
import "../styles/TenantDetails.css";
import {
  getTenantDetailsCache,
  setTenantDetailsCache,
} from "../cache/tenantDetailsCache";

function TenantDetails() {
  const { tenantId } = useParams();
  const navigate = useNavigate();

  const [tenant, setTenant] = useState(null);
  const [unit, setUnit] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ownerName, setOwnerName] = useState("Property Owner");


useEffect(() => {
  let active = true;

  async function loadTenantDetails() {
    setLoading(true);
    setError("");

    const cached = getTenantDetailsCache(tenantId);

    if (cached) {
      setTenant(cached.tenant);
      setUnit(cached.unit);
      setProperty(cached.property);
      setOwnerName(cached.ownerName);
      setLoading(false);
      return;
    }

    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData?.user;
      let fetchedOwnerName = "Property Owner";

      if (currentUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (profile?.full_name?.trim()) {
          fetchedOwnerName = profile.full_name.trim();
        }
      }

      const { data, error: tenantError } = await supabase
        .from("tenants")
        .select("id, unit_id, full_name, phone, email, tenant_status")
        .eq("id", tenantId)
        .single();

      if (tenantError) throw tenantError;

      const { data: unitData, error: unitError } = await supabase
        .from("property_units")
        .select(`
          id, property_id, unit_name, floor_number, occupancy_status,
          monthly_rent, security_deposit, maintenance_amount, rent_due_day
        `)
        .eq("id", data.unit_id)
        .single();

      if (unitError) throw unitError;

      const { data: propertyData, error: propertyError } = await supabase
        .from("properties")
        .select("id, property_name, address, city, state")
        .eq("id", unitData.property_id)
        .single();

      if (propertyError) throw propertyError;

      if (active) {
        const result = {
          tenant: data,
          unit: unitData,
          property: propertyData,
          ownerName: fetchedOwnerName,
        };

        setTenant(result.tenant);
        setUnit(result.unit);
        setProperty(result.property);
        setOwnerName(result.ownerName);
        setTenantDetailsCache(tenantId, result);
      }
    } catch (err) {
      if (active) {
        setError(err.message || "Unable to load tenant details.");
      }
    } finally {
      if (active) setLoading(false);
    }
  }

  loadTenantDetails();

  return () => {
    active = false;
  };
}, [tenantId]);


  const handleWhatsAppReminder = () => {
    if (!tenant || !unit || !property) return;

    if (!tenant.phone?.trim()) {
      setError("This tenant does not have a phone number.");
      return;
    }

    let phone = tenant.phone.replace(/\D/g, "");

    if (phone.length === 10) {
      phone = `91${phone}`;
    } else if (phone.length === 11 && phone.startsWith("0")) {
      phone = `91${phone.slice(1)}`;
    }

    if (phone.length < 10 || phone.length > 15) {
      setError("Please check the tenant's phone number and country code.");
      return;
    }

    const rent = Number(unit.monthly_rent || 0).toLocaleString("en-IN");

    const message = [
      `Hello ${tenant.full_name},`,
      "",
      `This is a friendly reminder about your monthly rent for ${property.property_name}, Unit ${unit.unit_name}.`,
      `Monthly rent: ₹${rent}`,
      `Rent due day: ${unit.rent_due_day || "Please confirm with the landlord"}`,
      "",
      "Thank you,",
      ownerName,
      "Nest Pay",
    ].join("\n");

    const whatsappUrl =
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  }

  if (loading) {
    return (
      <main className="tenant-details-page">
        <p className="tenant-details-loading">Loading tenant details...</p>
      </main>
    );
  }

  if (error || !tenant || !unit || !property) {
    return (
      <main className="tenant-details-page">
        <button
          type="button"
          className="tenant-details-back"
          onClick={() => navigate(-1)}
        >
          <LuArrowLeft /> Back
        </button>
        <p className="property-details-error" role="alert">
          {error || "Tenant details could not be found."}
        </p>
      </main>
    );
  }

  const details = [
    {
      label: "Phone",
      value: tenant.phone || "Not provided",
      Icon: LuPhone,
    },
    {
      label: "Email",
      value: tenant.email || "Not provided",
      Icon: LuMail,
    },
    {
      label: "Property",
      value: property.property_name,
      Icon: LuHouse,
    },
    {
      label: "Unit",
      value: `${unit.unit_name}${unit.floor_number == null ? "" : ` · Floor ${unit.floor_number}`}`,
      Icon: LuBuilding2,
    },
    {
      label: "Monthly rent",
      value: formatCurrency(unit.monthly_rent),
      Icon: LuIndianRupee,
    },
    {
      label: "Security deposit",
      value: formatCurrency(unit.security_deposit),
      Icon: LuShieldCheck,
    },
    {
      label: "Monthly maintenance",
      value: formatCurrency(unit.maintenance_amount),
      Icon: LuWrench,
    },
    {
      label: "Rent due day",
      value: unit.rent_due_day
        ? `${unit.rent_due_day} of every month`
        : "Not set",
      Icon: LuCalendarDays,
    },
  ];

  return (
    <main className="tenant-details-page">
      <header className="tenant-details-header">
        <button
          type="button"
          className="tenant-details-back"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <LuArrowLeft />
        </button>

        <Link to="/home" className="tenant-details-brand">
          Nest Pay
        </Link>
      </header>

      <section className="tenant-details-card">
        <p className="tenant-details-eyebrow">TENANT DETAILS</p>
        <h1>{tenant.full_name}</h1>

        {property.address && (
          <p className="tenant-details-property-address">
            <LuMapPin />
            <span>
              {[property.address, property.city, property.state]
                .filter(Boolean)
                .join(", ")}
            </span>
          </p>
        )}

        {tenant.tenant_status === "active" && (
          <button
            type="button"
            className="whatsapp-reminder-button"
            onClick={handleWhatsAppReminder}
          >
            <FaWhatsapp aria-hidden="true" />
            <span>Send WhatsApp Rent Reminder</span>
          </button>
        )}
      </section>

      <section className="tenant-details-grid" aria-label="Tenant information">
        {details.map(({ label, value, Icon }) => (
          <article className="tenant-detail-item" key={label}>
            <span className="tenant-detail-icon" aria-hidden="true">
              <Icon />
            </span>

            <div className="tenant-detail-content">
              <span className="tenant-detail-label">{label}</span>
              <strong className="tenant-detail-value">{value}</strong>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default TenantDetails;
