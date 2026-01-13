import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { recordHttpRequest, recordPageView } from '@/lib/metrics';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/enrollments'];

// Routes that require authentication only for nested paths
// e.g., /courses is public, but /courses/[id] requires auth
const protectedNestedRoutes = ['/courses'];

export function middleware(request: NextRequest) {
  const startTime = Date.now();

  // Check for session cookie (Auth.js uses 'authjs.session-token' in dev, '__Secure-authjs.session-token' in production with HTTPS)
  const sessionCookie =
    request.cookies.has('authjs.session-token') ||
    request.cookies.has('__Secure-authjs.session-token');
  const pathname = request.nextUrl.pathname;

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Check if the route is a nested protected route (e.g., /courses/[id] but not /courses)
  const isProtectedNestedRoute = protectedNestedRoutes.some((route) => {
    // Must start with the route AND have additional path segments
    if (!pathname.startsWith(route)) return false;
    const remainingPath = pathname.slice(route.length);
    // Must have content after the base route (not just "/" or empty)
    return remainingPath.length > 1 && remainingPath.startsWith('/');
  });

  let response: NextResponse;

  if ((isProtectedRoute || isProtectedNestedRoute) && !sessionCookie) {
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
