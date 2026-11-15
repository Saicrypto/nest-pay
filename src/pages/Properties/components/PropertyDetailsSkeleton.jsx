import { Link } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";
import "../styles/PropertyDetailsSkeleton.css";

export default function PropertyDetailsSkeleton() {
  return (
    <main
      className="property-details-page property-details-skeleton"
      aria-busy="true"
      aria-label="Loading property details"
    >
      {/* Sticky Light-Canvas Sub-Page Header */}
      <header className="property-details-header">
        <Link to="/properties" className="properties-back">
          <span className="pds-back-circle">
            <LuArrowLeft size={16} />
          </span>
          <span>Properties</span>
        </Link>

        <div className="pds-brand">
          <span className="pds-brand-mark">N</span>
          <span>Nest Pay</span>
        </div>
      </header>

      {/* Property Summary Hero Card Skeleton */}
      <section className="details-skeleton-summary">
        <div className="details-skeleton-image" />

        <div className="details-skeleton-info">
          <div className="details-skeleton-line title" />
          <div className="details-skeleton-line medium" />
          <div className="details-skeleton-pill" />
        </div>
      </section>

      {/* Units Section Heading & Add Button Skeleton */}
      <section className="details-skeleton-units">
        <div className="details-skeleton-units-bar">
          <div className="details-skeleton-heading" />
          <div className="details-skeleton-add-btn" />
        </div>

        {/* Unit Cards */}
        {[1, 2, 3].map((item) => (
          <div className="details-skeleton-unit" key={item}>
            <div className="details-skeleton-unit-top">
              <div className="details-skeleton-line medium" />
              <div className="details-skeleton-status-pill" />
            </div>

            <div className="details-skeleton-line short" />

            <div className="details-skeleton-unit-footer">
              <div className="details-skeleton-line rent" />
              <div className="details-skeleton-line action" />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}