// File: src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// [FIX 1] Tambahkan '/auth' ke sini agar dianggap rute publik
const PUBLIC_ROUTES = [
  '/login', 
  '/register', 
  '/forgot-password', 
  '/auth/login', 
  '/auth/register'
];

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
  
  // Cek apakah rute saat ini ada di daftar public routes
  // [FIX] Logic startsWith diperbaiki agar lebih aman mencocokkan sub-path
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
      // PENTING: Jangan redirect jika ini adalah request API (/auth/...)
      // Biarkan API auth lewat meskipun user sudah login (misal untuk refresh token atau logout)
      if (pathname.startsWith('/auth')) {
          return NextResponse.next();
      }

      let targetDashboard = '/dashboard'; // Default User
      if (userRole === 'ADMIN') targetDashboard = '/admin/dashboard';
      if (userRole === 'DIRECTOR') targetDashboard = '/director/dashboard';

      return NextResponse.redirect(new URL(targetDashboard, request.url));
    }

    // 2. Proteksi Area EDUCATION (Shared Access: Admin & Director)
    if (isEducationArea) {
      const allowedRoles = ['ADMIN', 'DIRECTOR'];
      if (!userRole || !allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // 3. Proteksi Area ADMIN (General)
    if (isAdminArea) {
      if (userRole !== 'ADMIN') {
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
    // [FIX 2] Tambahkan 'auth' ke pengecualian matcher.
    // Ini cara paling ampuh: Middleware TIDAK AKAN JALAN sama sekali untuk request ke /auth/...
    '/((?!api|auth|_next/static|_next/image|favicon.ico|images|icons).*)',
  ],
};
