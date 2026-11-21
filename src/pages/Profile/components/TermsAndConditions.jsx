import { useNavigate } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";
import "../styles/LegalPage.css";

function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <main className="legal-page">
      <div className="legal-container">
        <div className="legal-topbar">
          <button
            type="button"
            className="legal-back-btn"
            onClick={() => navigate(-1)}
          >
            <LuArrowLeft size={16} />
            <span>Back</span>
          </button>
          <span className="legal-brand">Nest Pay</span>
        </div>

        <h1>Terms &amp; Conditions</h1>
        <p className="legal-updated">Effective Date: November 21, 2026</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Nest Pay, you agree to be bound by these Terms
            &amp; Conditions. If you do not agree with any part of these terms,
            please discontinue use of the application.
          </p>
        </section>

        <section>
          <h2>2. Nature of Platform</h2>
          <p>
            Nest Pay is a property and tenancy management software tool that
            helps property owners and tenants organize flat details, rent
            schedules, utility notices, and maintenance requests. Nest Pay is
            not a real estate broker, property manager, or party to any rental
            or lease agreement between an owner and a tenant.
          </p>
        </section>

        <section>
          <h2>3. User Responsibilities</h2>
          <ul>
            <li>
              <strong>Accuracy of Information:</strong> Property owners and
              tenants agree to provide accurate, lawful contact, unit, and
              tenancy information and not impersonate any third party.
            </li>
            <li>
              <strong>Authorized Contacts:</strong> Owners adding watchman or
              staff phone numbers confirm they have permission to share those
              details for property communication.
            </li>
            <li>
              <strong>Account Security:</strong> You are responsible for
              maintaining the confidentiality of your login credentials and
              invite links.
            </li>
          </ul>
        </section>

        <section>
          <h2>4. Rent, Deposits &amp; Financial Records</h2>
          <p>
            Rent amounts, due dates, security deposits, and maintenance figures
            recorded in Nest Pay are entered by property owners for tracking and
            record-keeping purposes. Any disputes regarding rent, deposits,
            eviction, or lease terms are strictly between the property owner and
            the tenant.
          </p>
        </section>

        <section>
          <h2>5. Prohibited Conduct</h2>
          <p>
            You agree not to misuse the platform, attempt unauthorized access to
            other users&rsquo; properties or data, upload unlawful content in
            complaints or notes, or disrupt the availability of the service.
          </p>
        </section>

        <section>
          <h2>6. Limitation of Liability</h2>
          <p>
            Nest Pay is provided on an &ldquo;as-is&rdquo; and
            &ldquo;as-available&rdquo; basis. To the maximum extent permitted by
            law, we are not liable for indirect, incidental, or consequential
            damages, or for any financial or tenancy dispute arising between
            owners and tenants.
          </p>
        </section>

        <section>
          <h2>7. Governing Law &amp; Contact</h2>
          <p>
            These Terms &amp; Conditions are governed by the laws of India, with
            courts in Hyderabad, Telangana having jurisdiction. For questions,
            contact <strong>support@nestpay.in</strong> (replace with your
            official support email).
          </p>
        </section>
      </div>
    </main>
  );
}

export default TermsAndConditions;