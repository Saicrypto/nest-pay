import "../styles/TenantHomeSkeleton.css";

export default function TenantHomeSkeleton() {
  return (
    <main
      className="tenant-home-page tenant-home-skeleton"
      aria-busy="true"
      aria-label="Loading home dashboard"
    >
      {/* Full-Bleed Curved Burnt-Orange Hero Header */}
      <div className="th-hero-backdrop">
        <header className="tenant-home-header">
          <div className="skeleton-hero skeleton-brand" />
          <div className="skeleton-hero skeleton-bell" />
        </header>

        <section className="tenant-home-welcome">
          <div className="skeleton-hero skeleton-welcome-title" />
          <div className="skeleton-hero skeleton-welcome-subtitle" />
        </section>
      </div>

      {/* Overlapping Elevated Monthly Rent Card */}
      <section className="tenant-rent-card skeleton-rent-card">
        <div className="th-skel-rent-top">
          <div className="skeleton skeleton-rent-label" />
          <div className="skeleton skeleton-rent-badge" />
        </div>

        <div className="skeleton skeleton-rent-amount" />

        <div className="tenant-rent-card-bottom">
          <div className="skeleton skeleton-rent-month" />
          <div className="skeleton skeleton-rent-status" />
        </div>

        <div className="skeleton skeleton-pay-button" />
      </section>

      {/* Quick Actions 3-Column Bento Grid */}
      <section className="th-shortcuts-section">
        <div className="skeleton skeleton-section-title" />

        <div className="tenant-home-shortcuts">
          {[1, 2, 3].map((item) => (
            <div className="tenant-home-shortcut skeleton-shortcut" key={item}>
              <div className="skeleton skeleton-shortcut-icon" />
              <div className="skeleton skeleton-shortcut-label" />
              <div className="skeleton skeleton-shortcut-sublabel" />
            </div>
          ))}
        </div>
      </section>

      {/* Floating Pill Bottom Navigation Bar */}
      <nav className="tenant-bottom-navigation" aria-hidden="true">
        <div className="skeleton skeleton-nav-pill" />
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="skeleton skeleton-nav-item" key={index} />
        ))}
      </nav>
    </main>
  );
}