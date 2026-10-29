
import { useEffect, useState, useRef } from "react";
import AuthService from "../../../services/AuthService";
import DashboardService from "../../../services/DashboardService";
import PropertyService from "../../../services/PropertyService";
import { Link } from "react-router-dom";
import RentStatus from "../../RentStatus/components/RentStatus";
import "../styles/Home.css";
import {
  getHomeCache,
  setHomeCache,
  clearHomeCache,
} from "../cache/homeCache";
import {
  LuHouse,
  LuUsers,
  LuBuilding,
  LuBuilding2,
  LuChartNoAxesColumn,
  LuChevronLeft,
LuChevronRight,
  LuMenu,
  LuX,
  LuWallet,
} from "react-icons/lu";

function Home() {

  const propertyCarouselRef = useRef(null);

function scrollProperties(direction) {
  if (!propertyCarouselRef.current) return;

  propertyCarouselRef.current.scrollBy({
    left: direction * propertyCarouselRef.current.clientWidth * 0.8,
    behavior: "smooth",
  });
}

  const [stats, setStats] = useState({
    properties: 0,
    units: 0,
    occupied: 0,
    vacant: 0,
    monthlyRent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [properties, setProperties] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [propertyScroll, setPropertyScroll] = useState(null);

useEffect(() => {
  let active = true;

  async function loadDashboard() {
    const cached = getHomeCache();

    if (cached) {
      setStats(cached.stats);
      setProperties(cached.properties);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data = await DashboardService.getStats();
      const propertyData = await PropertyService.getMyProperties();

      if (active) {
        setStats(data);
        setProperties(propertyData);
        setError("");

        setHomeCache({
          stats: data,
          properties: propertyData,
        });
      }
    } catch (err) {
      if (active) {
        setError(err.message || "Unable to load dashboard data.");
      }
    } finally {
      if (active) {
        setLoading(false);
      }
    }
  }

  loadDashboard();

  return () => {
    active = false;
  };
}, []);


  async function handleSignOut() {
    try {
      await AuthService.signOut();
      clearHomeCache();
    } catch (err) {
      setError(err.message || "Sign out failed.");
    }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <main className="home-page">
     
<header className="home-header">
  <div className="home-brand">
    <div className="home-brand-icon">N</div>
    <span>Nest Pay</span>
  </div>

  <div className="home-header-actions">

    <button
      type="button"
      className="home-signout"
      onClick={handleSignOut}
    >
      Sign out
    </button>
  </div>


</header>


      <section className="home-content">
        <h1>Your dashboard.</h1>
        <p>Here's an overview of your properties and rent.</p>

       
        

{properties.length === 0 ? (
  <div className="empty-state">
    <h2>No properties yet</h2>
    <p>Add your first property to start managing rent and tenants.</p>
  </div>
) : (
  <section className="property-list">
    <div className="property-carousel-header">
      <h2>Your properties</h2>

      <div className="property-carousel-controls">
        <button
          type="button"
          onClick={() => scrollProperties(-1)}
          aria-label="Previous properties"
        >
          <LuChevronLeft />
        </button>

        <button
          type="button"
          onClick={() => scrollProperties(1)}
          aria-label="Next properties"
        >
          <LuChevronRight />
        </button>
      </div>
    </div>

    <div className="property-carousel" ref={propertyCarouselRef}>
      {properties.map((property) => {
        const total = Number(property.total_units || 0);
        const location = [property.city, property.state]
          .filter(Boolean)
          .join(", ");

        return (
          <article className="property-card" key={property.id}>
           <Link
  to="/properties"
  className="property-card-main"
  aria-label="View all properties"
>
              <div className="property-card-image">
                <img
                  src={
                    property.image_url ||
                    "/images/property-placeholder.jpg"
                  }
                  alt={property.property_name}
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />

                <span className="property-units-badge">
                  <LuBuilding2 /> {total} Units
                </span>
              </div>

              <div className="property-card-details">
                <h3>{property.property_name}</h3>

                {location && (
                  <p className="property-card-location">
                    {location}
                  </p>
                )}
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  </section>
)}



        {error && (
          <p className="dashboard-error" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p>Loading your property data...</p>
        ) : (
          <>
            
<div className="stats-grid">
  <article className="stat-card">
    <div className="stat-card-icon properties-icon">
      <LuHouse />
    </div>
    <div className="stat-card-info">
      <span>Total properties</span>
      <strong>{stats.properties}</strong>
    </div>
    
  </article>

  <article className="stat-card">
    <div className="stat-card-icon units-icon">
      <LuBuilding2 />
    </div>
    <div className="stat-card-info">
      <span>Total flats</span>
      <strong>{stats.units}</strong>
    </div>
  
  </article>

  <article className="stat-card">
    <div className="stat-card-icon occupied-icon">
      <LuUsers />
    </div>
    <div className="stat-card-info">
      <span>Occupied flats</span>
      <strong>{stats.occupied}</strong>
    </div>
    
  </article>

  <article className="stat-card">
    <div className="stat-card-icon vacant-icon">
      <LuBuilding />
    </div>
    <div className="stat-card-info">
      <span>Vacant flats</span>
      <strong>{stats.vacant}</strong>
    </div>
    
  </article>

  <article className="stat-card rent-stat-card">
    <div className="stat-card-icon rent-icon">
      <LuChartNoAxesColumn />
    </div>
    <div className="stat-card-info">
      <span>Expected monthly rent</span>
      <strong>{formatCurrency(stats.monthlyRent)}</strong>
    </div>
    
  </article>
</div>

            
<RentStatus />


          </>
        )}
      </section>
    </main>
  );
}

export default Home;
