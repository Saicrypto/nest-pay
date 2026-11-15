import "../styles/PropertySkeleton.css";

export default function PropertiesSkeleton() {
  return (
    <div
      className="properties-stack properties-skeleton"
      aria-busy="true"
      aria-label="Loading properties"
    >
      {[1, 2, 3].map((item) => (
        <div className="properties-list-card" key={item}>
          <div className="properties-list-image skeleton-shimmer" />

          <div className="properties-list-details">
            <div className="properties-skeleton-line title" />
            <div className="properties-skeleton-line location" />
            <div className="properties-skeleton-pill" />
          </div>

          <div className="properties-skeleton-chevron" />
        </div>
      ))}
    </div>
  );
}