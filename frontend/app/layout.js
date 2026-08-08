import "./globals.css";

export const metadata = {
  title: "Ledger — Loan Origination",
  description: "Loan lead intake, BRE rules and underwriting workspace",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
