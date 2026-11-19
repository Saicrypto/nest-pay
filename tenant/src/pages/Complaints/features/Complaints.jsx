import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  LuPlus,
  LuMessageSquare,
  LuCalendarDays,
  LuCircleCheck,
  LuClock,
  LuCircleAlert,
} from "react-icons/lu";
import { useTenant } from "../../../context/TenantContext";
import TenantComplaintService from "../services/TenantComplaintService";
import {
  getComplaintsCache,
  setComplaintsCache,
} from "../cache/complaintsCache";
import "../styles/Complaints.css";
import ComplaintsSkeleton from "../components/ComplaintsSkeleton";

function formatSubmittedDate(value) {
  if (!value) return "Date unavailable";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Date unavailable";
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Complaints() {
  const navigate = useNavigate();
  const {
    deviceToken,
    loading: sessionLoading,
    isAuthenticated,
  } = useTenant();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadComplaints() {
      if (!deviceToken) {
        setLoading(false);
        return;
      }

      const cachedData = getComplaintsCache(deviceToken);

      if (Array.isArray(cachedData)) {
        setComplaints(cachedData);
        setLoading(false);
      } else {
        setLoading(true);
      }

      try {
        setError("");

        const data = await TenantComplaintService.getComplaints(deviceToken);
        const safeComplaints = Array.isArray(data) ? data : [];

        if (cancelled) return;

        setComplaints(safeComplaints);
        setComplaintsCache(deviceToken, safeComplaints);
      } catch (err) {
        if (cancelled) return;

        console.error("Complaint loading error:", err);

        if (!Array.isArray(cachedData)) {
          setError(err?.message || "Unable to load complaints.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (!sessionLoading) {
      loadComplaints();
    }

    return () => {
      cancelled = true;
    };
  }, [deviceToken, sessionLoading]);

  if (!sessionLoading && !isAuthenticated) {
    return <Navigate to="/tenant/login" replace />;
  }

  const activeCount = complaints.filter(
    (c) => c?.status === "open" || c?.status === "in_progress"
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c?.status === "resolved" || c?.status === "closed"
  ).length;

  function renderStatusIcon(status) {
    if (status === "resolved" || status === "closed") {
      return <LuCircleCheck size={17} aria-hidden="true" />;
    }
    if (status === "in_progress") {
      return <LuClock size={17} aria-hidden="true" />;
    }
    return <LuCircleAlert size={17} aria-hidden="true" />;
  }

  return (
    <main className="tenant-complaints-page">
      {/* Full-Bleed Top Curved Burnt-Orange Hero Header */}
      <header className="tenant-complaints-header">
        <div>
          <h1>Complaints</h1>
          <p>Report and track issues in your property.</p>
        </div>

        <button
          type="button"
          className="tc-raise-btn"
          onClick={() => navigate("/tenant/complaints/raise")}
        >
          <LuPlus size={16} aria-hidden="true" />
          <span>Raise Complaint</span>
        </button>
      </header>

      {/* Overlapping Bento Summary Capsule */}
      <div className="tc-summary-capsule">
        <div className="tc-stat-box">
          <span>TOTAL</span>
          <strong>{complaints.length}</strong>
        </div>

        <div className="tc-stat-divider" />

        <div className="tc-stat-box active">
          <span>ACTIVE</span>
          <strong>{activeCount}</strong>
        </div>

        <div className="tc-stat-divider" />

        <div className="tc-stat-box resolved">
          <span>RESOLVED</span>
          <strong>{resolvedCount}</strong>
        </div>
      </div>

      {loading || sessionLoading ? (
        <ComplaintsSkeleton />
      ) : error ? (
        <p className="tc-error-banner" role="alert">
          {error}
        </p>
      ) : complaints.length === 0 ? (
        <section className="tenant-complaints-empty">
          <div className="tc-empty-icon">
            <LuMessageSquare size={26} aria-hidden="true" />
          </div>
          <h3>No complaints yet</h3>
          <p>
            If you experience an issue with your property, you can report it
            here.
          </p>
          <button
            type="button"
            onClick={() => navigate("/tenant/complaints/raise")}
          >
            <LuPlus size={16} aria-hidden="true" />
            <span>Raise Your First Complaint</span>
          </button>
        </section>
      ) : (
        <section className="tenant-complaints-list">
          {complaints.map((complaint) => {
            const normalizedStatus = String(
              complaint.status || "open"
            ).toLowerCase();

            return (
              <article key={complaint.id} className="tenant-complaint-card">
                <div className={`tc-card-icon ${normalizedStatus}`}>
                  {renderStatusIcon(normalizedStatus)}
                </div>

                <div className="tc-card-body">
                  <div className="tc-card-top">
                    <h3>{complaint.title || "Untitled Complaint"}</h3>
                    <span className={`complaint-status ${normalizedStatus}`}>
                      {normalizedStatus.replaceAll("_", " ")}
                    </span>
                  </div>

                  {complaint.description && (
                    <p className="tc-card-desc">{complaint.description}</p>
                  )}

                  <small className="tc-card-date">
                    <LuCalendarDays size={12} aria-hidden="true" />
                    <span>
                      Submitted: {formatSubmittedDate(complaint.created_at)}
                    </span>
                  </small>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}