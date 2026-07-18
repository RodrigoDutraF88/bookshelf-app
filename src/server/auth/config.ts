import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig, type Session } from "next-auth";
import { db } from "~/server/db";
import { authConfigEdge } from "./config.edge";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      createdAt: string;
    } & DefaultSession["user"];
  }
}

export const authConfig = {
  ...authConfigEdge,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfigEdge.callbacks,
    jwt: async ({ token, user }) => {
      if (user) {
        token.sub = user.id;
        (token as Record<string, unknown>).createdAt =
          (user as unknown as { createdAt: Date }).createdAt?.toISOString();
      }
      return token;
    },
    session: ({ session, token }): Session => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub!,
        createdAt:
          ((token as Record<string, unknown>).createdAt as string) ??
          new Date().toISOString(),
      },
    }),
  },
} satisfies NextAuthConfig;