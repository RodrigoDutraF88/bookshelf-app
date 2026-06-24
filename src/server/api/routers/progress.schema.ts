import { z } from "zod";

export const upsertProgressSchema = z.object({ //upsert updates pr creates if it doesnt exist, prisma handles it
//the realation is with the book id and not user id, 
  bookId: z.string().cuid(),

  currentPage: z.number().int().min(0),


  totalPages: z.number().int().min(1).optional(),


  startedAt: z.date().optional(), 
  finishedAt: z.date().optional(),
});

export const getProgressSchema = z.object({
  bookId: z.string().cuid(),
});