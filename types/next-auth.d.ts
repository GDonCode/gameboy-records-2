// types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  interface User {
    isAdmin?: boolean;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      isAdmin?: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    artistId?: string;
    isAdmin?: boolean;
    accountId?: string;
    role?: string;
    /** When this session signed in (ms). Sessions older than users.sessions_valid_after are ended. */
    signedInAt?: number;
    /** When the session was last checked against users.sessions_valid_after (ms). */
    sessionCheckedAt?: number;
  }
}