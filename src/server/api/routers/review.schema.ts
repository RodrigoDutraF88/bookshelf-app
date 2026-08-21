import { z } from "zod";

export const upsertReviewSchema = z
  .object({
    bookId: z.string().cuid(),
    rating: z.number().int().min(1).max(5).nullable().optional(),
    body: z.string().min(1).max(10_000).nullable().optional(),
  })
  .refine(
    (data) => data.rating != null || (data.body != null && data.body.length > 0),
    {
      message: "A review must have at least a rating or a body",
      path: [],
    }
  );

// Keyed on bookId, not the review id: the relation is 1:1.
export const bookIdSchema = z.object({
  bookId: z.string().cuid(),
});