import "../styles/RentStatusPageSkeleton.css";

export default function RentStatusPageSkeleton() {
  return (
    <main
      className="rent-status-page rent-status-page-skeleton"
      aria-busy="true"
      aria-label="Loading rent records"
    >
      {/* Full-Bleed Curved Burnt-Orange Hero Header */}
      <header className="rent-status-page-header">
        <div>
          <h1>Rent Status</h1>
          <p className="rent-subtitle">
            Track rent payments and pending dues.
          </p>
        </div>
        <span className="rent-status-header-spacer" />
      </header>

      {/* Overlapping Search & Month Selector Capsule */}
      <div className="rent-status-toolbar">
        <div className="rent-status-search">
          <div className="rent-page-skeleton-line search" />
        </div>

        <div className="rent-page-skeleton-month" />
      </div>

      {/* 4-Tab Filter Row */}
      <nav className="rent-status-tabs" aria-hidden="true">
        {[1, 2, 3, 4].map((item) => (
          <div className="rent-page-skeleton-tab" key={item} />
        ))}
      </nav>

      {/* Payment Record Cards */}
      <div className="rent-status-records">
        {[1, 2, 3, 4].map((item) => (
          <article className="rent-status-record" key={item}>
            <div className="rent-page-skeleton-icon" />

            <div className="rent-page-skeleton-record-main">
              <div className="rent-page-skeleton-line unit" />
              <div className="rent-page-skeleton-line property" />
              <div className="rent-page-skeleton-line tenant" />
              <div className="rent-page-skeleton-line amount" />
              <div className="rent-page-skeleton-line date" />
            </div>

            <div className="rent-page-skeleton-actions">
              <div className="rent-page-skeleton-action" />
              <div className="rent-page-skeleton-dropdown" />
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}