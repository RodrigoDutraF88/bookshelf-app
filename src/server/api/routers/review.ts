import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { upsertReviewSchema, bookIdSchema } from "./review.schema";

export const reviewRouter = createTRPCRouter({

  upsert: protectedProcedure
    .input(upsertReviewSchema)
    .mutation(async ({ ctx, input }) => {
      const { bookId, ...reviewData } = input;

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

      return ctx.db.review.upsert({
        where: { bookId },
        create: {
          bookId,
          ...reviewData,
        },
        update: {
          ...reviewData,
        },
      });
    }),


  get: protectedProcedure
    .input(bookIdSchema)
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

      // findUnique returns null if no Review row exists for this bookId.
      return ctx.db.review.findUnique({
        where: { bookId: input.bookId },
      });
    }),

  delete: protectedProcedure
    .input(bookIdSchema)
    .mutation(async ({ ctx, input }) => {

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

      const review = await ctx.db.review.findUnique({
        where: { bookId: input.bookId },
        select: { id: true },
      });

      if (!review) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No review exists for this book",
        });
      }

      // Delete by the review's own primary key, guaranteed unique,
      return ctx.db.review.delete({
        where: { id: review.id },
      });
    }),
});