import { redirect } from 'next/navigation';

// Halaman ini bertindak sebagai "Gateway".
// Tidak ada UI yang dirender di sini. User langsung diarahkan ke Dashboard utama.
export default function DirectorRootPage() {
  redirect('/director/dashboard');
}