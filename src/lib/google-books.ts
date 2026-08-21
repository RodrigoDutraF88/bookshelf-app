
export interface GoogleBookResult {
  googleId:      string;
  title:         string;
  author:        string;
  coverImage:    string | null;
  description:   string | null;
  genres:        string[];
  publishedYear: number | null;
  isbn:          string | null;
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
      thumbnail?:      string;
      smallThumbnail?: string;
    };
    industryIdentifiers?: { type: string; identifier: string }[];
  };
}

function extractIsbn(item: GoogleBooksItem): string | null {
  const ids = item.volumeInfo.industryIdentifiers ?? [];
  return (
    ids.find((i) => i.type === "ISBN_13")?.identifier ??
    ids.find((i) => i.type === "ISBN_10")?.identifier ??
    null
  );
}

function extractYear(dateStr?: string): number | null {
  if (!dateStr) return null;
  const year = parseInt(dateStr.slice(0, 4), 10);
  return isNaN(year) ? null : year;
}

function extractCover(item: GoogleBooksItem): string | null {
  const links = item.volumeInfo.imageLinks;
  if (!links) return null;
  const url = links.thumbnail ?? links.smallThumbnail ?? null;
  if (!url) return null;
  
  return url
    .replace("http://", "https://")
    .replace("&edge=curl", "")
    .replace("zoom=1", "zoom=2");
}

export async function searchGoogleBooks(query: string): Promise<GoogleBookResult[]> {
  if (!query.trim()) return [];

const params = new URLSearchParams({
  q:           query.trim(),
  maxResults:  "10",
  printType:   "books",
  langRestrict: "en",
  key:         process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY ?? "",
});

  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?${params.toString()}`,
  );

  if (!res.ok) return [];

  const data = (await res.json()) as GoogleBooksApiResponse;

  return (data.items ?? [])
    .filter(
      (item) =>
        item.volumeInfo.title &&
        (item.volumeInfo.authors?.length ?? 0) > 0,
    )
    .map((item): GoogleBookResult => ({
      googleId:      item.id,
      title:         item.volumeInfo.title ?? "",
      author:        (item.volumeInfo.authors ?? []).join(", "),
      coverImage:    extractCover(item),
      description: item.volumeInfo.description
        ? item.volumeInfo.description.slice(0, 1800) + (item.volumeInfo.description.length > 1800 ? "…" : "")
        : null,
      genres:        item.volumeInfo.categories ?? [],
      publishedYear: extractYear(item.volumeInfo.publishedDate),
      isbn:          extractIsbn(item),
    }));
}