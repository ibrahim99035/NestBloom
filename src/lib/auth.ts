import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

/**
 * The default account used by the one-tap "quick login" flow.
 * It is intentionally stable so local data (pregnancy dates, trackers,
 * journal) always belongs to the same account.
 */
export const DEFAULT_ACCOUNT = {
  id: 'default-user',
  name: 'سارة',
  email: 'guest@nestbloom.app',
} as const;

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      id: 'quick',
      name: 'دخول سريع',
      credentials: {},
      async authorize() {
        // Always succeeds: this is a personal, single-user companion app.
        return {
          id: DEFAULT_ACCOUNT.id,
          name: DEFAULT_ACCOUNT.name,
          email: DEFAULT_ACCOUNT.email,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id?: string }).id ?? DEFAULT_ACCOUNT.id;
        token.name = user.name ?? DEFAULT_ACCOUNT.name;
        token.email = user.email ?? DEFAULT_ACCOUNT.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        session.user.name = (token.name as string) ?? DEFAULT_ACCOUNT.name;
        session.user.email = (token.email as string) ?? DEFAULT_ACCOUNT.email;
      }
      return session;
    },
  },
};
