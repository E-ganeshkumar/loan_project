"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthed } from "@/lib/api";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(isAuthed() ? "/dashboard/leads" : "/login");
  }, [router]);

  return (
    <div className="auth-shell">
      <p className="hint">Loading…</p>
    </div>
  );
}
