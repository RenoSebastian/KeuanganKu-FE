/**
 * Utilitas untuk mengamankan dan meresolusi URL gambar,
 * terutama untuk mengatasi aset statis (404) antara environment Backend dan Frontend.
 */
export const getImageUrl = (path: string | undefined | null): string => {
  // 1. Fallback jika data kosong dari database
  if (!path) {
    return '/images/placeholder-image.png';
  }

  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const baseUrl = rawApiUrl.replace(/\/api\/?$/, '');

  // 2. Normalisasi jika backend membubuhkan host internal localhost / 127.0.0.1
  let cleanPath = path;
  if (cleanPath.includes('localhost:4000') || cleanPath.includes('127.0.0.1:4000')) {
    cleanPath = cleanPath.replace(/^https?:\/\/(localhost|127\.0\.0\.1):4000/, '');
  }

  // 3. Jika setelah dinormalisasi masih merupakan URL eksternal valid (misal AWS S3 / Cloudinary)
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }

  // 4. Jika path mengarah ke file statis uploads backend
  if (cleanPath.startsWith('/uploads/')) {
    return `${baseUrl}${cleanPath}`;
  }

  if (cleanPath.startsWith('uploads/')) {
    return `${baseUrl}/${cleanPath}`;
  }

  // 5. Fallback untuk aset publik frontend Next.js (/images/...) atau path relatif lainnya
  return cleanPath;
};
