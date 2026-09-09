import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder_google_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder_google_client_secret",
    }),
    CredentialsProvider({
      name: "Kurdish Gamer Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "player@pitik.krd" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        return {
          id: "usr_" + Math.random().toString(36).substring(2, 9),
          name: credentials.email.split("@")[0] || "یاریزان",
          email: credentials.email,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "pitik_secret_development_key_32_bytes_long_central_kurdish",
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
