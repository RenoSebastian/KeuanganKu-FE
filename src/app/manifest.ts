import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KeuanganKu',
    short_name: 'KeuanganKu',
    description: 'Platform Perencanaan Keuangan & Simulasi Finansial Profesional untuk Agen',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0056b3',
    icons: [
      {
        src: '/icons/icon.png', // Pastikan file ini ada di public/icons/icon.png
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
  }
}