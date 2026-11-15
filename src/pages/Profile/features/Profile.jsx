import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import AuthService from "../../../services/AuthService";
import "../styles/Profile.css";
import {
  LuUserRound,
  LuMail,
  LuPhone,
  LuCreditCard,
  LuChevronRight,
  LuLogOut,
  LuShieldCheck,
  LuHouse,
} from "react-icons/lu";
import { clearHomeCache } from "../../Home/cache/homeCache";
import { clearPropertiesCache } from "../../Properties/cache/propertiesCache";
import { clearPropertyDetailsCache } from "../../Properties/cache/propertyDetailsCache";
import { clearTenantsCache } from "../../Tenants/cache/tenantsCache";
import { clearTenantDetailsCache } from "../../Tenants/cache/tenantDetailsCache";
import { clearRentStatusCache } from "../../RentStatus/cache/rentStatusCache";
import ProfileSkeleton from "../components/ProfileSkeleton";

function Profile() {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const metadata = user?.user_metadata || {};

  if (loading) {
    return <ProfileSkeleton />;
  }

  const name =
    metadata.full_name ||
    metadata.name ||
    metadata.username ||
    user?.email?.split("@")[0] ||
    "Property Owner";

  const email = user?.email || "No email available";
  const phone = metadata.phone || user?.phone || "";

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  async function handleSignOut() {
    setSigningOut(true);
    setError("");

    try {
      await AuthService.signOut();

      clearHomeCache();
      clearPropertiesCache();
      clearPropertyDetailsCache();
      clearTenantsCache();
      clearTenantDetailsCache();
      clearRentStatusCache();

      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign out.");
      setSigningOut(false);
    }
  }

  return (
    <main className="profile-page">
      {/* Full-Bleed Top Curved Burnt-Orange Hero Header */}
      <header className="profile-header">
        <h1>Profile</h1>
        <p className="profile-subtitle">
          Manage your account details and app preferences.
        </p>
      </header>

      {/* Overlapping Owner Identity Capsule Card */}
      <div className="profile-identity-card">
        <div className="profile-avatar">{initials || "NP"}</div>

        <div className="profile-identity-info">
          <div className="profile-identity-top">
            <h2>{name}</h2>
            <span className="profile-owner-badge">
              <LuShieldCheck size={12} />
              <span>Owner</span>
            </span>
          </div>
          <p>{email}</p>
        </div>
      </div>

      <section className="profile-content">
        <section className="profile-section">
          <h2 className="profile-section-title">Personal information</h2>

          <div className="profile-info-card">
            <div className="profile-info-row">
              <span className="profile-row-icon">
                <LuUserRound size={18} />
              </span>
              <div className="profile-row-content">
                <span className="profile-row-label">Full name</span>
                <strong>{name}</strong>
              </div>
            </div>

            <div className="profile-info-row">
              <span className="profile-row-icon">
                <LuMail size={18} />
              </span>
              <div className="profile-row-content">
                <span className="profile-row-label">Email address</span>
                <strong>{email}</strong>
              </div>
            </div>

            {phone && (
              <div className="profile-info-row">
                <span className="profile-row-icon">
                  <LuPhone size={18} />
                </span>
                <div className="profile-row-content">
                  <span className="profile-row-label">Phone number</span>
                  <strong>{phone}</strong>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="profile-section">
          <h2 className="profile-section-title">Account settings</h2>

          <div className="profile-settings-card">
            <Link to="/payment-settings" className="profile-setting-row">
              <span className="profile-row-icon">
                <LuCreditCard size={18} />
              </span>
              <span className="profile-setting-label">
                <strong>Payment settings</strong>
                <small>Manage your rent payment configuration</small>
              </span>
              <LuChevronRight size={17} className="profile-setting-arrow" />
            </Link>

            <Link to="/properties" className="profile-setting-row">
              <span className="profile-row-icon">
                <LuHouse size={18} />
              </span>
              <span className="profile-setting-label">
                <strong>Your properties</strong>
                <small>View and manage your properties</small>
              </span>
              <LuChevronRight size={17} className="profile-setting-arrow" />
            </Link>
          </div>
        </section>

        {error && (
          <p className="profile-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          className="profile-signout-button"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          <LuLogOut size={17} />
          <span>{signingOut ? "Signing out..." : "Sign out"}</span>
        </button>

        <p className="profile-footer">Nest Pay · Property management</p>
      </section>
    </main>
  );
}

export default Profile;