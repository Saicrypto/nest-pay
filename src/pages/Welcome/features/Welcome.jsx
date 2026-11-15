import { useRef, useState } from "react";
import Login from "../../Login";
import TenantLogin from "../../../../tenant/src/pages/Login/features/TenantLogin";
import "../styles/Welcome.css";

function Welcome() {
  const [activeTab, setActiveTab] = useState("owner");
  const touchStartX = useRef(null);

  function handleTouchStart(event) {
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event) {
    if (touchStartX.current === null) return;

    const difference = event.changedTouches[0].clientX - touchStartX.current;

    if (Math.abs(difference) > 60) {
      setActiveTab(difference < 0 ? "tenant" : "owner");
    }

    touchStartX.current = null;
  }

  return (
    <main className="welcome-page">
      <div className="welcome-container">
        {/* Inline Nest Pay House-Arrow Logo */}
        <div className="welcome-logo">
          <div className="welcome-logo-badge" aria-hidden="true">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 3.5L3.5 10.5H6.5V19.5C6.5 20.0523 6.94772 20.5 7.5 20.5H16.5C17.0523 20.5 17.5 20.0523 17.5 19.5V10.5H20.5L12 3.5Z"
                stroke="#FFFFFF"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="welcome-logo-text">Nest Pay</span>
        </div>

        {/* Owner / Tenant Segmented Switcher */}
        <div className="welcome-tabs" role="tablist" aria-label="Account role">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "owner"}
            className={activeTab === "owner" ? "active" : ""}
            onClick={() => setActiveTab("owner")}
          >
            Owner
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "tenant"}
            className={activeTab === "tenant" ? "active" : ""}
            onClick={() => setActiveTab("tenant")}
          >
            Tenant
          </button>
        </div>

        {/* Swipeable Auth Card Container */}
        <div
          className="welcome-login-board"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {activeTab === "owner" ? <Login /> : <TenantLogin />}
        </div>
      </div>
    </main>
  );
}

export default Welcome;