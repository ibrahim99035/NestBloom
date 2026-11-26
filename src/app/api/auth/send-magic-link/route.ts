import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'NestBloom <onboarding@resend.dev>';

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'البريد الإلكتروني غير صحيح' }, { status: 400 });
    }

    // Generate token and expiry (15 minutes)
    const token = generateToken();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    // Find or create user
    let user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    let userId: string;

    if (user.length === 0) {
      const [newUser] = await db.insert(users).values({
        id: crypto.randomUUID(),
        email,
        name: email.split('@')[0],
        verificationToken: token,
        verificationTokenExpires: expires,
      }).returning({ id: users.id });
      userId = newUser.id;
    } else {
      userId = user[0].id!;
      await db.update(users)
        .set({ verificationToken: token, verificationTokenExpires: expires })
        .where(eq(users.id, userId));
    }

    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/auth/magic-link/callback?token=${token}&email=${encodeURIComponent(email)}`;

    // Send email via Resend
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your_resend_api_key_here') {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: [email],
        subject: 'رابط تسجيل الدخول إلى نِست بلوم',
        html: `
          <div dir="rtl" style="font-family: system-ui, sans-serif; line-height: 1.6; color: #453a32; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #10b981;">مرحباً بك في نِست بلوم 🌸</h1>
            <p>انقر على الزر أدناه لتسجيل الدخول إلى حسابك:</p>
            <a href="${callbackUrl}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
              تسجيل الدخول
            </a>
            <p style="font-size: 14px; color: #6b6b6b;">
              هذا الرابط صالح لمدة 15 دقيقة فقط. إذا لم تطلب هذا الرابط، يمكنك تجاهل هذا البريد بأمان.
            </p>
          </div>
        `,
      });
    } else {
      // Dev mode: log the magic link
      console.log('┌──────────────────────────────────────────────');
      console.log('│ 🔐 Dev-mode magic link:');
      console.log('│ Email:', email);
      console.log('│ Token:', token);
      console.log('│ URL:', callbackUrl);
      console.log('└──────────────────────────────────────────────');
    }

    return NextResponse.json({ success: true, message: 'تم إرسال رابط الدخول إلى بريدك الإلكتروني' });
  } catch (err) {
    console.error('Send magic link error:', err);
    return NextResponse.json({ error: 'فشل إرسال الرابط. حاول مرة أخرى.' }, { status: 500 });
  }
}
