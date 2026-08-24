import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getBookRecommendations } from "~/lib/gemini";

export const aiRouter = createTRPCRouter({
  getRecommendations: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.isDemo) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "AI recommendations are turned off on the demo account.",
      });
    }

    const userId = ctx.session.user.id;

    
    const completedBooks = await ctx.db.book.findMany({
      where:   { userId, status: "COMPLETED" },
      include: { review: true },
      orderBy: { updatedAt: "desc" },
      take:    20, 
    });

    if (completedBooks.length === 0) {
      throw new TRPCError({
        code:    "PRECONDITION_FAILED",
        message: "You need at least one completed book to get recommendations.",
      });
    }

    const input = completedBooks.map((b) => ({
      title:  b.title,
      author: b.author,
      rating: b.review?.rating ?? null,
    }));

    try {
      return await getBookRecommendations(input);
    } catch (err) {
      
      throw new TRPCError({
        code:    "INTERNAL_SERVER_ERROR",
        message: err instanceof Error ? err.message : "Failed to get recommendations",
      });
    }
  }),
});