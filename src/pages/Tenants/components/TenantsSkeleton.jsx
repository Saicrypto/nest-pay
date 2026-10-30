
import { LuSearch, LuHouse } from "react-icons/lu";

export default function TenantsSkeleton() {
  return (
    <main
      className="tenants-page tenants-page-skeleton"
      aria-busy="true"
      aria-label="Loading tenants"
    >
      <header className="tenants-header">
        <div>
          <h1>Tenants</h1>
          <p className="tenants-subtitle">
            Manage your flats and the people living in them.
          </p>
        </div>
      </header>

      <div className="tenants-search">
        <LuSearch size={19} />
        <div className="tenants-skeleton-line search" />
      </div>

      <div className="tenants-skeleton-property-list">
        {[1, 2].map((property) => (
          <section className="tenants-property" key={property}>
            <div className="tenants-property-heading">
              <span className="tenants-property-icon">
                <LuHouse size={20} />
              </span>

              <div className="tenants-skeleton-property-info">
                <div className="tenants-skeleton-line property-name" />
                <div className="tenants-skeleton-line property-address" />
              </div>
            </div>

            <div className="tenants-unit-list">
              {[1, 2, 3].map((unit) => (
                <article className="tenants-unit" key={unit}>
                  <div className="tenants-unit-content">
                    <div className="tenants-unit-top">
                      <div className="tenants-unit-info">
                        <div className="tenants-skeleton-line unit-name" />
                      </div>

                      <div className="tenants-unit-action">
                        <div className="tenants-skeleton-status" />
                      </div>
                    </div>

                    <div className="tenants-current-tenant">
                      <div className="tenants-skeleton-line tenant-name" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
