
import { Link } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";

export default function PropertyDetailsSkeleton() {
  return (
    <main className="property-details-page property-details-skeleton">
      <header className="property-details-header">
        <Link to="/properties" className="properties-back">
          <LuArrowLeft color="#DD6013" />
          Properties
        </Link>
        <span>Nest Pay</span>
      </header>

      <section className="details-skeleton-summary">
        <div className="details-skeleton-image" />

        <div className="details-skeleton-info">
          <div className="details-skeleton-line title" />
          <div className="details-skeleton-line medium" />
          <div className="details-skeleton-line short" />
        </div>
      </section>

      <section className="details-skeleton-units">
        <div className="details-skeleton-heading" />

        {[1, 2, 3].map((item) => (
          <div className="details-skeleton-unit" key={item}>
            <div className="details-skeleton-line medium" />
            <div className="details-skeleton-line short" />
            <div className="details-skeleton-unit-footer">
              <div className="details-skeleton-line short" />
              <div className="details-skeleton-line short" />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
