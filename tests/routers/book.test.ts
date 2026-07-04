import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { createCallerFactory } from "~/server/api/trpc";
import { bookRouter } from "~/server/api/routers/book";
import { createMockContext } from "../setup";

const createCaller = createCallerFactory(bookRouter);


const USER_ID  = "clh3z2k0x0000356xkxjq9abc";
const OTHER_ID = "clh3z2k0x0000356xkxjq9xyz";
const BOOK_ID  = "clh3z2k0x0000356xkxjq9def";

describe("book.getAll", () => {
  it("returns only books belonging to the authenticated user", async () => {
    const ctx = createMockContext(USER_ID);
    vi.mocked(ctx.db.book.findMany).mockResolvedValue([] as never);
    const caller = createCaller(ctx as never);
    await caller.getAll({});
    expect(ctx.db.book.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: USER_ID }),
      }),
    );
  });

  it("throws UNAUTHORIZED without a session", async () => {
    const ctx = createMockContext(undefined);
    const caller = createCaller(ctx as never);
    await expect(caller.getAll({})).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("filters by status when provided", async () => {
    const ctx = createMockContext(USER_ID);
    vi.mocked(ctx.db.book.findMany).mockResolvedValue([] as never);
    const caller = createCaller(ctx as never);
    await caller.getAll({ status: "COMPLETED" });
    expect(ctx.db.book.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: USER_ID, status: "COMPLETED" }),
      }),
    );
  });
});

describe("book.create", () => {
  it("sets userId from session, not from user input", async () => {
    const ctx = createMockContext(USER_ID);
    vi.mocked(ctx.db.book.create).mockResolvedValue({ id: BOOK_ID, userId: USER_ID } as never);
    const caller = createCaller(ctx as never);
    await caller.create({ title: "Dune", author: "Herbert", genres: [], status: "WANT_TO_READ" });
    expect(ctx.db.book.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: USER_ID, title: "Dune" }),
    });
  });

  it("throws UNAUTHORIZED without a session", async () => {
    const ctx = createMockContext(undefined);
    const caller = createCaller(ctx as never);
    await expect(
      caller.create({ title: "Dune", author: "Herbert", genres: [], status: "WANT_TO_READ" }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

describe("book.delete", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws FORBIDDEN when a different user tries to delete the book", async () => {
    const ctx = createMockContext(OTHER_ID);
    vi.mocked(ctx.db.book.findUnique).mockResolvedValue({ userId: USER_ID } as never);
    const caller = createCaller(ctx as never);
    await expect(caller.delete({ id: BOOK_ID })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(ctx.db.book.delete).not.toHaveBeenCalled();
  });

  it("throws NOT_FOUND when book does not exist", async () => {
    const ctx = createMockContext(USER_ID);
    vi.mocked(ctx.db.book.findUnique).mockResolvedValue(null as never);
    const caller = createCaller(ctx as never);
    await expect(caller.delete({ id: BOOK_ID })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(ctx.db.book.delete).not.toHaveBeenCalled();
  });

  it("deletes successfully when the owner requests it", async () => {
    const ctx = createMockContext(USER_ID);
    vi.mocked(ctx.db.book.findUnique).mockResolvedValue({ userId: USER_ID } as never);
    vi.mocked(ctx.db.book.delete).mockResolvedValue({ id: BOOK_ID } as never);
    const caller = createCaller(ctx as never);
    await caller.delete({ id: BOOK_ID });
    expect(ctx.db.book.delete).toHaveBeenCalledWith({ where: { id: BOOK_ID } });
  });
});

describe("book.getStats", () => {
  it("returns correct status counts", async () => {
    const ctx = createMockContext(USER_ID);
    vi.mocked(ctx.db.book.findMany).mockResolvedValue([
      { status: "COMPLETED",         genres: [], review: { rating: 5 }, readingProgress: { currentPage: 300, finishedAt: new Date() } },
      { status: "CURRENTLY_READING", genres: [], review: null,          readingProgress: { currentPage: 50,  finishedAt: null } },
      { status: "WANT_TO_READ",      genres: [], review: null,          readingProgress: null },
    ] as never);
    const caller = createCaller(ctx as never);
    const stats = await caller.getStats();
    expect(stats.total).toBe(3);
    expect(stats.completed).toBe(1);
    expect(stats.currentlyReading).toBe(1);
    expect(stats.wantToRead).toBe(1);
  });

  it("returns null avgRating when no books are rated", async () => {
    const ctx = createMockContext(USER_ID);
    vi.mocked(ctx.db.book.findMany).mockResolvedValue([] as never);
    const caller = createCaller(ctx as never);
    const stats = await caller.getStats();
    expect(stats.avgRating).toBeNull();
  });
});