"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthed } from "@/lib/api";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthed()) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="auth-shell">
        <p className="hint">Checking your session…</p>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Navbar />
      <main className="container" style={{ paddingTop: 32, paddingBottom: 60, flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
