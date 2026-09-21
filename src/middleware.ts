import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if user is logged in
  const token = request.cookies.get('token')?.value;
  const userStr = request.cookies.get('user')?.value;
  let user = null;
  
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      user = null;
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Allow access to admin signin page
    if (pathname === '/admin/signin') {
      // If already logged in as admin, redirect to admin panel
      if (user?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // For all other admin routes, check admin role
    if (!user || user.role !== 'admin') {
      // Redirect non-admin users to customer login or admin signin
      if (user && user.role !== 'admin') {
        // User is logged in but not admin - redirect to customer area
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      // Not logged in at all - redirect to admin signin
      return NextResponse.redirect(new URL('/admin/signin', request.url));
    }
  }

  // Redirect admin users away from customer login
  if (pathname === '/login' && user?.role === 'admin') {
    return NextResponse.redirect(new URL('/admin/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
    '/dashboard/:path*',
  ],
};