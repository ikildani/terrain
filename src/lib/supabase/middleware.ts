import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function setCorsHeaders(res: NextResponse, origin: string | null) {
  const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || '';
  if (
    origin &&
    (origin === allowedOrigin || origin === 'http://localhost:3000' || origin === 'https://terrain.ambrosiaventures.co')
  ) {
    res.headers.set('Access-Control-Allow-Origin', origin);
  }
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.headers.set('Access-Control-Max-Age', '86400');
}

export async function updateSession(request: NextRequest) {
  const origin = request.headers.get('origin');

  // Handle CORS preflight for API routes
  if (request.method === 'OPTIONS' && request.nextUrl.pathname.startsWith('/api/')) {
    const preflightResponse = new NextResponse(null, { status: 204 });
    setCorsHeaders(preflightResponse, origin);
    return preflightResponse;
  }

  let response = NextResponse.next({
    request,
  });

  // Deny access when Supabase is not configured — don't silently allow through
  if (!supabaseUrl || !supabaseKey) {
    const isApiRoute = request.nextUrl.pathname.startsWith('/api/');
    if (isApiRoute) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    // For page routes, return 503
    return new NextResponse('Service Unavailable', { status: 503 });
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect all authenticated routes
  // The (dashboard) route group doesn't add /dashboard to URLs,
  // so module pages like /market-sizing, /competitive, etc. need explicit protection.
  const PROTECTED_PREFIXES = [
    '/dashboard',
    '/market-sizing',
    '/competitive',
    '/partners',
    '/regulatory',
    '/reports',
    '/settings',
    '/onboarding',
    '/workspace',
  ];
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => request.nextUrl.pathname.startsWith(prefix));

  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.nextUrl);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // ────────────────────────────────────────────────────────────
  // Protect API routes (defense-in-depth)
  // Individual route handlers still perform their own auth,
  // but middleware blocks unauthenticated requests early.
  // ────────────────────────────────────────────────────────────
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/api/')) {
    // Routes that must remain publicly accessible
    const PUBLIC_API_PREFIXES = [
      '/api/stripe/webhook', // Stripe signature-verified
      '/api/cron/', // Vercel cron (uses CRON_SECRET)
      '/api/health', // Health check
      '/api/share/', // Public shared report access
      '/api/v1/', // v1 public API (uses API key auth, not session)
    ];

    const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    if (!isPublicApi && !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
  }

  // ────────────────────────────────────────────────────────────
  // CSP — 'self' + 'unsafe-inline' for script-src.
  // Next.js 16 does not reliably propagate nonces to <script> tags,
  // so we use 'unsafe-inline' to allow framework-generated inline
  // scripts. Host allowlists restrict loading to known domains.
  // ────────────────────────────────────────────────────────────
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://js.stripe.com https://*.vercel-scripts.com https://us.i.posthog.com",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.sentry.io https://*.ingest.sentry.io https://vitals.vercel-insights.com https://us.i.posthog.com https://*.posthog.com",
    'frame-src https://js.stripe.com',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // Set CORS headers on API responses
  if (request.nextUrl.pathname.startsWith('/api/')) {
    setCorsHeaders(response, origin);
  }

  return response;
}
