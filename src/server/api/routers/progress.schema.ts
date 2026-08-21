import { z } from "zod";

// Keyed on bookId, not userId: a book has at most one progress row.
export const upsertProgressSchema = z.object({
  bookId: z.string().cuid(),
  currentPage: z.number().int().min(0),
  totalPages: z.number().int().min(1).optional(),
  startedAt: z.date().optional(),
  finishedAt: z.date().optional(),
});

export const getProgressSchema = z.object({
  bookId: z.string().cuid(),
});