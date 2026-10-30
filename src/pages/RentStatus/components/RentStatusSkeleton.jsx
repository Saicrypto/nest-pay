
export default function RentStatusSkeleton() {
  return (
    <section
      className="rent-status-section rent-status-skeleton"
      aria-busy="true"
      aria-label="Loading rent summary"
    >
      <div className="rent-skeleton-heading" />

      <div className="rent-status-grid">
        {[1, 2, 3].map((item) => (
          <div className="rent-status-card" key={item}>
            <div className="rent-skeleton-line label" />
            <div className="rent-skeleton-line count" />
            <div className="rent-skeleton-line amount" />
          </div>
        ))}
      </div>
    </section>
  );
}
