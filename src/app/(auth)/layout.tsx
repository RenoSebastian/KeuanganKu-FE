import type { Metadata } from "next";

// Metadata di sini akan menimpa (override) metadata Root khusus untuk halaman login & register
export const metadata: Metadata = {
  title: "Otentikasi | KeuanganKu",
  description: "Masuk atau daftar ke portal KeuanganKu",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="auth-wrapper w-full min-h-screen">
      {children}
    </main>
  );
}