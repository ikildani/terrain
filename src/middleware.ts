import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Generate a nonce for CSP (Next.js 15 propagates this to scripts)
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  return await updateSession(request, nonce);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
