/**
 * Utilitas untuk mengamankan dan meresolusi URL gambar,
 * terutama untuk mengatasi aset statis (404) antara environment Backend dan Frontend.
 */
export const getImageUrl = (path: string | undefined | null): string => {
  // 1. Fallback jika data kosong dari database
  if (!path) {
    return '/images/placeholder-image.png';
  }

  // 2. Apabila path sudah berupa URL absolut (External seperti AWS S3, atau Backend Interceptor)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // 3. Apabila path adalah relative local environment Frontend (misal aset di public folder Next.js)
  // Biasa dimulai dengan /images/, /assets/, dll.
  // Tapi jika dia spesifik dari uploads backend (contoh: /uploads/...), kita arahkan ke API_URL
  if (path.startsWith('/uploads/')) {
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const baseUrl = rawApiUrl.replace(/\/api\/?$/, '');
    return `${baseUrl}${path}`;
  }

  // Fallback terakhir: Kembalikan path original apa adanya
  return path;
};
