// auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client();

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
        if (!user.password_hash) return null;

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
  Credentials({
      id: 'google-onetap',
      credentials: {
        credential: { label: 'Google credential', type: 'text' },
      },
      async authorize(credentials) {
        const idToken = credentials?.credential as string | undefined;
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!idToken || !clientId) return null;

        let payload;
        try {
          const ticket = await googleClient.verifyIdToken({ idToken, audience: clientId });
          payload = ticket.getPayload();
        } catch {
          return null;
        }

        if (!payload?.email || !payload.email_verified) return null;

        const { data: existing, error: lookupError } = await supabaseAdmin
          .from('users')
          .select('id, email, display_name')
          .eq('email', payload.email)
          .maybeSingle();

        if (lookupError) return null;

        let user = existing;

        if (!user) {
          const { data: created, error: insertError } = await supabaseAdmin
            .from('users')
            .insert({
              email: payload.email,
              display_name: payload.name?.trim() || payload.email.split('@')[0],
              avatar_url: payload.picture ?? null,
            })
            .select('id, email, display_name')
            .single();

          if (insertError || !created) return null;
          user = created;
        }

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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.accountId;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/account/login',
  },
});