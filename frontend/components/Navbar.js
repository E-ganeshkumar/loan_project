"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/api";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="ledger-mark">
          Ledger <span className="no">LOAN OPS</span>
        </div>
        <div className="row">
          <nav className="tabs">
            <Link
              href="/dashboard/leads"
              className={`tab ${pathname?.startsWith("/dashboard/leads") ? "active" : ""}`}
            >
              Leads
            </Link>
            <Link
              href="/dashboard/rules"
              className={`tab ${pathname?.startsWith("/dashboard/rules") ? "active" : ""}`}
            >
              BRE Rules
            </Link>
          </nav>
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
