
import "./AppSkeleton.css";

export default function AppSkeleton() {
  return (
    <div className="app-skeleton">
      <header className="skeleton-header">
        <div className="skeleton-logo" />
        <div className="skeleton-circle" />
      </header>

      <main className="skeleton-content">
        <div className="skeleton-heading" />
        <div className="skeleton-subheading" />

        <div className="skeleton-summary">
          <div className="skeleton-block" />
          <div className="skeleton-block" />
        </div>

        <div className="skeleton-section-title" />

        <div className="skeleton-card">
          <div className="skeleton-line long" />
          <div className="skeleton-line medium" />
          <div className="skeleton-line short" />
        </div>

        <div className="skeleton-card">
          <div className="skeleton-line long" />
          <div className="skeleton-line medium" />
          <div className="skeleton-line short" />
        </div>
      </main>

      <div className="skeleton-bottom-nav">
        <div />
        <div />
        <div />
        <div />
      </div>
    </div>
  );
}
