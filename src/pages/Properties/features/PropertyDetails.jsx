
import { Link } from "react-router-dom";
import {LuArrowLeft} from "react-icons/lu";
import usePropertyDetails from "../hooks/usePropertyDetails";
import PropertySummary from "../components/PropertySummary";
import PropertyUnits from "../components/PropertyUnits";
import "../styles/PropertyDetails.css";

function PropertyDetails() {
  const details = usePropertyDetails();
  if (details.loading) {
    return (
      <main className="property-details-page">
        Loading property...
      </main>
    );
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
  <LuArrowLeft color="#DD6013" />
  Properties
</Link>

        <span>Nest Pay</span>
      </header>

      <PropertySummary
        property={details.property}
        unitCount={details.units.length}
      />

      <PropertyUnits {...details} />
    </main>
  );
}

export default PropertyDetails;
