import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

/**
 * NextAuth v4's App Router handler computes its base URL from request headers
 * only when `VERCEL`/`AUTH_TRUST_HOST` is set; otherwise it silently falls
 * back to http://localhost:3000. That breaks redirects, cookie prefixes and
 * the providers endpoint in production. Pin the base URL to the real request
 * origin before delegating.
 */
function resolveOrigin(req: NextRequest): string | null {
  const host =
    req.headers.get('x-forwarded-host') ??
    req.headers.get('host') ??
    req.nextUrl.host;
  if (!host) return null;

  const proto =
    req.headers.get('x-forwarded-proto') ??
    req.nextUrl.protocol.replace(':', '') ??
    'https';

  return `${proto}://${host}`;
}

async function authHandler(req: NextRequest, ctx: { params: Promise<{ nextauth: string[] }> }) {
  const origin = resolveOrigin(req);
  const current = process.env.NEXTAUTH_URL;

  if (origin && (!current || current.includes('localhost'))) {
    process.env.NEXTAUTH_URL = origin;
  }

  return handler(req, ctx);
}

export { authHandler as GET, authHandler as POST };
