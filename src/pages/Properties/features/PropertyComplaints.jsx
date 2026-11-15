import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LuArrowLeft,
  LuMessageSquareWarning,
  LuDoorClosed,
  LuUser,
  LuClock,
  LuImage,
  LuExternalLink,
} from "react-icons/lu";
import PropertyManagementService from "../services/PropertyManagementService";
import "../styles/PropertyComplaints.css";

const STATUS_OPTIONS = [
  { value: "submitted", label: "Submitted" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function PropertyComplaints() {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadComplaints() {
    try {
      setError("");
      const data =
        await PropertyManagementService.getPropertyComplaints(propertyId);
      setComplaints(data);
    } catch (err) {
      setError(err.message || "Unable to load complaints.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaints();
  }, [propertyId]);

  async function updateStatus(id, status) {
    try {
      setUpdatingId(id);
      setError("");

      await PropertyManagementService.updateComplaintStatus(id, status);
      await loadComplaints();
    } catch (err) {
      setError(err.message || "Unable to update complaint.");
    } finally {
      setUpdatingId(null);
    }
  }

  const openCount = complaints.filter(
    (c) => c.status === "submitted" || c.status === "in_progress"
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status === "resolved" || c.status === "closed"
  ).length;

  const filteredComplaints =
    statusFilter === "all"
      ? complaints
      : complaints.filter((c) => c.status === statusFilter);

  return (
    <main className="property-complaints-page">
      {/* Sticky Light-Canvas Top Bar */}
      <header className="pc-topbar">
        <button
          className="property-complaints-back"
          type="button"
          onClick={() => navigate(`/properties/${propertyId}`)}
        >
          <span className="pc-back-circle">
            <LuArrowLeft size={16} />
          </span>
          <span>Properties</span>
        </button>

        <div className="pc-brand-badge">
          <span className="pc-brand-mark">N</span>
          <span>Nest Pay</span>
        </div>
      </header>

      {/* Hero Title + Active Ticket Badge */}
      <div className="property-complaints-header">
        <div>
          <h1>Property Complaints</h1>
          <p>Review and manage complaints submitted by tenants.</p>
        </div>

        <span className="pc-count-pill">
          {openCount} Open
        </span>
      </div>

      {/* 2-Card Bento Overview */}
      {complaints.length > 0 && (
        <div className="pc-bento-stats">
          <div className="pc-stat-card open">
            <span className="pc-stat-label">ACTIVE TICKETS</span>
            <strong>{openCount}</strong>
            <small>Submitted or in progress</small>
          </div>

          <div className="pc-stat-card resolved">
            <span className="pc-stat-label">RESOLVED / CLOSED</span>
            <strong>{resolvedCount}</strong>
            <small>Completed issues</small>
          </div>
        </div>
      )}

      {/* Status Filter Pills */}
      {complaints.length > 0 && (
        <div className="pc-filter-row" role="tablist" aria-label="Filter complaints">
          {[
            { id: "all", label: `All (${complaints.length})` },
            { id: "submitted", label: "Submitted" },
            { id: "in_progress", label: "In Progress" },
            { id: "resolved", label: "Resolved" },
            { id: "closed", label: "Closed" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={statusFilter === tab.id}
              className={`pc-filter-pill ${
                statusFilter === tab.id ? "active" : ""
              }`}
              onClick={() => setStatusFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="property-complaints-error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="pc-loading-text">Loading complaints...</p>
      ) : filteredComplaints.length === 0 ? (
        <div className="property-complaints-empty">
          <div className="pc-empty-icon">
            <LuMessageSquareWarning size={26} />
          </div>
          <h3>No complaints found</h3>
          <p>
            {statusFilter === "all"
              ? "No complaints have been submitted for this property."
              : `No complaints marked as "${statusFilter.replace("_", " ")}".`}
          </p>
        </div>
      ) : (
        <section className="property-complaints-list">
          {filteredComplaints.map((complaint) => (
            <article
              className="property-complaint-card"
              key={complaint.id}
            >
              <div className="property-complaint-card-header">
                <h3>{complaint.title}</h3>
                <span
                  className={`complaint-status complaint-status-${complaint.status}`}
                >
                  {complaint.status.replace("_", " ")}
                </span>
              </div>

              <p className="property-complaint-description">
                {complaint.description}
              </p>

              {/* Flat, Tenant & Timestamp Meta Pills */}
              <div className="property-complaint-details">
                <span className="pc-meta-chip">
                  <LuDoorClosed size={13} />
                  <strong>{complaint.property_units?.unit_name || "Unknown"}</strong>
                </span>

                <span className="pc-meta-chip">
                  <LuUser size={13} />
                  <span>{complaint.tenants?.full_name || "Unknown"}</span>
                </span>

                <span className="pc-meta-chip pc-meta-time">
                  <LuClock size={13} />
                  <span>
                    {new Date(complaint.created_at).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </span>
              </div>

              {/* Photo Attachments */}
              {complaint.photo_urls?.length > 0 && (
                <div className="property-complaint-photos">
                  <span className="pc-photos-label">
                    <LuImage size={13} />
                    <span>Attachments ({complaint.photo_urls.length})</span>
                  </span>

                  <div className="pc-photo-links">
                    {complaint.photo_urls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="pc-photo-pill"
                      >
                        <span>Photo {index + 1}</span>
                        <LuExternalLink size={12} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Quick-Tap Status Pills + Accessible Select */}
              <div className="property-complaint-status-control">
                <div className="pc-status-header">
                  <label htmlFor={`status-${complaint.id}`}>
                    Update status
                  </label>
                  {updatingId === complaint.id && (
                    <span className="pc-updating-tag">Updating...</span>
                  )}
                </div>

                <div className="pc-status-pills">
                  {STATUS_OPTIONS.map((opt) => {
                    const isCurrent = complaint.status === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={updatingId === complaint.id || isCurrent}
                        className={`pc-status-btn ${opt.value} ${
                          isCurrent ? "current" : ""
                        }`}
                        onClick={() => updateStatus(complaint.id, opt.value)}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}