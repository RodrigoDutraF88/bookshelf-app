import "../styles/globals.css";

import { type Metadata } from "next";
import { Archivo_Black, DM_Sans, Lora } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";
import { auth } from "~/server/auth";
import { AppNav } from "../components/nav/AppNav";

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

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
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
      className={`${archivoBlack.variable} ${dmSans.variable} ${lora.variable}`}
    >
      <body>
        <TRPCReactProvider>
          {session?.user && <AppNav user={session.user} />}
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}