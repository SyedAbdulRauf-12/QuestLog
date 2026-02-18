import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        // Ensuring your QuestLog stats are passed to the frontend
        session.user.level = token.level as string || "1";
        session.user.class = token.class as string || "Novice";
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.level = user.level;
        token.class = user.class;
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST };