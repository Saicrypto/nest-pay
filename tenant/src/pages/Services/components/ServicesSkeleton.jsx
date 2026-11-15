import "../styles/ServicesSkeleton.css";

export default function ServicesSkeleton() {
  return (
    <main
      className="tenant-services-page tenant-services-skeleton"
      aria-busy="true"
      aria-label="Loading services"
    >
      {/* Full-Bleed Curved Burnt-Orange Hero Header */}
      <header className="tenant-services-header">
        <div className="ts-skel-hero-copy">
          <div className="skeleton-hero skeleton-heading" />
          <div className="skeleton-hero skeleton-subheading" />
        </div>

        <div className="skeleton-hero skeleton-hero-btn" />
      </header>

      {/* Overlapping Floating Segmented Tab Capsule */}
      <div className="tenant-services-tabs-wrap">
        <div className="services-skeleton-tabs">
          <div className="skeleton skeleton-tab" />
          <div className="skeleton skeleton-tab" />
        </div>
      </div>

      {/* Section Heading & Count Pill */}
      <div className="services-skeleton-section-bar">
        <div className="skeleton skeleton-section-heading" />
        <div className="skeleton skeleton-count-pill" />
      </div>

      {/* Provider Cards */}
      <div className="services-skeleton-list">
        {[1, 2, 3, 4].map((item) => (
          <div className="services-skeleton-card" key={item}>
            <div className="skeleton skeleton-provider-image" />

            <div className="services-skeleton-details">
              <div className="skeleton skeleton-provider-name" />
              <div className="skeleton skeleton-provider-category" />
              <div className="skeleton skeleton-provider-description" />
              <div className="skeleton skeleton-provider-description short" />
            </div>

            <div className="skeleton skeleton-provider-action" />
          </div>
        ))}
      </div>
    </main>
  );
}