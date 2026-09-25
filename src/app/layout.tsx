import type { Metadata } from "next";
import { Assistant, Frank_Ruhl_Libre } from "next/font/google";

import { LanguageProvider } from "@/content/language";

import "./globals.css";

// Frank Ruhl is a Hebrew book face — the rulebook is set in it, and so are the
// headings. Assistant carries the interface around it.
const book = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-book",
  display: "swap",
});

const ui = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["400", "600"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "כלל ראשון",
  description: "משחק אזרחות לילדים. פרק ראשון: אין כללים.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // lang/dir start at the default language and are updated on the client by
  // LanguageProvider when a stored preference says otherwise, so the markup
  // rendered here and the first client render always agree.
  return (
    <html lang="he" dir="rtl" className={`${book.variable} ${ui.variable}`}>
      <body className="font-ui antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
