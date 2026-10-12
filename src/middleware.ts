// File: src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// [FIX 1] Tambahkan '/auth' ke sini agar dianggap rute publik
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth/login',
  '/auth/register',
  '/pricing',
  '/images',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rute legacy director langsung dialihkan ke dashboard
  if (pathname.startsWith('/director')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

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

  // Cek apakah rute saat ini ada di daftar public routes
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  const isRoot = pathname === '/';
  const isAdminArea = pathname.startsWith('/admin');

  // --- SKENARIO A: User SUDAH Login ---
  if (isAuth) {
    // 1. Redirect dari Public Route/Root ke Dashboard yang Sesuai
    if (isPublicRoute || isRoot) {
      if (pathname.startsWith('/auth')) {
        return NextResponse.next();
      }

      const targetDashboard = userRole === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
      return NextResponse.redirect(new URL(targetDashboard, request.url));
    }

    // 2. Proteksi Area ADMIN
    if (isAdminArea) {
      if (userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  // --- SKENARIO B: User BELUM Login ---
  if (!isAuth) {
    // 1. Landing Page & Public Route (termasuk /auth/register) boleh diakses
    if (isRoot || isPublicRoute) {
      return NextResponse.next();
    }

    // 2. Sisanya (Dashboard, Protected Routes) -> Redirect ke Login
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
    // Kecualikan file statis, aset PWA, service worker, dan endpoint internal dari middleware
    '/((?!api|_next/static|_next/image|favicon\\.ico|images|icons|sw\\.js|manifest\\.webmanifest|workbox-.*\\.js).*)',
  ],
};