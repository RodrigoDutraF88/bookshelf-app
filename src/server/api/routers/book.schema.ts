import { z } from "zod";
import { BookStatus } from "../../../../generated/prisma";

//This code is a validation layer. It defines what data is allowed to enter your API before it reaches your database.
//zod is a TypeScript schema validation library.
//It allows you to say:
//"A book must have a title that is a string, an author that is a string, a status that is one of these values..."

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