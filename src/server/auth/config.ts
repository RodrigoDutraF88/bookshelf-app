import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";

import { db } from "~/server/db";
import { authConfigEdge } from "./config.edge";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Full NextAuth.js config — used by route handlers, server components, and tRPC context.
 * Runs on the Node.js runtime, so it's safe to include the Prisma Adapter here.
 *
 * @see https://next-auth.js.org/configuration/options
 */
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
      },
    }),
  },
} satisfies NextAuthConfig;