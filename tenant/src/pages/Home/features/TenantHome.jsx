import { Navigate, useNavigate } from "react-router-dom";
import { useTenant } from "../../../context/TenantContext";
import {
  LuWrench,
  LuDroplet,
  LuMessageSquare,
  LuBuilding2,
} from "react-icons/lu";
import "../styles/TenantHome.css";
import NotificationBell from "../../../components/NotificationBell/NotificationBell";
import TenantHomeSkeleton from "../components/TenantHomeSkeleton";

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatCurrency(value) {
  const parsed = Number(value);
  return inrFormatter.format(Number.isFinite(parsed) && parsed >= 0 ? parsed : 0);
}

function TenantHome() {
  const {
    property,
    unit,
    tenant,
    loading,
    isAuthenticated,
    onboardingCompleted,
  } = useTenant();
  const navigate = useNavigate();

  if (loading) {
    return <TenantHomeSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/tenant/login" replace />;
  }

  if (!onboardingCompleted) {
    return <Navigate to="/tenant/welcome" replace />;
  }

  const currentDate = new Date();
  const rentMonth = currentDate.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });

  const tenantName =
    String(tenant?.full_name ?? "").trim().split(/\s+/)[0] || "there";
  const rentAmount = Number(unit?.monthly_rent);

  const shortcuts = [
    {
      label: "Services",
      sublabel: "Vendors & help",
      icon: <LuWrench size={19} aria-hidden="true" />,
      iconClass: "services",
      path: "/tenant/services",
      state: { tab: "service" },
    },
    {
      label: "Daily Utilities",
      sublabel: "Water & power",
      icon: <LuDroplet size={19} aria-hidden="true" />,
      iconClass: "utilities",
      path: "/tenant/services",
      state: { tab: "utility" },
    },
    {
      label: "Complaints",
      sublabel: "Raise ticket",
      icon: <LuMessageSquare size={19} aria-hidden="true" />,
      iconClass: "complaints",
      path: "/tenant/complaints",
    },
  ];

  return (
    <main className="tenant-home-page">
      {/* Full-Bleed Curved Burnt-Orange Hero Header */}
      <div className="th-hero-backdrop">
        <header className="tenant-home-header">
          <div className="tenant-home-brand">
            <span className="th-brand-mark">N</span>
            <strong>Nest Pay</strong>
          </div>

          <NotificationBell />
        </header>

        <section className="tenant-home-welcome">
          <h1>Welcome, {tenantName} 👋</h1>
          <p>
            {unit?.unit_name || "Your flat"}
            <span> · </span>
            {property?.property_name || "Your property"}
          </p>
        </section>
      </div>

      {/* Overlapping Elevated Monthly Rent Card */}
      <section className="tenant-rent-card">
        <div className="tenant-rent-card-top">
          <span className="th-rent-label">MONTHLY RENT</span>
          <span className="th-rent-icon-badge">
            <LuBuilding2
              size={18}
              className="tenant-rent-watermark"
              aria-hidden="true"
            />
          </span>
        </div>

        <h2>{formatCurrency(rentAmount)}</h2>

        <div className="tenant-rent-card-bottom">
          <span className="th-rent-month">{rentMonth}</span>
          <span className="tenant-rent-status">Pending</span>
        </div>

        <button
          type="button"
          className="tenant-pay-rent-button"
          onClick={() => navigate("/tenant/payments")}
        >
          Pay Rent
        </button>
      </section>

      {/* Quick Actions 3-Column Bento Grid */}
      <section className="th-shortcuts-section">
        <h3 className="th-section-heading">Quick Actions</h3>

        <div className="tenant-home-shortcuts">
          {shortcuts.map((item) => (
            <button
              type="button"
              className="tenant-home-shortcut"
              key={item.label}
              onClick={() =>
                navigate(item.path, item.state ? { state: item.state } : undefined)
              }
            >
              <span className={`th-shortcut-icon ${item.iconClass}`}>
                {item.icon}
              </span>
              <strong>{item.label}</strong>
              <small>{item.sublabel}</small>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

export default TenantHome;