
import { Link } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";

export default function TenantDetailsSkeleton() {
  return (
    <main
      className="tenant-details-page tenant-details-skeleton"
      aria-busy="true"
      aria-label="Loading tenant details"
    >
      <header className="tenant-details-header">
        <button className="tenant-details-back" type="button" disabled>
          <LuArrowLeft />
        </button>

        <Link to="/home" className="tenant-details-brand">
          Nest Pay
        </Link>
      </header>

      <section className="tenant-details-card">
        <div className="tenant-skeleton-line eyebrow" />
        <div className="tenant-skeleton-line name" />
        <div className="tenant-skeleton-line address" />
        <div className="tenant-skeleton-button" />
      </section>

      <section className="tenant-details-grid">
        {Array.from({ length: 8 }).map((_, index) => (
          <article className="tenant-detail-item" key={index}>
            <div className="tenant-skeleton-icon" />

            <div className="tenant-skeleton-info">
              <div className="tenant-skeleton-line label" />
              <div className="tenant-skeleton-line value" />
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
