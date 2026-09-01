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
  }
}