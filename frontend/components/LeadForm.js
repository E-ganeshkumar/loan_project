"use client";

import { useState } from "react";

const LOAN_TYPES = ["Home Loan", "Personal Loan", "Business Loan", "Loan Against Property", "Auto Loan"];
const EMPLOYMENT_TYPES = ["Salaried", "Self-Employed", "Business Owner"];

const EMPTY = {
  full_name: "",
  mobile: "",
  dob: "",
  city: "",
  pincode: "",
  loan_type: LOAN_TYPES[0],
  employment_type: EMPLOYMENT_TYPES[0],
  monthly_income: "",
  loan_amount: "",
  property_value: "",
};

export default function LeadForm({ initial, onSubmit, submitLabel = "Save entry", submitting }) {
  const [form, setForm] = useState({ ...EMPTY, ...(initial || {}) });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      ...form,
      monthly_income: Number(form.monthly_income),
      loan_amount: Number(form.loan_amount),
      property_value: Number(form.property_value),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field-row">
        <div className="field">
          <label htmlFor="full_name">Full name</label>
          <input id="full_name" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="mobile">Mobile number</label>
          <input id="mobile" value={form.mobile} onChange={(e) => update("mobile", e.target.value)} required maxLength={15} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="dob">Date of birth</label>
          <input id="dob" type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="city">City</label>
          <input id="city" value={form.city} onChange={(e) => update("city", e.target.value)} required />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="pincode">Pincode</label>
          <input id="pincode" value={form.pincode} onChange={(e) => update("pincode", e.target.value)} required maxLength={6} />
        </div>
        <div className="field">
          <label htmlFor="employment_type">Employment type</label>
          <select id="employment_type" value={form.employment_type} onChange={(e) => update("employment_type", e.target.value)}>
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="loan_type">Loan type</label>
        <select id="loan_type" value={form.loan_type} onChange={(e) => update("loan_type", e.target.value)}>
          {LOAN_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="monthly_income">Monthly income (₹)</label>
          <input id="monthly_income" type="number" min="0" value={form.monthly_income} onChange={(e) => update("monthly_income", e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="loan_amount">Loan amount sought (₹)</label>
          <input id="loan_amount" type="number" min="0" value={form.loan_amount} onChange={(e) => update("loan_amount", e.target.value)} required />
        </div>
      </div>

      <div className="field">
        <label htmlFor="property_value">Property value (₹)</label>
        <input id="property_value" type="number" min="0" value={form.property_value} onChange={(e) => update("property_value", e.target.value)} required />
      </div>

      <button className="btn btn-block" type="submit" disabled={submitting}>
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
