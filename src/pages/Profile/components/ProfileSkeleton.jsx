export default function ProfileSkeleton() {
  return (
    <main className="profile-page profile-page-skeleton" aria-busy="true">
      <section className="profile-content">
        <h1>Profile</h1>

        <section className="profile-section">
          <h2>Personal information</h2>

          <div className="profile-info-card">
            {[1, 2, 3].map((item) => (
              <div className="profile-info-row" key={item}>
                <span className="profile-row-icon profile-skeleton-icon" />
                <div className="profile-row-content">
                  <div className="profile-skeleton-line label" />
                  <div className="profile-skeleton-line value" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="profile-section">
          <h2>Account settings</h2>

          <div className="profile-settings-card">
            {[1, 2].map((item) => (
              <div className="profile-setting-row" key={item}>
                <span className="profile-row-icon profile-skeleton-icon" />
                <span className="profile-setting-label">
                  <div className="profile-skeleton-line setting-title" />
                  <div className="profile-skeleton-line setting-subtitle" />
                </span>
              </div>
            ))}
          </div>
        </section>

        <div className="profile-skeleton-button" />
      </section>
    </main>
  );
}