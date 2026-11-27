import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db/index';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { encode } from 'next-auth/jwt';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.redirect(new URL('/auth/signin?error=invalid_link', req.url));
    }

    // Find user with valid token
    const userList = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = userList[0];

    if (!user || user.verificationToken !== token) {
      return NextResponse.redirect(new URL('/auth/signin?error=invalid_token', req.url));
    }

    if (!user.verificationTokenExpires || new Date(user.verificationTokenExpires) < new Date()) {
      return NextResponse.redirect(new URL('/auth/signin?error=expired_token', req.url));
    }

    // Clear the token (one-time use)
    await db.update(users)
      .set({ verificationToken: null, verificationTokenExpires: null })
      .where(eq(users.id, user.id));

    // Create NextAuth session JWT
    const secret = process.env.NEXTAUTH_SECRET!;
    const jwt = await encode({
      secret,
      token: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.image,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
      },
      maxAge: 30 * 24 * 60 * 60,
    });

    const proto =
      req.headers.get('x-forwarded-proto') ??
      new URL(req.url).protocol.replace(':', '');
    const useSecureCookies = proto === 'https';
    const cookieName = useSecureCookies
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token';

    const response = NextResponse.redirect(new URL('/', req.url));
    response.cookies.set(cookieName, jwt, {
      httpOnly: true,
      secure: useSecureCookies,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    console.error('Magic link callback error:', err);
    return NextResponse.redirect(new URL('/auth/signin?error=server_error', req.url));
  }
}
