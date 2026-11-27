import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { cookies } from 'next/headers';

/**
 * Dev-mode sign-in: creates a NextAuth session for a demo user.
 * Only for local development — remove in production.
 */
export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const { signIn } = await import('next-auth/react');
    // This is a server route, so we issue the session directly via NextAuth's
    // internal JWT. Simpler approach: set a session cookie via next-auth.

    // For NextAuth v4, we can create a session by calling the JWT encode.
    // But the simplest dev approach: redirect to the main sign-in with Google,
    // OR set a mock session. Here we issue a NextAuth-compatible session.

    const { encode } = await import('next-auth/jwt');
    const secret = process.env.NEXTAUTH_SECRET!;

    const token = await encode({
      secret,
      token: {
        id: 'dev-user-1',
        name: 'مستخدمة تجريبية',
        email: 'dev@nestbloom.app',
        picture: null,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
      },
      maxAge: 30 * 24 * 60 * 60,
    });

    const response = NextResponse.redirect(new URL(callbackUrl, req.url));

    // Set the next-auth session cookie
    response.cookies.set('next-auth.session-token', token, {
      httpOnly: true,
      secure: process.env.NEXTAUTH_URL?.startsWith('https'),
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    console.error('Dev sign-in error:', err);
    return NextResponse.json({ error: 'Dev sign-in failed' }, { status: 500 });
  }
}
