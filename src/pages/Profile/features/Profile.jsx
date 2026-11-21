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
  LuTrash2,
  LuTriangleAlert,
  LuX,
  LuFileText,
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteModalError, setDeleteModalError] = useState("");
  const [error, setError] = useState("");
  const metadata = user?.user_metadata || {};

  if (loading) {
    return <ProfileSkeleton />;
  }

  const userId = user?.id;

  const name =
    metadata.short_name ||
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

  function clearAllOwnerCaches() {
    clearHomeCache(userId);
    clearPropertiesCache(userId);
    clearPropertyDetailsCache(userId);
    clearTenantsCache(userId);
    clearTenantDetailsCache();
    clearRentStatusCache(userId);
  }

  async function handleSignOut() {
    if (signingOut || deletingAccount) return;

    setSigningOut(true);
    setError("");

    try {
      await AuthService.signOut();
    } catch (err) {
      setError(err.message || "Unable to sign out.");
    } finally {
      clearAllOwnerCaches();
      setSigningOut(false);
      navigate("/", { replace: true });
    }
  }

  function openDeleteModal() {
    setDeleteConfirmText("");
    setDeleteModalError("");
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    if (deletingAccount) return;
    setShowDeleteModal(false);
    setDeleteConfirmText("");
    setDeleteModalError("");
  }

  async function handleConfirmDeleteAccount(event) {
    event.preventDefault();
    if (deletingAccount) return;

    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
      setDeleteModalError('Please type "DELETE" to confirm.');
      return;
    }

    setDeletingAccount(true);
    setDeleteModalError("");
    setError("");

    try {
      await AuthService.deleteAccount("DELETE");
      clearAllOwnerCaches();
      setShowDeleteModal(false);
      navigate("/", { replace: true });
    } catch (err) {
      setDeleteModalError(
        err.message || "Unable to delete account. Please try again."
      );
      setDeletingAccount(false);
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

            <button
              type="button"
              className="profile-setting-row profile-danger-row"
              onClick={openDeleteModal}
              disabled={signingOut || deletingAccount}
            >
              <span className="profile-row-icon profile-danger-icon">
                <LuTrash2 size={18} />
              </span>
              <span className="profile-setting-label">
                <strong>Delete account</strong>
                <small>Permanently remove your account and property data</small>
              </span>
              <LuChevronRight size={17} className="profile-setting-arrow" />
            </button>
          </div>
        </section>

<section className="profile-section">
          <h2 className="profile-section-title">Legal</h2>

          <div className="profile-settings-card">
            <Link to="/privacy-policy" className="profile-setting-row">
              <span className="profile-row-icon">
                <LuShieldCheck size={18} />
              </span>
              <span className="profile-setting-label">
                <strong>Privacy Policy</strong>
                <small>How we collect, use, and protect your data</small>
              </span>
              <LuChevronRight size={17} className="profile-setting-arrow" />
            </Link>

            <Link to="/terms-and-conditions" className="profile-setting-row">
              <span className="profile-row-icon">
                <LuFileText size={18} />
              </span>
              <span className="profile-setting-label">
                <strong>Terms &amp; Conditions</strong>
                <small>Rules and guidelines for using Nest Pay</small>
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
          disabled={signingOut || deletingAccount}
        >
          <LuLogOut size={17} />
          <span>{signingOut ? "Signing out..." : "Sign out"}</span>
        </button>

        <p className="profile-footer">Nest Pay · Property management</p>
      </section>

      {showDeleteModal && (
        <div
          className="profile-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          onClick={closeDeleteModal}
        >
          <div
            className="profile-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-modal-header">
              <div className="profile-modal-warning-badge">
                <LuTriangleAlert size={20} />
              </div>
              <button
                type="button"
                className="profile-modal-close"
                onClick={closeDeleteModal}
                disabled={deletingAccount}
                aria-label="Close modal"
              >
                <LuX size={18} />
              </button>
            </div>

            <h3 id="delete-account-title">Delete your account?</h3>
            <p className="profile-modal-description">
              This will permanently delete your owner account (
              <strong>{email}</strong>) along with all your properties, flats,
              tenant records, access codes, and rent history.{" "}
              <strong>This action cannot be undone.</strong>
            </p>

            <form onSubmit={handleConfirmDeleteAccount}>
              <label
                htmlFor="delete-confirm-input"
                className="profile-modal-input-label"
              >
                Type <strong>DELETE</strong> to confirm
              </label>
              <input
                id="delete-confirm-input"
                type="text"
                className="profile-modal-input"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                autoComplete="off"
                autoCapitalize="characters"
                disabled={deletingAccount}
              />

              {deleteModalError && (
                <p className="profile-modal-error" role="alert">
                  {deleteModalError}
                </p>
              )}

              <div className="profile-modal-actions">
                <button
                  type="button"
                  className="profile-modal-cancel"
                  onClick={closeDeleteModal}
                  disabled={deletingAccount}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="profile-modal-confirm-delete"
                  disabled={
                    deletingAccount ||
                    deleteConfirmText.trim().toUpperCase() !== "DELETE"
                  }
                >
                  {deletingAccount ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Profile;