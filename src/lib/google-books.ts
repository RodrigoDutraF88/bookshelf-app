// src/lib/google-books.ts
// Typed wrapper around the Google Books API.
// No API key required for up to 1000 requests/day.

export interface GoogleBookResult {
  googleId:     string;
  title:        string;
  author:       string;
  coverImage:   string | null;
  description:  string | null;
  genres:       string[];
  publishedYear: number | null;
  isbn:         string | null;
}

interface GoogleBooksApiResponse {
  items?: GoogleBooksItem[];
}

interface GoogleBooksItem {
  id: string;
  volumeInfo: {
    title?:               string;
    authors?:             string[];
    description?:         string;
    categories?:          string[];
    publishedDate?:       string;
    imageLinks?: {
      thumbnail?:         string;
      smallThumbnail?:    string;
    };
    industryIdentifiers?: { type: string; identifier: string }[];
  };
}

function extractIsbn(item: GoogleBooksItem): string | null {
  const ids = item.volumeInfo.industryIdentifiers ?? [];
  const isbn13 = ids.find((i) => i.type === "ISBN_13");
  const isbn10 = ids.find((i) => i.type === "ISBN_10");
  return isbn13?.identifier ?? isbn10?.identifier ?? null;
}

function extractYear(dateStr?: string): number | null {
  if (!dateStr) return null;
  const year = parseInt(dateStr.slice(0, 4), 10);
  return isNaN(year) ? null : year;
}

function extractCover(item: GoogleBooksItem): string | null {
  const links = item.volumeInfo.imageLinks;
  if (!links) return null;
  // Prefer thumbnail over smallThumbnail, upgrade to https, remove edge=curl zoom param
  const url = links.thumbnail ?? links.smallThumbnail ?? null;
  if (!url) return null;
  return url
    .replace("http://", "https://")
    .replace("&edge=curl", "")
    .replace("zoom=1", "zoom=2"); // higher res
}

export async function searchGoogleBooks(query: string): Promise<GoogleBookResult[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    q:          query,
    maxResults: "10",
    printType:  "books",
    langRestrict: "en",
  });

  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?${params.toString()}`,
    { next: { revalidate: 60 } }, // cache for 60s in Next.js
  );

  if (!res.ok) return [];

  const data = (await res.json()) as GoogleBooksApiResponse;

  return (data.items ?? [])
    .filter((item) => item.volumeInfo.title && item.volumeInfo.authors?.length)
    .map((item): GoogleBookResult => ({
      googleId:     item.id,
      title:        item.volumeInfo.title ?? "",
      author:       (item.volumeInfo.authors ?? []).join(", "),
      coverImage:   extractCover(item),
      description:  item.volumeInfo.description ?? null,
      genres:       item.volumeInfo.categories ?? [],
      publishedYear: extractYear(item.volumeInfo.publishedDate),
      isbn:         extractIsbn(item),
    }));
}