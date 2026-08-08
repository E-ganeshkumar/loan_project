"use client";

import { useEffect, useState } from "react";
import { RulesAPI } from "@/lib/api";

const OPERATORS = [">=", "<=", "=="];
const EMPTY_RULE = { field_name: "", operator: ">=", value: "", active: true };

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_RULE);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await RulesAPI.list();
      setRules(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message || "Could not load BRE rules.");
    } finally {
      setLoading(false);
    }
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function startEdit(rule) {
    setEditingId(rule.id);
    setForm({ field_name: rule.field_name, operator: rule.operator, value: rule.value, active: rule.active });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_RULE);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (editingId) {
        await RulesAPI.update(editingId, form);
      } else {
        await RulesAPI.create(form);
      }
      cancelEdit();
      await load();
    } catch (err) {
      setError(err.message || "Could not save this rule.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(rule) {
    try {
      await RulesAPI.update(rule.id, { active: !rule.active });
      await load();
    } catch (err) {
      setError(err.message || "Could not update this rule.");
    }
  }

  async function handleDelete(rule) {
    if (!window.confirm(`Remove the rule on "${rule.field_name}"?`)) return;
    try {
      await RulesAPI.remove(rule.id);
      await load();
    } catch (err) {
      setError(err.message || "Could not delete this rule.");
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div className="eyebrow">Business Rules Engine</div>
        <h1 style={{ fontSize: 28, marginTop: 4 }}>Underwriting rules</h1>
        <p className="hint" style={{ marginTop: 6 }}>
          Every active rule must pass for a lead to be approved. Fields match the lead file — e.g.{" "}
          <span className="mono">credit_score</span>, <span className="mono">monthly_income</span>,{" "}
          <span className="mono">loan_amount</span>, <span className="mono">employment_type</span>.
        </p>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      <div className="sheet" style={{ marginBottom: 24 }}>
        <div className="sheet-header">
          <div className="eyebrow">{editingId ? "Edit rule" : "Add a rule"}</div>
        </div>
        <div className="sheet-body">
          <form onSubmit={handleSubmit}>
            <div className="field-row">
              <div className="field">
                <label htmlFor="field_name">Field name</label>
                <input
                  id="field_name"
                  value={form.field_name}
                  onChange={(e) => update("field_name", e.target.value)}
                  placeholder="credit_score"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="operator">Operator</label>
                <select id="operator" value={form.operator} onChange={(e) => update("operator", e.target.value)}>
                  {OPERATORS.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="value">Value</label>
              <input
                id="value"
                value={form.value}
                onChange={(e) => update("value", e.target.value)}
                placeholder="650"
                required
              />
            </div>
            <div className="field row" style={{ alignItems: "center" }}>
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) => update("active", e.target.checked)}
                style={{ width: "auto" }}
              />
              <label htmlFor="active" style={{ marginBottom: 0 }}>Active</label>
            </div>
            <div className="row">
              <button className="btn" type="submit" disabled={submitting}>
                {submitting ? "Saving…" : editingId ? "Save changes" : "Add rule"}
              </button>
              {editingId && (
                <button type="button" className="btn-outline btn" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="sheet">
        {loading ? (
          <div className="empty-state">Fetching rules…</div>
        ) : rules.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 6 }}>No rules on file</p>
            <p className="hint">Add a rule above to start scoring leads automatically.</p>
          </div>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Condition</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id} style={{ cursor: "default" }}>
                  <td className="mono">{rule.field_name}</td>
                  <td className="mono">{rule.operator} {rule.value}</td>
                  <td>
                    <span className={`stamp ${rule.active ? "approved" : "pending"}`}>
                      {rule.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="row">
                      <button className="btn-outline btn btn-sm" onClick={() => toggleActive(rule)}>
                        {rule.active ? "Deactivate" : "Activate"}
                      </button>
                      <button className="btn-outline btn btn-sm" onClick={() => startEdit(rule)}>
                        Edit
                      </button>
                      <button className="btn-danger btn btn-sm" onClick={() => handleDelete(rule)}>
                        Delete
                      </button>
                    </div>
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
