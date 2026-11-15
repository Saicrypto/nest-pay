
import { Link, useNavigate } from "react-router-dom";
import {LuArrowLeft, LuWrench, LuZap, LuMessageSquareWarning, LuChevronRight,} from "react-icons/lu";
import usePropertyDetails from "../hooks/usePropertyDetails";
import PropertySummary from "../components/PropertySummary";
import PropertyUnits from "../components/PropertyUnits";
import "../styles/PropertyDetails.css";
import PropertyDetailsSkeleton from "../components/PropertyDetailsSkeleton";

function PropertyDetails() {
  
  const details = usePropertyDetails();
  const navigate = useNavigate();

 if (details.loading) {
  return <PropertyDetailsSkeleton />;
}

  if (details.error) {
    return (
      <main className="property-details-page">
       <Link to="/properties" className="properties-details-back">
  <LuArrowLeft color="#DD6013" />
  Properties
</Link>

        <p className="property-details-error" role="alert">
          {details.error}
        </p>
      </main>
    );
  }

  return (
    <main className="property-details-page">
<header className="property-details-header">
        <Link to="/properties" className="properties-back">
          <span className="pd-back-circle">
            <LuArrowLeft size={16} />
          </span>
          <span>Properties</span>
        </Link>

        <div className="pd-brand-badge">
          <span className="pd-brand-mark">N</span>
          <span>Nest Pay</span>
        </div>
      </header>

      <PropertySummary
        property={details.property}
        unitCount={details.units.length}
      />

<div className="property-feature-links">
        <button
          type="button"
          className="pd-feature-tile"
          onClick={() => navigate(`/properties/${details.property.id}/services`)}
        >
          <span className="pd-feature-icon services">
            <LuWrench size={18} />
          </span>
          <strong>Service Providers</strong>
          <small>Vendors &amp; staff</small>
          <LuChevronRight className="pd-feature-arrow" size={14} />
        </button>

        <button
          type="button"
          className="pd-feature-tile"
          onClick={() => navigate(`/properties/${details.property.id}/utilities`)}
        >
          <span className="pd-feature-icon utilities">
            <LuZap size={18} />
          </span>
          <strong>Daily Utilities</strong>
          <small>Water &amp; power</small>
          <LuChevronRight className="pd-feature-arrow" size={14} />
        </button>

        <button
          type="button"
          className="pd-feature-tile"
          onClick={() => navigate(`/properties/${details.property.id}/complaints`)}
        >
          <span className="pd-feature-icon complaints">
            <LuMessageSquareWarning size={18} />
          </span>
          <strong>Complaints</strong>
          <small>Tenant tickets</small>
          <LuChevronRight className="pd-feature-arrow" size={14} />
        </button>
      </div>

      <PropertyUnits {...details} />
    </main>
  );
}

export default PropertyDetails;
