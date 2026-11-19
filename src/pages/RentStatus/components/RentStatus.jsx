
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useNavigate } from "react-router-dom";
import "../styles/RentStatus.css";
import {
  getRentStatusCache,
  setRentStatusCache,
} from "../cache/rentStatusCache";
import RentStatusSkeleton from "../components/RentStatusSkeleton";
import { useUser } from "../../../context/UserContext";

function RentStatus() {
  const navigate = useNavigate();
  const { user } = useUser();
  const userId = user?.id;

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;

    let active = true;

    async function loadRentStatus() {
      const cached = getRentStatusCache(userId);

      if (Array.isArray(cached)) {
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

      setLoading(true);
      setError("");

      try {
        const { data, error } = await supabase
          .from("rent_payments")
          .select("id, rent_amount, status")
          .limit(500);

        if (error) throw error;

        const result = Array.isArray(data) ? data : [];

        if (active) {
          setPayments(result);
          setRentStatusCache(userId, result);
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
  }, [userId]);

const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  function formatCurrency(amount) {
    const parsed = Number(amount);
    return inrFormatter.format(Number.isFinite(parsed) ? parsed : 0);
  }

  const counts = {
    paid: payments.filter((p) => p.status === "paid"),
    unpaid: payments.filter((p) => p.status === "unpaid"),
    overdue: payments.filter((p) => p.status === "overdue"),
  };

if (loading) {
  return <RentStatusSkeleton />;
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
