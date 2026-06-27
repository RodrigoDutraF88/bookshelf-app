import { type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

/**
 * Edge-safe NextAuth config — used ONLY by middleware.ts (Edge Runtime).
 *
 * This file must NEVER import `~/server/db` or `@auth/prisma-adapter`,
 * since Prisma's Node.js engine is not supported on the Edge Runtime.
 *
 * It only needs enough config to check `req.auth` in the `authorized`
 * callback. The full config (with the Prisma Adapter) lives in `config.ts`
 * and is used by route handlers / server components / tRPC (Node.js runtime).
 *
 * @see https://authjs.dev/guides/edge-compatibility
 */
export const authConfigEdge = {
  providers: [DiscordProvider],
  session: { strategy: "database" },
  callbacks: {
    authorized: ({ auth }) => !!auth?.user,
  },
} satisfies NextAuthConfig;