import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  LuArrowLeft,
  LuCircleCheck,
  LuChevronDown,
  LuMessageSquarePlus,
  LuCheck,
} from "react-icons/lu";
import { useTenant } from "../../../context/TenantContext";
import TenantComplaintService from "../services/TenantComplaintService";
import "../styles/RaiseComplaint.css";
import { clearComplaintsCache } from "../cache/complaintsCache";

const issueCategories = [
  "Plumbing / Water",
  "Electrical",
  "Lift",
  "Cleaning",
  "Security",
  "Parking",
  "Structural / Maintenance",
  "Other",
];

export default function RaiseComplaint() {
  const {
    deviceToken,
    loading: sessionLoading,
    isAuthenticated,
  } = useTenant();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return;

    function handleOutsideClick(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [dropdownOpen]);

  if (!sessionLoading && !isAuthenticated) {
    return <Navigate to="/tenant/login" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    if (!deviceToken) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle || !cleanDescription) {
      setError("Please select an issue and enter a description.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await TenantComplaintService.raiseComplaint(
        deviceToken,
        cleanTitle,
        cleanDescription
      );
      clearComplaintsCache(deviceToken);
      setSuccess(true);
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err?.message || "Unable to submit complaint.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="raise-complaint-page">
      {/* Sticky Light Editorial Sub-Page Top Bar */}
      <header className="rc-topbar">
        <button
          type="button"
          className="raise-complaint-back"
          onClick={() => navigate("/tenant/complaints")}
          disabled={loading}
        >
          <span className="rc-back-circle">
            <LuArrowLeft size={16} aria-hidden="true" />
          </span>
          <span>Back to Complaints</span>
        </button>

        <div className="rc-brand">
          <span className="rc-brand-mark">N</span>
          <span>Nest Pay</span>
        </div>
      </header>

      <div className="rc-intro">
        <p className="rc-eyebrow">NEW SUPPORT TICKET</p>
        <h1>Raise a Complaint</h1>
        <p>Let your property owner know about an issue.</p>
      </div>

      {success ? (
        <div className="complaint-success">
          <div className="rc-success-icon">
            <LuCircleCheck size={30} aria-hidden="true" />
          </div>
          <h3>Complaint submitted successfully!</h3>
          <p>
            Your property owner has been notified and will review your request
            shortly.
          </p>
          <button
            type="button"
            onClick={() => navigate("/tenant/complaints")}
          >
            Back to Complaints
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="raise-complaint-form">
          {/* Quick-Tap Category Chips */}
          <div className="rc-chips-block">
            <span className="rc-field-label">Quick category</span>
            <div className="rc-chips-grid">
              {issueCategories.map((issue) => (
                <button
                  type="button"
                  key={issue}
                  className={`rc-chip ${title === issue ? "active" : ""}`}
                  disabled={loading}
                  onClick={() => {
                    setTitle(issue);
                    setError("");
                    setDropdownOpen(false);
                  }}
                >
                  {issue}
                </button>
              ))}
            </div>
          </div>

          <label id="complaint-issue-label">Select issue</label>

          {/* App-Style Custom Dropdown */}
          <div className="rc-custom-select" ref={dropdownRef}>
            <button
              type="button"
              className={`rc-select-trigger ${dropdownOpen ? "open" : ""} ${
                title ? "has-value" : ""
              }`}
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen}
              aria-labelledby="complaint-issue-label"
              disabled={loading}
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <span>{title || "Choose an issue"}</span>
              <LuChevronDown
                size={18}
                className="rc-select-chevron"
                aria-hidden="true"
              />
            </button>

            {dropdownOpen && (
              <ul
                className="rc-select-menu"
                role="listbox"
                aria-labelledby="complaint-issue-label"
              >
                {issueCategories.map((issue) => {
                  const selected = title === issue;

                  return (
                    <li
                      key={issue}
                      role="option"
                      aria-selected={selected}
                      className={`rc-select-option ${
                        selected ? "selected" : ""
                      }`}
                      onClick={() => {
                        setTitle(issue);
                        setError("");
                        setDropdownOpen(false);
                      }}
                    >
                      <span>{issue}</span>
                      {selected && (
                        <LuCheck
                          size={16}
                          className="rc-option-check"
                          aria-hidden="true"
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="rc-desc-label-row">
            <label htmlFor="complaint-description">Description</label>
            <span className="rc-char-count">{description.length}/2000</span>
          </div>

          <textarea
            id="complaint-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail (e.g. location, urgency)..."
            rows={5}
            maxLength={2000}
            disabled={loading}
            required
          />

          {error && (
            <p className="rc-error-banner" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="rc-submit-btn" disabled={loading}>
            <LuMessageSquarePlus size={18} aria-hidden="true" />
            <span>{loading ? "Submitting..." : "Raise Complaint"}</span>
          </button>
        </form>
      )}
    </main>
  );
}