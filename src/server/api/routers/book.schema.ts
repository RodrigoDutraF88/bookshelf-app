import { z } from "zod";
import { BookStatus } from "../../../../generated/prisma";

export const createBookSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  author: z.string().min(1, "Author is required").max(200),
  coverImage: z.string().url().optional(),
  description: z.string().max(2000).optional(),
  genres: z.array(z.string()).default([]),
  publishedYear: z.number().int().min(0).max(new Date().getFullYear()).optional(),
  isbn: z.string().optional(),
  status: z.nativeEnum(BookStatus).default(BookStatus.WANT_TO_READ),
});

export const updateBookSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(200).optional(),
  author: z.string().min(1).max(200).optional(),
  coverImage: z.string().url().nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  genres: z.array(z.string()).optional(),
  publishedYear: z.number().int().min(0).nullable().optional(),
  isbn: z.string().nullable().optional(),
  status: z.nativeEnum(BookStatus).optional(),
});

export const bookIdSchema = z.object({
  id: z.string().cuid(),
});

export const getAllBooksSchema = z.object({
  status: z.nativeEnum(BookStatus).optional(),
  search: z.string().optional(),
}).optional();