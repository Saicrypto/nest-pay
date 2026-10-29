
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useNavigate } from "react-router-dom";
import "../styles/RentStatus.css";
import {
  getRentStatusCache,
  setRentStatusCache,
} from "../cache/rentStatusCache";

function RentStatus() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

 useEffect(() => {
  let active = true;

  async function loadRentStatus() {
    const cached = getRentStatusCache();

    if (cached !== null) {
      setPayments(
        cached.map(({ id, rent_amount, status }) => ({
          id,
          rent_amount,
          status,
        }))
      );
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("rent_payments")
        .select("id, rent_amount, status");

      if (error) throw error;

      const result = data || [];

      if (active) {
        setPayments(result);
        setRentStatusCache(result);
      }
    } catch (err) {
      if (active) {
        setError(err.message || "Unable to load rent status.");
      }
    } finally {
      if (active) {
        setLoading(false);
      }
    }
  }

  loadRentStatus();

  return () => {
    active = false;
  };
}, []);

  const counts = {
    paid: payments.filter((p) => p.status === "paid"),
    unpaid: payments.filter((p) => p.status === "unpaid"),
    overdue: payments.filter((p) => p.status === "overdue"),
  };

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  }

  if (loading) {
    return <section className="rent-status-section">Loading rent status...</section>;
  }

  return (
    <section className="rent-status-section">
      <h2>Rent Status</h2>

      {error && <p className="rent-status-error" role="alert">{error}</p>}

      {!error && (
        <div className="rent-status-grid">
          {["paid", "unpaid", "overdue"].map((status) => (
            <button
              type="button"
              key={status}
              className={`rent-status-card ${status}`}
              onClick={() => navigate("/rent-status")}
              aria-label={`Open rent status: ${status}`}
            >
              <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
              <strong>{counts[status].length}</strong>
              <small>
                {formatCurrency(
                  counts[status].reduce(
                    (sum, p) => sum + Number(p.rent_amount || 0),
                    0
                  )
                )}
              </small>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default RentStatus;
