import { GoogleGenerativeAI } from "@google/generative-ai";


function getClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenerativeAI(key);
}

export interface BookRecommendation {
  title:  string;
  author: string;
  reason: string; 
}

export async function getBookRecommendations(
  completedBooks: { title: string; author: string; rating: number | null }[],
): Promise<BookRecommendation[]> {
  if (completedBooks.length === 0) {
    throw new Error("No completed books to base recommendations on");
  }

  const bookList = completedBooks
    .map((b) => `- "${b.title}" by ${b.author}${b.rating ? ` (rated ${b.rating}/5)` : ""}`)
    .join("\n");

  const prompt = `You are a book recommendation engine with deep knowledge of literature.

The user has read and enjoyed these books:
${bookList}

Based on their reading history and ratings, suggest exactly 5 books they would genuinely enjoy next.
Do not recommend books they have already read.
Consider themes, writing style, genre, and complexity from their ratings.

Return ONLY a valid JSON array with no markdown, no code fences, no explanation:
[
  {"title": "Book Title", "author": "Author Name", "reason": "One sentence explaining why this fits their taste"},
  ...
]`;

  const client = getClient();
 
  const model = client.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

  const result = await model.generateContent(prompt);
  const text   = result.response.text().trim();

 
  const cleaned = text.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();

  const parsed = JSON.parse(cleaned) as unknown;

  if (!Array.isArray(parsed)) throw new Error("Gemini returned non-array response");

  return (parsed as BookRecommendation[]).slice(0, 5).map((item) => ({
    title:  String(item.title  ?? ""),
    author: String(item.author ?? ""),
    reason: String(item.reason ?? ""),
  }));
}