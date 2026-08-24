import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig, type Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "~/server/db";
import { createDemoUser, purgeExpiredDemoUsers } from "~/server/demo";
import { authConfigEdge } from "./config.edge";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      createdAt: string;
      isDemo: boolean;
    } & DefaultSession["user"];
  }
}

/**
 * Anonymous "try it out" sign-in. It takes no credentials at all — every
 * attempt mints a fresh throwaway account, so there is nothing to guess.
 * Lives here rather than in config.edge because it needs Prisma, which cannot
 * run in the middleware's edge runtime.
 */
const demoProvider = Credentials({
  id: "demo",
  name: "Demo",
  credentials: {},
  authorize: async () => {
    await purgeExpiredDemoUsers();
    const user = await createDemoUser();
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      isDemo: user.isDemo,
      createdAt: user.createdAt,
    };
  },
});

export const authConfig = {
  ...authConfigEdge,
  providers: [...authConfigEdge.providers, demoProvider],
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfigEdge.callbacks,
    jwt: async ({ token, user }) => {
      if (user) {
        token.sub = user.id;
        const record = user as unknown as { createdAt?: Date; isDemo?: boolean };
        (token as Record<string, unknown>).createdAt = record.createdAt?.toISOString();
        (token as Record<string, unknown>).isDemo = record.isDemo ?? false;
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
        isDemo: ((token as Record<string, unknown>).isDemo as boolean) ?? false,
      },
    }),
  },
} satisfies NextAuthConfig;
