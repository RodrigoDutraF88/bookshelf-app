import NextAuth from "next-auth";

import { authConfigEdge } from "./config.edge";

/**
 * Edge-safe `auth` export — used ONLY by middleware.ts.
 * Built from `authConfigEdge`, which has no Prisma Adapter.
 */
export const { auth } = NextAuth(authConfigEdge);