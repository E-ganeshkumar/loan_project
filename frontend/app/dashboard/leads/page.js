"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LeadsAPI } from "@/lib/api";
import StampBadge from "@/components/StampBadge";

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "—";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export default function LeadsListPage() {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await LeadsAPI.list();
      setLeads(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message || "Could not load leads.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="spread" style={{ marginBottom: 22 }}>
        <div>
          <div className="eyebrow">Register</div>
          <h1 style={{ fontSize: 28, marginTop: 4 }}>Loan leads</h1>
        </div>
        <Link href="/dashboard/leads/new" className="btn">
          + New lead
        </Link>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      <div className="sheet">
        {loading ? (
          <div className="empty-state">Fetching entries…</div>
        ) : leads.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 6 }}>
              No entries in the register yet
            </p>
            <p className="hint">Add your first lead to start the underwriting file.</p>
          </div>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Entry</th>
                <th>Applicant</th>
                <th>Loan type</th>
                <th>Amount sought</th>
                <th>Credit score</th>
                <th>BRE status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} onClick={() => router.push(`/dashboard/leads/${lead.id}`)}>
                  <td className="entry-no">#{String(lead.id).padStart(4, "0")}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{lead.full_name}</div>
                    <div className="hint">{lead.city}</div>
                  </td>
                  <td>{lead.loan_type}</td>
                  <td className="mono">{formatCurrency(lead.loan_amount)}</td>
                  <td className="mono">{lead.credit_score ?? "—"}</td>
                  <td>
                    <StampBadge status={lead.bre_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
