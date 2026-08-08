"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LeadsAPI, RulesAPI } from "@/lib/api";
import { evaluateRules } from "@/lib/bre";
import StampBadge from "@/components/StampBadge";
import LeadForm from "@/components/LeadForm";

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "—";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export default function LeadDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [editing, setEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const [scoring, setScoring] = useState(false);
  const [running, setRunning] = useState(false);
  const [brePreview, setBrePreview] = useState(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await LeadsAPI.get(id);
      setLead(data);
    } catch (err) {
      setError(err.message || "Could not load this lead.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreditScore() {
    setScoring(true);
    setNotice("");
    setError("");
    try {
      const result = await LeadsAPI.runCreditScore(id);
      if (result.success) {
        setNotice(`Credit score pulled: ${result.credit_score}`);
        await load();
      } else {
        setError(result.message || "Credit score lookup failed.");
      }
    } catch (err) {
      setError(err.message || "Credit score lookup failed.");
    } finally {
      setScoring(false);
    }
  }

  async function handleRunBre() {
    setRunning(true);
    setNotice("");
    setError("");
    setBrePreview(null);
    try {
      const rules = await RulesAPI.list();
      const result = evaluateRules(lead, Array.isArray(rules) ? rules : rules.results || []);
      setBrePreview(result);
    } catch (err) {
      setError(err.message || "Could not evaluate BRE rules.");
    } finally {
      setRunning(false);
    }
  }

  async function saveBrePreview() {
    if (!brePreview) return;
    try {
      const updated = await LeadsAPI.update(id, {
        bre_status: brePreview.passed ? "Approved" : "Rejected",
        rejection_reason: brePreview.passed ? "" : brePreview.reasons.join("; "),
      });
      setLead(updated);
      setBrePreview(null);
      setNotice("BRE decision saved to the lead.");
    } catch (err) {
      setError(err.message || "Could not save the BRE decision.");
    }
  }

  async function handleDelete() {
    if (!window.confirm("Remove this lead from the register? This cannot be undone.")) return;
    try {
      await LeadsAPI.remove(id);
      router.push("/dashboard/leads");
    } catch (err) {
      setError(err.message || "Could not delete this lead.");
    }
  }

  async function handleEditSubmit(payload) {
    setSavingEdit(true);
    setError("");
    try {
      const updated = await LeadsAPI.update(id, payload);
      setLead(updated);
      setEditing(false);
      setNotice("Entry updated.");
    } catch (err) {
      setError(err.message || "Could not update this lead.");
    } finally {
      setSavingEdit(false);
    }
  }

  if (loading) return <div className="empty-state">Retrieving file…</div>;
  if (error && !lead) return <div className="banner banner-error">{error}</div>;
  if (!lead) return null;

  return (
    <div style={{ maxWidth: 720 }}>
      <button className="btn-outline btn btn-sm" style={{ marginBottom: 18 }} onClick={() => router.push("/dashboard/leads")}>
        ← Back to register
      </button>

      <div className="spread" style={{ marginBottom: 18, alignItems: "flex-start" }}>
        <div>
          <div className="eyebrow">Entry #{String(lead.id).padStart(4, "0")}</div>
          <h1 style={{ fontSize: 30, marginTop: 4 }}>{lead.full_name}</h1>
        </div>
        <StampBadge status={lead.bre_status} />
      </div>

      {notice && <div className="banner banner-info">{notice}</div>}
      {error && <div className="banner banner-error">{error}</div>}

      {editing ? (
        <div className="sheet">
          <div className="sheet-body">
            <LeadForm initial={lead} onSubmit={handleEditSubmit} submitting={savingEdit} submitLabel="Save changes" />
            <button className="btn-outline btn btn-sm btn-block" style={{ marginTop: 10 }} onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="sheet">
            <div className="sheet-header">
              <div className="eyebrow">Applicant file</div>
              <button className="btn-outline btn btn-sm" onClick={() => setEditing(true)}>
                Edit entry
              </button>
            </div>
            <div className="sheet-body">
              <dl className="kv">
                <dt>Mobile</dt>
                <dd className="mono">{lead.mobile}</dd>
                <dt>Date of birth</dt>
                <dd>{lead.dob}</dd>
                <dt>City / Pincode</dt>
                <dd>{lead.city} — {lead.pincode}</dd>
                <dt>Employment</dt>
                <dd>{lead.employment_type}</dd>
                <dt>Loan type</dt>
                <dd>{lead.loan_type}</dd>
                <dt>Monthly income</dt>
                <dd className="mono">{formatCurrency(lead.monthly_income)}</dd>
                <dt>Loan amount</dt>
                <dd className="mono">{formatCurrency(lead.loan_amount)}</dd>
                <dt>Property value</dt>
                <dd className="mono">{formatCurrency(lead.property_value)}</dd>
                <dt>Credit score</dt>
                <dd className="mono">{lead.credit_score ?? "Not yet pulled"}</dd>
                {lead.rejection_reason && (
                  <>
                    <dt>Rejection reason</dt>
                    <dd style={{ color: "var(--stamp-red)" }}>{lead.rejection_reason}</dd>
                  </>
                )}
              </dl>
            </div>
          </div>

          <div className="sheet" style={{ marginTop: 20 }}>
            <div className="sheet-header">
              <div className="eyebrow">Underwriting actions</div>
            </div>
            <div className="sheet-body stack">
              <div className="spread">
                <div>
                  <div style={{ fontWeight: 600 }}>Pull credit score</div>
                  <div className="hint">Calls the bureau lookup and saves the result to this file.</div>
                </div>
                <button className="btn btn-outline" onClick={handleCreditScore} disabled={scoring}>
                  {scoring ? "Pulling…" : "Pull score"}
                </button>
              </div>

              <hr className="divider" style={{ margin: "4px 0" }} />

              <div className="spread">
                <div>
                  <div style={{ fontWeight: 600 }}>Run BRE check</div>
                  <div className="hint">
                    Evaluates active rules against this file in your browser.{" "}
                    <span style={{ color: "var(--gold)" }}>Preview only — no backend endpoint exists yet.</span>
                  </div>
                </div>
                <button className="btn btn-outline" onClick={handleRunBre} disabled={running}>
                  {running ? "Evaluating…" : "Run check"}
                </button>
              </div>

              {brePreview && (
                <div
                  className="banner"
                  style={{
                    borderColor: brePreview.passed ? "var(--stamp-green)" : "var(--stamp-red)",
                    color: brePreview.passed ? "var(--stamp-green)" : "var(--stamp-red)",
                    background: brePreview.passed ? "var(--stamp-green-bg)" : "var(--stamp-red-bg)",
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: brePreview.reasons.length ? 6 : 0 }}>
                    Preview result: {brePreview.passed ? "Approved" : "Rejected"}
                  </div>
                  {brePreview.reasons.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {brePreview.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  )}
                  <button className="btn btn-sm" style={{ marginTop: 10 }} onClick={saveBrePreview}>
                    Save this decision to the lead
                  </button>
                </div>
              )}
            </div>
          </div>

          <button className="btn-danger btn btn-sm" style={{ marginTop: 20 }} onClick={handleDelete}>
            Delete this entry
          </button>
        </>
      )}
    </div>
  );
}
