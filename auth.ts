// auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      id: 'artist-credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const { data: artist, error } = await supabaseAdmin
          .from('artists')
          .select('id, email, password_hash, name, is_admin')
          .eq('email', email)
          .single();

        if (error || !artist) return null;

        const valid = await bcrypt.compare(password, artist.password_hash);
        if (!valid) return null;

        return {
          id: artist.id,
          email: artist.email,
          name: artist.name,
          isAdmin: artist.is_admin,
          role: 'artist',
        };
      },
    }),
    Credentials({
      id: 'user-credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const { data: user, error } = await supabaseAdmin
          .from('users')
          .select('id, email, password_hash, display_name')
          .eq('email', email)
          .single();

        if (error || !user) return null;

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.display_name,
          role: 'user',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accountId = user.id;
        token.role = (user as any).role;
        token.isAdmin = (user as any).isAdmin ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.accountId;
        (session.user as any).role = token.role;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: '/account/login',
  },
});