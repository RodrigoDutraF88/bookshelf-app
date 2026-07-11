import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
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
  callbacks: {
    ...authConfigEdge.callbacks,
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        createdAt: (user as unknown as { createdAt: Date }).createdAt
          ?.toISOString() ?? new Date().toISOString(),
      },
    }),
  },
} satisfies NextAuthConfig;