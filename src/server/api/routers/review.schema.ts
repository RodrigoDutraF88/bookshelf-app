import { z } from "zod";

export const upsertReviewSchema = z //uses same upsert logic as progress
  .object({
    bookId: z.string().cuid(),

    rating: z.number().int().min(1).max(5).nullable().optional(), //can be nullable

   
    body: z.string().min(1).max(10_000).nullable().optional(),
  })
  .refine( //.refine() determinates that at least one of the fields must be not null
   
    (data) => data.rating != null || (data.body != null && data.body.length > 0),
    {  
      message: "A review must have at least a rating or a body",
      path: [],
    }
  );

// get and delete matches the 1:1 relationship and avoids exposing internal IDs.
export const bookIdSchema = z.object({
  bookId: z.string().cuid(),
});