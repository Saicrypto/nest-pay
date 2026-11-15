import { useNavigate } from "react-router-dom";
import { useTenant } from "../../../context/TenantContext";
import {
  LuHouse,
  LuWrench,
  LuDroplet,
  LuMessageSquare,
  LuWallet,
  LuUserRound,
  LuBuilding2,
} from "react-icons/lu";
import "../styles/TenantHome.css";
import NotificationBell from "../../../components/NotificationBell/NotificationBell";
import TenantHomeSkeleton from "../components/TenantHomeSkeleton";

function TenantHome() {
  const { property, unit, tenant, loading } = useTenant();
  const navigate = useNavigate();

  if (loading) {
    return <TenantHomeSkeleton />;
  }

  const currentDate = new Date();
  const rentMonth = currentDate.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });

  const tenantName = tenant?.full_name?.split(" ")[0] || "there";
  const rentAmount = Number(unit?.monthly_rent || 0);

  const shortcuts = [
    {
      label: "Services",
      sublabel: "Vendors & help",
      icon: <LuWrench size={19} />,
      iconClass: "services",
      path: "/tenant/services",
    },
    {
      label: "Daily Utilities",
      sublabel: "Water & power",
      icon: <LuDroplet size={19} />,
      iconClass: "utilities",
      path: "/tenant/services",
    },
    {
      label: "Complaints",
      sublabel: "Raise ticket",
      icon: <LuMessageSquare size={19} />,
      iconClass: "complaints",
      path: "/tenant/complaints",
    },
  ];

  const navigation = [
    { label: "Home", icon: <LuHouse size={18} />, path: "/tenant/home" },
    { label: "Payments", icon: <LuWallet size={18} />, path: "/tenant/payments" },
    { label: "Services", icon: <LuWrench size={18} />, path: "/tenant/services" },
    {
      label: "Complaints",
      icon: <LuMessageSquare size={18} />,
      path: "/tenant/complaints",
    },
    { label: "Profile", icon: <LuUserRound size={18} />, path: "/tenant/profile" },
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
            <LuBuilding2 size={18} className="tenant-rent-watermark" />
          </span>
        </div>

        <h2>
          {rentAmount.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          })}
        </h2>

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
              onClick={() => navigate(item.path)}
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

      {/* Floating Pill Bottom Navigation Bar */}
      <nav className="tenant-bottom-navigation" aria-label="Tenant navigation">
        {navigation.map((item) => {
          const active = item.label === "Home";

          return (
            <button
              type="button"
              key={item.label}
              className={active ? "active" : ""}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              {active && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </main>
  );
}

export default TenantHome;