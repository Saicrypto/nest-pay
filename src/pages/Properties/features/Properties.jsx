import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropertyService from "../../../services/PropertyService";
import "../styles/Properties.css";
import { LuBuilding2, LuMapPin } from "react-icons/lu";
import { LuPlus } from "react-icons/lu";
import { useUser } from "../../../context/UserContext";
import {
  getPropertiesCache,
  setPropertiesCache,
} from "../cache/propertiesCache";

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { myProfile } = useUser();

const username =
  myProfile?.username ||
  myProfile?.full_name ||
  "Your";

 
useEffect(() => {
  let active = true;

  async function loadProperties() {
    const cached = getPropertiesCache();

    if (cached !== null) {
      setProperties(cached);
      setLoading(false);
      return;
    }

    try {
      const data = await PropertyService.getMyProperties();

      if (active) {
        const result = data || [];

        setProperties(result);
        setPropertiesCache(result);
        setError("");
      }
    } catch (err) {
      if (active) {
        setError(err.message || "Unable to load your properties.");
      }
    } finally {
      if (active) {
        setLoading(false);
      }
    }
  }

  loadProperties();

  return () => {
    active = false;
  };
}, []);


  return (
    <main className="properties-page">
  <header className="properties-header">
    <span className="properties-brand">
      Properties
      <p className="rent-subtitle">
        Manage your properties and flats.
      </p>
    </span>
  </header>

     <section className="properties-content">
     
  <div className="properties-page-heading">
    <div>
     <h1>{username}'s Properties</h1>

    </div>

    <Link to="/add-property" className="add-property-button">
      <LuPlus size={18} />
      <span>Add Property</span>
    </Link>
  </div>

        {error && (
          <p className="property-error" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p>Loading your properties...</p>
        ) : properties.length === 0 ? (
          <div className="properties-empty-state">
            <LuBuilding2 size={36} />
            <h2>No properties yet</h2>
            <p>Your properties will appear here once you add one.</p>
          </div>
        ) : (
          <div className="properties-stack">
            {properties.map((property) => {
              const location = [
                property.city,
                property.state,
              ]
                .filter(Boolean)
                .join(", ");

       return (
  <Link
    key={property.id}
    to={`/properties/${property.id}`}
    className="properties-list-card"
  >
    <div className="properties-list-image">
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

      <span className="properties-list-units">
        <LuBuilding2 size={12} />
        {Number(property.total_units || 0)} Units
      </span>
    </div>

    <div className="properties-list-details">
      <h2>{property.property_name}</h2>

      {location && <p>{location}</p>}
    </div>
  </Link>
);
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default Properties;