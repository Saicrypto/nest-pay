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
import PropertiesSkeleton from "../components/PropertiesSkeleton";
import { LuPencil, LuCheck } from 'react-icons/lu';
import { supabase } from '../../../lib/supabase.js';


function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { myProfile } = useUser();

const username =
  myProfile?.username ||
  myProfile?.full_name ||
  "Your";

const [currentUserId, setCurrentUserId] = useState(null);
const [ownerShortName, setOwnerShortName] = useState('');
const [isEditingOwnerName, setIsEditingOwnerName] = useState(false);
const [draftOwnerName, setDraftOwnerName] = useState('');
const [isSavingOwnerName, setIsSavingOwnerName] = useState(false);

useEffect(() => {
  let isMounted = true;

  const syncOwnerFromUser = (user) => {
    if (!isMounted) return;
    if (!user) {
      setCurrentUserId(null);
      setOwnerShortName('');
      setIsEditingOwnerName(false);
      return;
    }

    setCurrentUserId(user.id);
    const savedName =
      user.user_metadata?.short_name ||
      user.user_metadata?.full_name?.split(' ')[0] ||
      '';
    setOwnerShortName(savedName);
  };

  supabase.auth.getUser().then(({ data: { user } }) => {
    syncOwnerFromUser(user);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      syncOwnerFromUser(session?.user ?? null);
    }
  );

  return () => {
    isMounted = false;
    subscription.unsubscribe();
  };
}, []);

const handleStartEditOwnerName = () => {
  setDraftOwnerName(ownerShortName);
  setIsEditingOwnerName(true);
};

const handleSaveOwnerName = async (e) => {
  if (e) e.preventDefault();
  if (!currentUserId) return;

  const trimmed = draftOwnerName.trim();
  setIsSavingOwnerName(true);

  const { data, error } = await supabase.auth.updateUser({
    data: { short_name: trimmed || null }
  });

  setIsSavingOwnerName(false);

  if (!error && data?.user?.id === currentUserId) {
    setOwnerShortName(trimmed);
    setIsEditingOwnerName(false);
  }
};

const formattedHeading = ownerShortName
  ? `${ownerShortName}${ownerShortName.toLowerCase().endsWith('s') ? "'" : "'s"} Properties`
  : 'Your Properties';


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
  {isEditingOwnerName ? (
    <form className="owner-name-edit-form" onSubmit={handleSaveOwnerName}>
      <input
        type="text"
        className="owner-name-input"
        value={draftOwnerName}
        onChange={(e) => setDraftOwnerName(e.target.value)}
        placeholder="Short name"
        maxLength={18}
        disabled={isSavingOwnerName}
        autoFocus
      />
      <button
        type="submit"
        className="owner-name-save-btn"
        aria-label="Save owner name"
        disabled={isSavingOwnerName}
      >
        <LuCheck size={14} strokeWidth={2.5} />
      </button>
    </form>
  ) : (
    <div className="owner-heading-group" onClick={handleStartEditOwnerName}>
      <h1>{formattedHeading}</h1>
      <button
        type="button"
        className="owner-name-edit-btn"
        aria-label="Edit owner name"
        title="Edit display name"
      >
        <LuPencil size={13} strokeWidth={2.3} />
      </button>
    </div>
  )}

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
           <PropertiesSkeleton />
        ) : properties.length === 0 ? (
          <div className="properties-empty-state">
            <LuBuilding2 size={36} />
            <h2>No properties yet</h2>
            <p>Your properties will appear here once you add one.</p>
          </div>
        ) : (
          <div className="properties-stack">
            {properties.map((property) => {
  const location = [property.city, property.state]
    .filter(Boolean)
    .join(", ");

  const actualUnitsCount = Array.isArray(property.units)
    ? property.units.length
    : 0;

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
  {property.property_units?.[0]?.count ?? 0}{" "}
  {(property.property_units?.[0]?.count ?? 0) === 1 ? "Flat" : "Flats"}
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