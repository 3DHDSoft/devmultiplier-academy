import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { recordHttpRequest, recordPageView } from '@/lib/metrics';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/courses', '/profile', '/enrollments'];

export function middleware(request: NextRequest) {
  const startTime = Date.now();

  // Check for session cookie (Auth.js uses 'authjs.session-token')
  const sessionCookie = request.cookies.has('authjs.session-token');
  const pathname = request.nextUrl.pathname;

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  let response: NextResponse;

  if (isProtectedRoute && !sessionCookie) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    response = NextResponse.redirect(loginUrl);
  } else {
    // Allow public routes
    response = NextResponse.next();
  }

  // Record metrics asynchronously (don't block response)
  const duration = Date.now() - startTime;
  const method = request.method;
  const statusCode = response.status;

  // Schedule metrics recording without blocking
  Promise.resolve().then(() => {
    // Record HTTP request metrics
    recordHttpRequest({
      method,
      route: pathname,
      statusCode,
      duration,
    });

    // Record page view for GET requests (exclude API routes and static assets)
    if (method === 'GET' && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
      recordPageView({
        path: pathname,
        isUnique: false, // Could be enhanced with session tracking
      });
    }
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (auth routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
