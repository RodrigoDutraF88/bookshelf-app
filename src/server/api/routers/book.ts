import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  createBookSchema,
  updateBookSchema,
  bookIdSchema,
  getAllBooksSchema,
} from "./book.schema";

//This file creates your Book API router. It defines all operations that frontend can call

export const bookRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createBookSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.book.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),

  getAll: protectedProcedure
    .input(getAllBooksSchema)
    .query(async ({ ctx, input }) => {
      return ctx.db.book.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input?.status !== undefined && { status: input.status }), //se existe input le o resto e atribui, se nao ignora
          ...(input?.search !== undefined && {
            OR: [
              { title: { contains: input.search, mode: "insensitive" } },
              { author: { contains: input.search, mode: "insensitive" } },
            ],
          }),
        },
        include: {
          readingProgress: true,
          review: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  getById: protectedProcedure
    .input(bookIdSchema)
    .query(async ({ ctx, input }) => {
      const book = await ctx.db.book.findUnique({
        where: { id: input.id },
        include: {
          readingProgress: true,
          review: true,
        },
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

      return book;
    }),

  update: protectedProcedure
    .input(updateBookSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

     
      const book = await ctx.db.book.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!book) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Book not found" });
      }

      if (book.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      return ctx.db.book.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(bookIdSchema)
    .mutation(async ({ ctx, input }) => {
      const book = await ctx.db.book.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (!book) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Book not found" });
      }

      if (book.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      // Cascade deletes ReadingProgress and Review (set up in schema)
      return ctx.db.book.delete({ where: { id: input.id } });
    }),
});