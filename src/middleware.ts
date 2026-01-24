import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Target Protection: Intercept request ke rute Direksi
  if (request.nextUrl.pathname.startsWith('/director')) {
    
    // 2. Token Extraction
    // Mengambil token dari cookies (Nama cookie disesuaikan: 'accessToken' atau 'token')
    const token = request.cookies.get('accessToken')?.value || request.cookies.get('token')?.value;

    // 3. Gate 1: No Token -> Redirect ke Login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      // UX: Simpan URL tujuan agar bisa redirect balik setelah login
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // 4. Decode Token (Edge Compatible)
      const user = decodeJwt(token);
      
      // 5. Gate 2: Role Validation
      // Pastikan payload token memiliki property 'role' sesuai Backend
      if (!user || user.role !== 'DIRECTOR') {
        // Jika bukan Direksi, lempar ke halaman Forbidden atau Dashboard biasa
        // Pastikan Anda nanti membuat page src/app/403/page.tsx atau redirect ke '/'
        return NextResponse.redirect(new URL('/403', request.url));
      }

      // 6. Access Granted
      return NextResponse.next();

    } catch (error) {
      // Token corrupt atau tampered -> Paksa Login ulang
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Loloskan request selain /director/*
  return NextResponse.next();
}

// -----------------------------------------------------------------------------
// HELPER: JWT Decoder for Edge Runtime
// -----------------------------------------------------------------------------
// Kita tidak bisa pakai library 'jsonwebtoken' di Middleware (Edge).
// Fungsi ini mendecode payload base64 secara manual.
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

// -----------------------------------------------------------------------------
// CONFIG: Matcher
// -----------------------------------------------------------------------------
export const config = {
  // Middleware hanya aktif pada rute ini untuk menghemat resource server
  matcher: ['/director/:path*'],
};