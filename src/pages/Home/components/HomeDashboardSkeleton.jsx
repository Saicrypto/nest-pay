import "../styles/HomeDashboardSkeleton.css";

export default function HomeDashboardSkeleton() {
  return (
    <div
      className="home-dashboard-skeleton"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      {/* Full-Bleed Curved Burnt-Orange Hero Header */}
      <div className="home-skeleton-hero">
        <div className="home-skeleton-brand-bar">
          <div className="home-skeleton-hero-shimmer brand" />
          <div className="home-skeleton-hero-shimmer bell" />
        </div>

        <div className="home-skeleton-property-header">
          <div className="home-skeleton-hero-copy">
            <div className="home-skeleton-hero-shimmer title" />
            <div className="home-skeleton-hero-shimmer subtitle" />
          </div>
          <div className="home-skeleton-hero-shimmer button" />
        </div>
      </div>

      {/* Overlapping Property Carousel Cards */}
      <div className="home-skeleton-property-carousel">
        {[1, 2].map((item) => (
          <div className="home-skeleton-property-card" key={item}>
            <div className="home-skeleton-property-image" />
            <div className="home-skeleton-property-details">
              <div className="home-skeleton-line medium" />
              <div className="home-skeleton-line short" />
            </div>
          </div>
        ))}
      </div>

      {/* 2x2 Bento Stats Grid */}
      <div className="home-skeleton-stats">
        {[1, 2, 3, 4].map((item) => (
          <div className="home-skeleton-stat-card" key={item}>
            <div className="home-skeleton-stat-icon" />
            <div className="home-skeleton-stat-info">
              <div className="home-skeleton-line medium" />
              <div className="home-skeleton-line number" />
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Rent Collection Summary Card */}
      <div className="home-skeleton-rent-card">
        <div className="home-skeleton-stat-icon" />
        <div className="home-skeleton-stat-info">
          <div className="home-skeleton-line medium" />
          <div className="home-skeleton-line number" />
        </div>
        <div className="home-skeleton-pill" />
      </div>

      {/* Rent Status Card */}
      <div className="home-skeleton-rent-status">
        <div className="home-skeleton-status-header">
          <div className="home-skeleton-line title" />
          <div className="home-skeleton-pill small" />
        </div>
        <div className="home-skeleton-status-row" />
        <div className="home-skeleton-status-row" />
      </div>
    </div>
  );
}