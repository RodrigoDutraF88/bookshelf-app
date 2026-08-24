import { randomUUID } from "crypto";

import { db } from "~/server/db";
import { BookStatus } from "../../generated/prisma";

// Demo accounts are disposable: each visitor gets a fresh one, and anything
// older than this is deleted the next time somebody starts a demo.
const DEMO_LIFETIME_HOURS = 24;

type SeedBook = {
  title: string;
  author: string;
  genres: string[];
  publishedYear: number;
  status: BookStatus;
  totalPages: number;
  /** Pages read so far. Equal to totalPages for finished books. */
  currentPage?: number;
  /** How long ago the book was finished, in months, used to fill the activity chart. */
  finishedMonthsAgo?: number;
  rating?: number;
  review?: string;
};

const SEED_BOOKS: SeedBook[] = [
  {
    title: "The Left Hand of Darkness",
    author: "Ursula K. Le Guin",
    genres: ["Science Fiction"],
    publishedYear: 1969,
    status: BookStatus.COMPLETED,
    totalPages: 304,
    finishedMonthsAgo: 10,
    rating: 5,
    review:
      "The winter crossing is the best stretch of anything I read this year. Took me fifty pages to settle into the voice and then I did not put it down.",
  },
  {
    title: "Piranesi",
    author: "Susanna Clarke",
    genres: ["Fantasy"],
    publishedYear: 2020,
    status: BookStatus.COMPLETED,
    totalPages: 245,
    finishedMonthsAgo: 8,
    rating: 5,
    review: "Short, strange, and I finished it in two sittings. The house stayed with me for weeks.",
  },
  {
    title: "Educated",
    author: "Tara Westover",
    genres: ["Memoir", "Nonfiction"],
    publishedYear: 2018,
    status: BookStatus.COMPLETED,
    totalPages: 334,
    finishedMonthsAgo: 7,
    rating: 4,
    review: "Hard to read in places. The last third is where it really lands.",
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    genres: ["Science Fiction"],
    publishedYear: 2021,
    status: BookStatus.COMPLETED,
    totalPages: 476,
    finishedMonthsAgo: 5,
    rating: 4,
    review: "Pure fun. The science gets hand-wavy near the end and I did not care at all.",
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    genres: ["History", "Nonfiction"],
    publishedYear: 2011,
    status: BookStatus.COMPLETED,
    totalPages: 443,
    finishedMonthsAgo: 3,
    rating: 3,
    review: "Good on the early chapters, thinner once it reaches the modern era.",
  },
  {
    title: "Never Let Me Go",
    author: "Kazuo Ishiguro",
    genres: ["Literary Fiction"],
    publishedYear: 2005,
    status: BookStatus.COMPLETED,
    totalPages: 288,
    finishedMonthsAgo: 1,
    rating: 5,
    review: "Quiet the whole way through and it wrecked me anyway.",
  },
  {
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    genres: ["Fantasy"],
    publishedYear: 2007,
    status: BookStatus.CURRENTLY_READING,
    totalPages: 662,
    currentPage: 318,
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    genres: ["Psychology", "Nonfiction"],
    publishedYear: 2011,
    status: BookStatus.CURRENTLY_READING,
    totalPages: 499,
    currentPage: 96,
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    genres: ["Science Fiction"],
    publishedYear: 1965,
    status: BookStatus.WANT_TO_READ,
    totalPages: 412,
  },
  {
    title: "The Three-Body Problem",
    author: "Cixin Liu",
    genres: ["Science Fiction"],
    publishedYear: 2008,
    status: BookStatus.WANT_TO_READ,
    totalPages: 400,
  },
  {
    title: "Beloved",
    author: "Toni Morrison",
    genres: ["Literary Fiction"],
    publishedYear: 1987,
    status: BookStatus.WANT_TO_READ,
    totalPages: 324,
  },
  {
    title: "Neuromancer",
    author: "William Gibson",
    genres: ["Science Fiction"],
    publishedYear: 1984,
    status: BookStatus.DROPPED,
    totalPages: 271,
    currentPage: 74,
  },
];

function monthsAgo(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d;
}

function progressFor(book: SeedBook) {
  const finished = book.status === BookStatus.COMPLETED;
  const currentPage = finished ? book.totalPages : (book.currentPage ?? 0);
  if (!finished && currentPage === 0) return undefined;

  const finishedAt = finished ? monthsAgo(book.finishedMonthsAgo ?? 1) : null;
  const startedAt = monthsAgo((book.finishedMonthsAgo ?? 0) + 1);

  return { currentPage, totalPages: book.totalPages, startedAt, finishedAt };
}

/**
 * Deletes demo accounts past their lifetime. Books, progress and reviews go
 * with them through the cascade on User.
 */
export async function purgeExpiredDemoUsers() {
  const cutoff = new Date(Date.now() - DEMO_LIFETIME_HOURS * 60 * 60 * 1000);
  await db.user.deleteMany({
    where: { isDemo: true, createdAt: { lt: cutoff } },
  });
}

/** Creates a throwaway account preloaded with a reading history. */
export async function createDemoUser() {
  return db.user.create({
    data: {
      name: "Demo reader",
      email: `demo-${randomUUID()}@demo.invalid`,
      isDemo: true,
      books: {
        create: SEED_BOOKS.map((book) => {
          const progress = progressFor(book);
          return {
            title: book.title,
            author: book.author,
            genres: book.genres,
            publishedYear: book.publishedYear,
            status: book.status,
            ...(progress && { readingProgress: { create: progress } }),
            ...(book.rating != null && {
              review: { create: { rating: book.rating, body: book.review ?? null } },
            }),
          };
        }),
      },
    },
    select: { id: true, name: true, email: true, image: true, isDemo: true, createdAt: true },
  });
}
