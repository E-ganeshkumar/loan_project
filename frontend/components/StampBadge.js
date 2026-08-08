export default function StampBadge({ status }) {
  const normalized = (status || "Pending").toLowerCase();
  const variant = normalized.includes("approve")
    ? "approved"
    : normalized.includes("reject")
    ? "rejected"
    : "pending";

  const label = normalized.includes("approve")
    ? "Approved"
    : normalized.includes("reject")
    ? "Rejected"
    : "Pending";

  return <span className={`stamp ${variant}`}>{label}</span>;
}
