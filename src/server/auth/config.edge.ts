import { type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";

/**
 * Edge-safe NextAuth config — used ONLY by middleware.ts (Edge Runtime).
 *
 * Must NEVER import ~/server/db or @auth/prisma-adapter.
 * Adding Google here makes it available for the authorized() check
 * in middleware without pulling in Node.js-only dependencies.
 */
export const authConfigEdge = {
  providers: [
    DiscordProvider,
    GoogleProvider,
  ],
  session: { strategy: "database" },
  callbacks: {
    authorized: ({ auth }) => !!auth?.user,
  },
} satisfies NextAuthConfig;