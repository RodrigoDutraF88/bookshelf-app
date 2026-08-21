import NextAuth from "next-auth";

import { authConfigEdge } from "./config.edge";

// Edge-safe: authConfigEdge omits the Prisma adapter, which cannot run in middleware.
export const { auth } = NextAuth(authConfigEdge);