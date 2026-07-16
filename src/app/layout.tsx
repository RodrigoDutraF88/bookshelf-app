import "../styles/globals.css";
import { type Metadata } from "next";
import { Archivo_Black, Geist, Geist_Mono, Lora } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";
import { auth } from "~/server/auth";
import { AppNav } from "../components/nav/Appnav";
import { BottomNav } from "../components/nav/BottomNav";

export const metadata: Metadata = {
  title: "Bookshelf — Your Reading Life",
  description: "Track every book. Every page. Every thought.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-body",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${archivoBlack.variable} ${geist.variable} ${geistMono.variable} ${lora.variable}`}
    >
      <body>
        <TRPCReactProvider>
          {session?.user && (
            <div className="hidden md:block">
              <AppNav user={session.user} />
            </div>
          )}

          <div className={session?.user ? "md:pt-[60px] pb-20 md:pb-0" : ""}>
            {children}
          </div>

          {session?.user && (
            <div className="block md:hidden">
              <BottomNav />
            </div>
          )}
        </TRPCReactProvider>
      </body>
    </html>
  );
}