import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCallerFactory } from "~/server/api/trpc";
import { progressRouter } from "~/server/api/routers/progress";
import { createMockContext } from "../setup";

const createCaller = createCallerFactory(progressRouter);

const USER_ID  = "clh3z2k0x0000356xkxjq9abc";
const OTHER_ID = "clh3z2k0x0000356xkxjq9xyz";
const BOOK_ID  = "clh3z2k0x0000356xkxjq9def";

describe("progress.upsert", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws UNAUTHORIZED without a session", async () => {
    const ctx = createMockContext(undefined);
    const caller = createCaller(ctx as never);
    await expect(
      caller.upsert({ bookId: BOOK_ID, currentPage: 50 }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN when updating another user's book", async () => {
    const ctx = createMockContext(OTHER_ID);
    vi.mocked(ctx.db.book.findUnique).mockResolvedValue({ userId: USER_ID } as never);
    const caller = createCaller(ctx as never);
    await expect(
      caller.upsert({ bookId: BOOK_ID, currentPage: 100 }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(ctx.db.readingProgress.upsert).not.toHaveBeenCalled();
  });

  it("throws NOT_FOUND when book does not exist", async () => {
    const ctx = createMockContext(USER_ID);
    vi.mocked(ctx.db.book.findUnique).mockResolvedValue(null as never);
    const caller = createCaller(ctx as never);
    await expect(
      caller.upsert({ bookId: BOOK_ID, currentPage: 10 }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("upserts progress when owner requests it", async () => {
    const ctx = createMockContext(USER_ID);
    vi.mocked(ctx.db.book.findUnique).mockResolvedValue({ userId: USER_ID } as never);
    vi.mocked(ctx.db.readingProgress.upsert).mockResolvedValue({
      id: "clh3z2k0x0000356xkxjq9ppp", bookId: BOOK_ID,
      currentPage: 150, totalPages: 300,
      startedAt: null, finishedAt: null, updatedAt: new Date(),
    } as never);
    const caller = createCaller(ctx as never);
    const result = await caller.upsert({ bookId: BOOK_ID, currentPage: 150 });
    expect(result.currentPage).toBe(150);
  });
});

describe("progress.get", () => {
  it("returns null when no progress record exists", async () => {
    const ctx = createMockContext(USER_ID);
    vi.mocked(ctx.db.book.findUnique).mockResolvedValue({ userId: USER_ID } as never);
    vi.mocked(ctx.db.readingProgress.findUnique).mockResolvedValue(null as never);
    const caller = createCaller(ctx as never);
    const result = await caller.get({ bookId: BOOK_ID });
    expect(result).toBeNull();
  });
});