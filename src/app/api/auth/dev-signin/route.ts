import { NextResponse } from 'next/server';
import { encode } from 'next-auth/jwt';
import { DEFAULT_ACCOUNT } from '@/lib/auth';

/**
 * Instant sign-in without an email round-trip.
 * Issues a NextAuth-compatible session cookie for the default account.
 */
export async function POST(req: Request) {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'NEXTAUTH_SECRET is not configured' }, { status: 500 });
    }

    const maxAge = 30 * 24 * 60 * 60;
    const token = await encode({
      secret,
      token: {
        id: DEFAULT_ACCOUNT.id,
        name: DEFAULT_ACCOUNT.name,
        email: DEFAULT_ACCOUNT.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + maxAge,
      },
      maxAge,
    });

    // NextAuth uses a "__Secure-" prefix whenever cookies are secure.
    // Writing the unprefixed name silently breaks the session on HTTPS.
    const useSecureCookies =
      process.env.NEXTAUTH_URL?.startsWith('https://') || !!process.env.VERCEL;
    const cookieName = useSecureCookies
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token';

    const response = NextResponse.json({ ok: true, user: DEFAULT_ACCOUNT });
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: useSecureCookies,
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return response;
  } catch (err) {
    console.error('Quick sign-in error:', err);
    return NextResponse.json({ error: 'Quick sign-in failed' }, { status: 500 });
  }
}
