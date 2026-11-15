import "../styles/ComplaintsSkeleton.css";

export default function ComplaintsSkeleton() {
  return (
    <section
      className="tenant-complaints-list tenant-complaints-skeleton"
      aria-busy="true"
      aria-label="Loading complaints"
    >
      {[1, 2, 3].map((item) => (
        <article className="tenant-complaint-card" key={item}>
          <div className="tc-skel-icon" />

          <div className="tc-card-body">
            <div className="tc-card-top">
              <div className="tenant-skeleton-line complaint-title" />
              <div className="tenant-skeleton-status" />
            </div>

            <div className="tenant-skeleton-line complaint-description" />
            <div className="tenant-skeleton-line complaint-description short" />
            <div className="tenant-skeleton-line complaint-date" />
          </div>
        </article>
      ))}
    </section>
  );
}