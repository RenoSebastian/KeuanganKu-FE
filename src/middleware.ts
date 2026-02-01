// File: src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Daftar rute yang bisa diakses tanpa login
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Ambil Token dari Cookies
  const token = request.cookies.get('token')?.value || request.cookies.get('accessToken')?.value;

  // 2. Decode Token untuk tahu Role
  let userRole: string | null = null;
  if (token) {
    try {
      const decoded = decodeJwt(token);
      userRole = decoded?.role || null;
    } catch (e) {
      console.error("Invalid Token in Middleware");
    }
  }

  const isAuth = !!token;
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  const isRoot = pathname === '/';

  // Definisi Scope Area
  const isDirectorArea = pathname.startsWith('/director');
  const isAdminArea = pathname.startsWith('/admin');
  const isEducationArea = pathname.startsWith('/admin/education');

  // --- SKENARIO A: User SUDAH Login ---
  if (isAuth) {
    // 1. Redirect dari Public Route/Root ke Dashboard yang Sesuai
    if (isPublicRoute || isRoot) {
      let targetDashboard = '/dashboard'; // Default User
      if (userRole === 'ADMIN') targetDashboard = '/admin/dashboard';
      if (userRole === 'DIRECTOR') targetDashboard = '/director/dashboard';

      return NextResponse.redirect(new URL(targetDashboard, request.url));
    }

    // 2. Proteksi Area EDUCATION (Shared Access: Admin & Director)
    // Ini dicek duluan karena berada di dalam path /admin
    if (isEducationArea) {
      const allowedRoles = ['ADMIN', 'DIRECTOR'];
      if (!userRole || !allowedRoles.includes(userRole)) {
        // User biasa tidak boleh masuk sini
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      // Jika lolos, return next (biar gak kena cek admin area di bawah)
      return NextResponse.next();
    }

    // 3. Proteksi Area ADMIN (General)
    // Semua path /admin selain education hanya untuk Role ADMIN
    if (isAdminArea) {
      if (userRole !== 'ADMIN') {
        // Director pun ditendang jika coba akses admin core (users/settings)
        const fallback = userRole === 'DIRECTOR' ? '/director/dashboard' : '/dashboard';
        return NextResponse.redirect(new URL(fallback, request.url));
      }
    }

    // 4. Proteksi Area DIRECTOR
    if (isDirectorArea) {
      if (userRole !== 'DIRECTOR') {
        const fallback = userRole === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
        return NextResponse.redirect(new URL(fallback, request.url));
      }
    }
  }

  // --- SKENARIO B: User BELUM Login ---
  if (!isAuth) {
    // 1. Landing Page boleh diakses
    if (isRoot) {
      return NextResponse.next();
    }

    // 2. Halaman publik boleh diakses
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // 3. Sisanya (Dashboard, Protected Routes) -> Redirect ke Login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// --- HELPER: JWT Decoder (Edge Runtime Compatible) ---
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

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)',
  ],
};