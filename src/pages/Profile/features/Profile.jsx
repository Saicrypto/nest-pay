
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

navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign out.");
      setSigningOut(false);
    }
  }

  return (
    <main className="profile-page">
      

      <section className="profile-content">
        <h1>Profile</h1>
    
        <section className="profile-section">
          <h2>Personal information</h2>

          <div className="profile-info-card">
            <div className="profile-info-row">
              <span className="profile-row-icon">
                <LuUserRound size={19} />
              </span>
              <div className="profile-row-content">
                <span className="profile-row-label">Full name</span>
                <strong>{name}</strong>
              </div>
            </div>

            <div className="profile-info-row">
              <span className="profile-row-icon">
                <LuMail size={19} />
              </span>
              <div className="profile-row-content">
                <span className="profile-row-label">Email address</span>
                <strong>{email}</strong>
              </div>
            </div>

            {phone && (
              <div className="profile-info-row">
                <span className="profile-row-icon">
                  <LuPhone size={19} />
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
          <h2>Account settings</h2>

          <div className="profile-settings-card">
            <Link to="/payment-settings" className="profile-setting-row">
              <span className="profile-row-icon">
                <LuCreditCard size={19} />
              </span>
              <span className="profile-setting-label">
                <strong>Payment settings</strong>
                <small>Manage your rent payment configuration</small>
              </span>
              <LuChevronRight className="profile-setting-arrow" />
            </Link>

            <Link to="/properties" className="profile-setting-row">
              <span className="profile-row-icon">
                <LuHouse size={19} />
              </span>
              <span className="profile-setting-label">
                <strong>Your properties</strong>
                <small>View and manage your properties</small>
              </span>
              <LuChevronRight className="profile-setting-arrow" />
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
          <LuLogOut size={18} />
          {signingOut ? "Signing out..." : "Sign out"}
        </button>

        <p className="profile-footer">Nest Pay · Property management</p>
      </section>
    </main>
  );
}

export default Profile;
