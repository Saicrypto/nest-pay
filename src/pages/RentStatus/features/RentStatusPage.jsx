
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import "../styles/RentStatusPage.css";
import {
  
  LuSearch,
  LuCalendarDays,
 LuCircleAlert,
  LuCircleCheck,
  LuClock,
  LuWallet,
  LuMessageCircle,
  LuArrowLeft,
  
} from "react-icons/lu";
import StatusDropdown from "../../../components/property/StatusDropdown";
import {
  getRentStatusCache,
  setRentStatusCache,
} from "../cache/rentStatusCache";
import RentStatusPageSkeleton from "../components/RentStatusPageSkeleton";

function RentStatusPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [filter, setFilter] = useState("all");
const [searchTerm, setSearchTerm] = useState("");


 async function loadPayments() {
  const cached = getRentStatusCache();

  if (cached !== null) {
    setPayments(cached);
    setLoading(false);
    return;
  }

  const { data, error } = await supabase
    .from("rent_payments")
    .select(`
      id, tenant_id, unit_id, rent_month, rent_amount, status, paid_at,
      tenants (id, full_name, phone, tenant_status),
      property_units (unit_name, property_id, rent_due_day,
        properties (property_name))
    `)
    .order("rent_month", { ascending: false });

  if (error) throw error;

  const result = data || [];

  setPayments(result);
  setRentStatusCache(result);
}

  useEffect(() => {
    loadPayments()
      .catch((err) => setError(err.message || "Unable to load rent records."))
      .finally(() => setLoading(false));
  }, []);

  const months = useMemo(() => {
    const uniqueMonths = new Set([
      selectedMonth,
      ...payments.map((p) => p.rent_month).filter(Boolean),
    ]);
    return [...uniqueMonths].sort((a, b) => b.localeCompare(a));
  }, [payments, selectedMonth]);

  const monthPayments = payments.filter(
    (payment) => payment.rent_month === selectedMonth
  );

  const dueSoon = (payment) => {
    if (payment.status !== "unpaid") return false;
    const dueDay = payment.property_units?.rent_due_day;
    if (!dueDay) return false;

    const now = new Date();
    const dueDate = new Date(
      `${selectedMonth.slice(0, 7)}-${String(dueDay).padStart(2, "0")}T00:00:00`
    );
    const daysUntilDue = Math.ceil(
      (dueDate.getTime() - new Date(
        now.getFullYear(), now.getMonth(), now.getDate()
      ).getTime()) / 86400000
    );

    return daysUntilDue >= 0 && daysUntilDue <= 5;
  };

 
const filteredPayments = monthPayments.filter((payment) => {
  // Filter by payment status
  if (filter === "paid" && payment.status !== "paid") return false;

  if (filter === "not-paid" && payment.status !== "unpaid") return false;

  if (filter === "overdue" && payment.status !== "overdue") return false;

  // Search tenant, flat/unit, or property
  const query = searchTerm.trim().toLowerCase();

  if (query) {
    const tenantName = payment.tenants?.full_name || "";
    const unitName = payment.property_units?.unit_name || "";
    const propertyName =
      payment.property_units?.properties?.property_name || "";

    const matchesSearch = [
      tenantName,
      unitName,
      propertyName,
    ].some((value) => value.toLowerCase().includes(query));

    if (!matchesSearch) return false;
  }

  return true;
});


  async function updateStatus(paymentId, status) {
    setUpdatingId(paymentId);
    setError("");

    try {
      const { data, error } = await supabase
        .from("rent_payments")
        .update({
          status,
          paid_at: status === "paid" ? new Date().toISOString() : null,
        })
        .eq("id", paymentId)
        .select("id");

      if (error) throw error;
      if (!data?.length) {
        throw new Error("Status was not updated. Check your Supabase permissions.");
      }

setPayments((current) => {
  const updatedPayments = current.map((payment) =>
    payment.id === paymentId
      ? {
          ...payment,
          status,
          paid_at: status === "paid" ? new Date().toISOString() : null,
        }
      : payment
  );

  setRentStatusCache(updatedPayments);

  return updatedPayments;
});
    } catch (err) {
      setError(err.message || "Unable to update rent status.");
    } finally {
      setUpdatingId(null);
    }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function sendReminder(payment) {
    const tenant = payment.tenants;
    const unit = payment.property_units;

    if (!tenant?.phone) {
      setError(`No phone number available for ${tenant?.full_name || "this tenant"}.`);
      return;
    }

    let phone = tenant.phone.replace(/\D/g, "");
    if (phone.length === 10) phone = `91${phone}`;
    else if (phone.length === 11 && phone.startsWith("0")) {
      phone = `91${phone.slice(1)}`;
    }

    if (phone.length < 10 || phone.length > 15) {
      setError("Please check the tenant's phone number.");
      return;
    }

    const propertyName = unit?.properties?.property_name || "your property";
    const message = [
      `Hello ${tenant.full_name},`,
      "",
      `This is a friendly reminder about your rent for ${propertyName}, ${unit?.unit_name || ""}.`,
      `Rent month: ${new Date(`${payment.rent_month}T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}`,
      `Amount: ${formatCurrency(payment.rent_amount)}`,
      `Due day: ${unit?.rent_due_day || "Please confirm with the owner"}`,
      "",
      "Thank you,",
      "Nest Pay",
    ].join("\n");

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  
const counts = {
  all: monthPayments.length,
  paid: monthPayments.filter((p) => p.status === "paid").length,
  "not-paid": monthPayments.filter((p) => p.status === "unpaid").length,
  overdue: monthPayments.filter((p) => p.status === "overdue").length,
};


  if (loading) {
    return <RentStatusPageSkeleton />;
  }

  return (
   <main className="rent-status-page">
  <header className="rent-status-page-header">

    <span>
      Rent Status
      <p className="rent-subtitle">
        Track rent payments and pending dues.
      </p>
    </span>

    <span className="rent-status-header-spacer" />
  </header>

      
<div className="rent-status-toolbar">
<div className="rent-status-search">
  <input
    type="search"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    placeholder="Search tenant, flat or property"
    aria-label="Search rent records"
  />

  <LuSearch size={20} color="#DD6013" />


</div>

  <label className="rent-status-month">
    <span className="sr-only">Select rent month</span>
    <StatusDropdown
      value={selectedMonth}
      label="Select rent month"
      variant="month"
      showDot={false}
      onChange={setSelectedMonth}
      options={months.map((month) => ({
        value: month,
        label: new Date(`${month}T00:00:00`).toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        }),
      }))}
    />
  </label>
</div>


<nav className="rent-status-tabs" aria-label="Filter rent records">
  {[
    ["all", "All", <LuWallet size={16} color="#DD6013" />],
    ["paid", "Paid", <LuCircleCheck size={16} color="#DD6013" />],
    ["not-paid", "Not Paid", <LuClock size={16} color="#DD6013" />],
    ["overdue", "Overdue", <LuCircleAlert size={16} color="#DD6013" />],
  ].map(([value, label, icon]) => (
    <button
      type="button"
      key={value}
      className={filter === value ? "active" : ""}
      onClick={() => setFilter(value)}
    >
      {icon}
      {label} <span>({counts[value]})</span>
    </button>
  ))}
</nav>


      {error && <p className="rent-status-error" role="alert">{error}</p>}

      {filteredPayments.length === 0 ? (
        <div className="rent-status-empty">No rent records for this selection.</div>
      ) : (
        <div className="rent-status-records">
          {filteredPayments.map((payment) => {
            const tenant = payment.tenants;
            const unit = payment.property_units;
            const property = unit?.properties;
            const isPaid = payment.status === "paid";
            const isOverdue = payment.status === "overdue";
            const isDueSoon = dueSoon(payment);
            const dotClass = isPaid ? "paid" : isOverdue ? "overdue" : isDueSoon ? "due-soon" : "unpaid";

            const dueDate = unit?.rent_due_day
              ? `${String(unit.rent_due_day).padStart(2, "0")} ${new Date(`${selectedMonth}T00:00:00`).toLocaleDateString("en-IN", { month: "short" })} ${selectedMonth.slice(0, 4)}`
              : null;

            return (

<article className="rent-status-record" key={payment.id}>


 
<div className="rent-status-record-icon">
  {isPaid ? (
    <LuCircleCheck size={20} color="#DD6013" />
  ) : isOverdue ? (
    <LuCircleAlert size={20} color="#DD6013" />
  ) : (
    <LuCalendarDays size={20} color="#DD6013" />
  )}
</div>



                <Link
                  to={`/tenants/${payment.tenant_id}`}
                  className="rent-status-record-main"
                >
                  <strong>{unit?.unit_name || "Unit"}</strong>
                  <span>{property?.property_name || "Property"}</span>
                  <span>{tenant?.full_name || "Unknown tenant"}</span>
                  <strong>{formatCurrency(payment.rent_amount)}</strong>
                  <span className={`rent-status-date ${dotClass}`}>
                    {isPaid
                      ? `Paid on ${payment.paid_at ? formatDate(payment.paid_at) : "date not recorded"}`
                      : `Due: ${dueDate || "date not set"}`}
                  </span>
                </Link>

                <div className="rent-status-record-actions">
                  {!isPaid && (
                   
<button
  type="button"
  className="rent-status-reminder"
  onClick={() => sendReminder(payment)}
>
  <LuMessageCircle size={15} color="#DD6013" />
  Send Reminder
</button>

                  )}

                  <StatusDropdown
  value={payment.status}
  label={`Payment status for ${tenant?.full_name || "tenant"}`}
  variant="payment"
  disabled={updatingId === payment.id}
  onChange={(status) => updateStatus(payment.id, status)}
  options={[
    { value: "unpaid", label: "Not Paid" },
    { value: "paid", label: "Paid" },
    { value: "overdue", label: "Overdue" },
  ]}
/>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default RentStatusPage;
