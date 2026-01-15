import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KeuanganKu - PAM JAYA', // Nama Lengkap Aplikasi
    short_name: 'KeuanganKu',      // Nama di bawah icon HP
    description: 'Aplikasi Perencanaan Keuangan Karyawan PAM JAYA',
    start_url: '/',
    display: 'standalone',         // Tampilan Native (tanpa browser bar)
    background_color: '#ffffff',
    theme_color: '#0056b3',        // Biru PAM JAYA (sesuai history file Anda)
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      // Opsional: Maskable icon (safe zone untuk icon bulat)
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
  }
}