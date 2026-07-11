// src/server/api/root.ts — add aiRouter
import { createCallerFactory, createTRPCRouter } from "../api/trpc";
import { bookRouter }     from "./routers/book";
import { progressRouter } from "./routers/progress";
import { reviewRouter }   from "./routers/review";
import { aiRouter }       from "./routers/ai";

export const appRouter = createTRPCRouter({
  book:     bookRouter,
  progress: progressRouter,
  review:   reviewRouter,
  ai:       aiRouter,     
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);