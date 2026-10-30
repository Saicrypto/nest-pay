
import "../styles/Home.css";

export default function HomeDashboardSkeleton() {
  return (
    <div className="home-dashboard-skeleton" aria-busy="true" aria-label="Loading dashboard">
      <div className="home-skeleton-property-header">
        <div className="home-skeleton-line title" />
        <div className="home-skeleton-button" />
      </div>

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

      <div className="home-skeleton-rent-card">
        <div className="home-skeleton-stat-icon" />
        <div className="home-skeleton-stat-info">
          <div className="home-skeleton-line medium" />
          <div className="home-skeleton-line number" />
        </div>
      </div>

      <div className="home-skeleton-rent-status">
        <div className="home-skeleton-line title" />
        <div className="home-skeleton-status-row" />
        <div className="home-skeleton-status-row" />
      </div>
    </div>
  );
}
