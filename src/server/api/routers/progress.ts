import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { upsertProgressSchema, getProgressSchema } from "./progress.schema";

export const progressRouter = createTRPCRouter({

  upsert: protectedProcedure
    .input(upsertProgressSchema)
    .mutation(async ({ ctx, input }) => {
      const { bookId, ...progressData } = input;

      // now verify if the book belongs to the user
      const book = await ctx.db.book.findUnique({
        where: { id: bookId },
        select: { userId: true },
      });

      if (!book) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Book not found",
        });
      }

      if (book.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this book",
        });
      }

      //now prisma handles where to use update or create
      return ctx.db.readingProgress.upsert({
        where: { bookId },
        create: {
          bookId,
          ...progressData,
        },
        update: {
          ...progressData,
        },
      });
    }),
  // the UI should treat a null response as progress at 0
  get: protectedProcedure
    .input(getProgressSchema)
    .query(async ({ ctx, input }) => {

      const book = await ctx.db.book.findUnique({
        where: { id: input.bookId },
        select: { userId: true },
      });

      if (!book) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Book not found",
        });
      }

      if (book.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this book",
        });
      }
      
      return ctx.db.readingProgress.findUnique({
        where: { bookId: input.bookId },
      });
    }),
});