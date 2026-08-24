import { randomUUID } from "crypto";

import { db } from "~/server/db";

// Demo accounts are disposable: each visitor gets a fresh one, and anything
// older than this is deleted the next time somebody starts a demo.
const DEMO_LIFETIME_HOURS = 24;

/**
 * Deletes demo accounts past their lifetime. Any books, progress and reviews
 * the visitor added go with them through the cascade on User.
 */
export async function purgeExpiredDemoUsers() {
  const cutoff = new Date(Date.now() - DEMO_LIFETIME_HOURS * 60 * 60 * 1000);
  await db.user.deleteMany({
    where: { isDemo: true, createdAt: { lt: cutoff } },
  });
}

/** Creates a throwaway account with an empty library. */
export async function createDemoUser() {
  return db.user.create({
    data: {
      name: "Demo reader",
      email: `demo-${randomUUID()}@demo.invalid`,
      isDemo: true,
    },
    select: { id: true, name: true, email: true, image: true, isDemo: true, createdAt: true },
  });
}
