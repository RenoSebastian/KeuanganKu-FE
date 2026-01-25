// File: src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // -----------------------------------------------------------------------------
  // 1. DIRECTOR AREA PROTECTION
  // -----------------------------------------------------------------------------
  if (pathname.startsWith('/director')) {
    
    // A. Ambil Token (Prioritaskan Cookies karena lebih aman untuk Middleware)
    const token = request.cookies.get('token')?.value || request.cookies.get('accessToken')?.value;

    // B. Gate 1: Belum Login? -> Tendang ke Login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // C. Decode Token (Manual Decoder untuk Edge Runtime)
      const user = decodeJwt(token);

      // D. Gate 2: Salah Role? -> Tendang ke 403 atau Dashboard User biasa
      // Pastikan string 'DIRECTOR' sama persis dengan yang di Backend (Case Sensitive)
      if (!user || user.role !== 'DIRECTOR') {
        // Option A: Redirect ke halaman Forbidden khusus
        // return NextResponse.redirect(new URL('/403', request.url));
        
        // Option B: Redirect balik ke Dashboard User (Lebih soft)
        return NextResponse.redirect(new URL('/', request.url));
      }

      // E. Lolos Security Check -> Izinkan masuk
      return NextResponse.next();

    } catch (error) {
      // Token tidak valid/rusak -> Paksa Login ulang
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // -----------------------------------------------------------------------------
  // 2. PUBLIC/OTHER ROUTES
  // -----------------------------------------------------------------------------
  return NextResponse.next();
}

// --- HELPER: JWT Decoder (Edge Compatible) ---
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

// --- CONFIG ---
export const config = {
  // Middleware hanya aktif di route Director untuk performa optimal
  matcher: ['/director/:path*'],
};