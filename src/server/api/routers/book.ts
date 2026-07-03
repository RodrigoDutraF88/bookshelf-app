import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  createBookSchema,
  updateBookSchema,
  bookIdSchema,
  getAllBooksSchema,
} from "./book.schema";

export const bookRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createBookSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.book.create({
        data: { ...input, userId: ctx.session.user.id },
      });
    }),

  getAll: protectedProcedure
    .input(getAllBooksSchema)
    .query(async ({ ctx, input }) => {
      return ctx.db.book.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input?.status !== undefined && { status: input.status }),
          ...(input?.search !== undefined && {
            OR: [
              { title: { contains: input.search, mode: "insensitive" } },
              { author: { contains: input.search, mode: "insensitive" } },
            ],
          }),
        },
        include: { readingProgress: true, review: true },
        orderBy: { createdAt: "desc" },
      });
    }),

  getById: protectedProcedure
    .input(bookIdSchema)
    .query(async ({ ctx, input }) => {
      const book = await ctx.db.book.findUnique({
        where: { id: input.id },
        include: { readingProgress: true, review: true },
      });
      if (!book) throw new TRPCError({ code: "NOT_FOUND", message: "Book not found" });
      if (book.userId !== ctx.session.user.id)
        throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this book" });
      return book;
    }),

 
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const books = await ctx.db.book.findMany({
      where: { userId },
      include: { readingProgress: true, review: true },
    });

    // Status counts
    const total            = books.length;
    const completed        = books.filter(b => b.status === "COMPLETED").length;
    const currentlyReading = books.filter(b => b.status === "CURRENTLY_READING").length;
    const wantToRead       = books.filter(b => b.status === "WANT_TO_READ").length;
    const dropped          = books.filter(b => b.status === "DROPPED").length;

    // Pages read
    const pagesRead = books.reduce(
      (sum, b) => sum + (b.readingProgress?.currentPage ?? 0),
      0,
    );

    // Average rating
    const ratedBooks = books.filter(b => b.review?.rating != null);
    const avgRating  =
      ratedBooks.length > 0
        ? ratedBooks.reduce((sum, b) => sum + (b.review?.rating ?? 0), 0) /
          ratedBooks.length
        : null;

  
    const genreCounts: Record<string, number> = {};
    for (const book of books) {
      for (const genre of book.genres) {
        genreCounts[genre] = (genreCounts[genre] ?? 0) + 1;
      }
    }
    const genreDistribution = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

   
    const now = new Date();
    const monthly: { month: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      const count = books.filter(b => {
        const fin = b.readingProgress?.finishedAt;
        if (!fin) return false;
        const fd = new Date(fin);
        return (
          fd.getFullYear() === d.getFullYear() &&
          fd.getMonth()    === d.getMonth()
        );
      }).length;
      monthly.push({ month: label, count });
    }

   
    const recentlyCompleted = books
      .filter(b => b.status === "COMPLETED" && b.readingProgress?.finishedAt)
      .sort(
        (a, b) =>
          new Date(b.readingProgress!.finishedAt!).getTime() -
          new Date(a.readingProgress!.finishedAt!).getTime(),
      )
      .slice(0, 5)
      .map(b => ({
        id:         b.id,
        title:      b.title,
        author:     b.author,
        coverImage: b.coverImage,
        rating:     b.review?.rating ?? null,
        finishedAt: b.readingProgress!.finishedAt!.toISOString(),
      }));

    return {
      total,
      completed,
      currentlyReading,
      wantToRead,
      dropped,
      pagesRead,
      avgRating,
      genreDistribution,
      monthly,
      recentlyCompleted,
    };
  }),
  

  update: protectedProcedure
    .input(updateBookSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const book = await ctx.db.book.findUnique({ where: { id }, select: { userId: true } });
      if (!book) throw new TRPCError({ code: "NOT_FOUND", message: "Book not found" });
      if (book.userId !== ctx.session.user.id)
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      return ctx.db.book.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(bookIdSchema)
    .mutation(async ({ ctx, input }) => {
      const book = await ctx.db.book.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });
      if (!book) throw new TRPCError({ code: "NOT_FOUND", message: "Book not found" });
      if (book.userId !== ctx.session.user.id)
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      return ctx.db.book.delete({ where: { id: input.id } });
    }),
});