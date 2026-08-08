"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LeadsAPI, getCurrentUserId } from "@/lib/api";
import LeadForm from "@/components/LeadForm";

export default function NewLeadPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(payload) {
    setError("");
    setSubmitting(true);
    try {
      const lead = await LeadsAPI.create({ ...payload, user: getCurrentUserId() });
      router.push(`/dashboard/leads/${lead.id}`);
    } catch (err) {
      setError(err.message || "Could not save this lead.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 22 }}>
        <div className="eyebrow">New register entry</div>
        <h1 style={{ fontSize: 28, marginTop: 4 }}>Capture a lead</h1>
      </div>
      <div className="sheet">
        <div className="sheet-body">
          {error && <div className="banner banner-error">{error}</div>}
          <LeadForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Add to register" />
        </div>
      </div>
    </div>
  );
}
