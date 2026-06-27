"use client";

import type { Book, ReadingProgress,  Review } from "../../../generated/prisma";
import { BookSpine } from "./BookSpine";

type BookWithProgress = Book & {
  readingProgress: ReadingProgress | null;
  review: Review | null;
};

interface BookshelfRowProps {
  books: BookWithProgress[];
}

export function BookshelfRow({ books }: BookshelfRowProps) {
  return (
    <div className="shelf-row">
     
      <div className="shelf-row__books">
        {books.map((book) => (
          <BookSpine key={book.id} book={book} />
        ))}
      </div>
      
      <div className="shelf-row__ledge" aria-hidden="true" />
    </div>
  );
}