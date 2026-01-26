// File: src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Daftar rute yang bisa diakses tanpa login
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Ambil Token dari Cookies (Prioritas utama untuk Middleware)
  // Token ini diset oleh Login Page menggunakan js-cookie
  const token = request.cookies.get('token')?.value || request.cookies.get('accessToken')?.value;

  // 2. Decode Token (Basic Payload Check) untuk tahu Role
  let userRole = null;
  if (token) {
    try {
      const decoded = decodeJwt(token);
      userRole = decoded?.role;
    } catch (e) {
      console.error("Invalid Token in Middleware");
    }
  }

  const isAuth = !!token;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isRoot = pathname === '/';
  const isDirectorRoute = pathname.startsWith('/director');

  // --- SKENARIO A: User SUDAH Login ---
  if (isAuth) {
    // 1. Jika buka Halaman Login/Register atau Root (Landing Page), 
    // Redirect paksa ke Dashboard masing-masing (biar gak login ulang)
    if (isPublicRoute || isRoot) {
      const targetDashboard = userRole === 'DIRECTOR' ? '/director/dashboard' : '/dashboard';
      return NextResponse.redirect(new URL(targetDashboard, request.url));
    }

    // 2. Proteksi Halaman Director
    if (isDirectorRoute) {
      if (userRole !== 'DIRECTOR') {
        // User biasa coba masuk area Direksi -> Balikin ke kandang (User Dashboard)
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  // --- SKENARIO B: User BELUM Login ---
  if (!isAuth) {
    // 1. Jika buka Root (/), biarkan saja (Tampilkan Landing Page)
    if (isRoot) {
      return NextResponse.next();
    }

    // 2. Jika buka halaman selain Public Route (misal: /dashboard, /finance),
    // Redirect ke Login
    if (!isPublicRoute) {
      const loginUrl = new URL('/login', request.url);
      // Simpan URL tujuan agar nanti bisa redirect balik setelah login (UX)
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Lolos semua pengecekan -> Lanjut
  return NextResponse.next();
}

// --- HELPER: JWT Decoder (Edge Runtime Compatible) ---
// Middleware Next.js jalan di Edge, jadi tidak bisa pakai library berat.
function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Konfigurasi Matcher (Hanya jalan di path tertentu agar performa optimal)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - icons (public icons)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)',
  ],
};