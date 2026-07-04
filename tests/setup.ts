import { vi } from "vitest";


export function createMockPrisma() {
  return {
    book: {
      findMany:  vi.fn(),
      findUnique: vi.fn(),
      create:    vi.fn(),
      update:    vi.fn(),
      delete:    vi.fn(),
    },
    readingProgress: {
      findUnique: vi.fn(),
      upsert:    vi.fn(),
    },
    review: {
      findUnique: vi.fn(),
      upsert:    vi.fn(),
      delete:    vi.fn(),
    },
  };
}


export function createMockSession(userId = "user-abc") {
  return {
    user: {
      id:    userId,
      name:  "Test User",
      email: "test@example.com",
      image: null,
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };
}


export function createMockContext(
  userId?: string,
  overrides: Record<string, unknown> = {},
) {
  const db = createMockPrisma();
  const session = userId ? createMockSession(userId) : null;

  return {
    db,
    session,
    headers: new Headers(),
    ...overrides,
  };
}