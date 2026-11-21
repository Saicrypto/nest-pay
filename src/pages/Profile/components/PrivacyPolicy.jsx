import { useNavigate } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";
import "../styles/LegalPage.css";

function PrivacyPolicy() {
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

        <h1>Privacy Policy</h1>
        <p className="legal-updated">Effective Date: November 21, 2026</p>

        <section>
          <h2>1. Overview &amp; Scope</h2>
          <p>
            Nest Pay (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) provides a digital property
            and rental management platform for property owners and tenants in
            India. This Privacy Policy explains how we collect, use, store, and
            protect your personal data in accordance with the Digital Personal
            Data Protection Act, 2023 (DPDP Act) and applicable Indian laws.
          </p>
        </section>

        <section>
          <h2>2. Personal Data We Collect</h2>
          <ul>
            <li>
              <strong>Property Owner Information:</strong> Name, email address,
              mobile number, authentication credentials, and property/flat
              details (including optional property watchman contact numbers).
            </li>
            <li>
              <strong>Tenant Information:</strong> Full name, mobile number,
              email address, move-in/lease dates, unit assignment, family
              member count, profession, and age provided during onboarding.
            </li>
            <li>
              <strong>Tenancy &amp; Operational Records:</strong> Rent schedules,
              security deposit and maintenance figures, payment status logs,
              daily utility notices, and maintenance complaints.
            </li>
            <li>
              <strong>Device &amp; Session Data:</strong> Device tokens and local
              session identifiers required to keep your account signed in and
              deliver real-time notifications.
            </li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Data</h2>
          <ul>
            <li>To create and manage owner and tenant accounts and unit links.</li>
            <li>
              To track occupancy, rent dues, maintenance charges, and tenancy
              history.
            </li>
            <li>
              To deliver real-time alerts for rent updates, complaints, and
              building utilities.
            </li>
            <li>
              To maintain platform security, prevent unauthorized access, and
              troubleshoot technical issues.
            </li>
          </ul>
        </section>

        <section>
          <h2>4. Data Sharing &amp; Storage</h2>
          <p>
            We do not sell or rent your personal data to third parties or data
            brokers. Tenant details entered for a unit are visible only to the
            authorized owner of that property. Infrastructure and database
            hosting are provided by trusted cloud service providers (such as
            Supabase and Vercel) under strict access controls and encryption in
            transit and at rest.
          </p>
        </section>

        <section>
          <h2>5. Data Retention &amp; Deletion</h2>
          <p>
            We retain personal data only as long as necessary to provide Nest
            Pay services or comply with legal obligations. When an owner vacates
            a unit or deletes a property, associated tenant records and payment
            logs in Nest Pay are permanently removed in accordance with our
            platform workflows.
          </p>
        </section>

        <section>
          <h2>6. Your Rights Under the DPDP Act</h2>
          <p>
            As a Data Principal, you have the right to access a summary of your
            personal data, request correction or updating of inaccurate details,
            withdraw consent, and request erasure of your personal data.
          </p>
        </section>

        <section>
          <h2>7. Contact &amp; Grievance Redressal</h2>
          <p>
            For privacy inquiries, data correction/deletion requests, or
            grievances, contact our Grievance Officer at{" "}
            <strong>support@nestpay.in</strong> (replace with your official
            support email).
          </p>
        </section>
      </div>
    </main>
  );
}

export default PrivacyPolicy;