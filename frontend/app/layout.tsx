import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PostHogProvider } from "@/components/PostHogProvider";
import { createClient } from "@/lib/supabase-server";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThesisNow — Revisión bibliográfica en minutos",
  description: "Ingresa el título de tu tesis y recibe una revisión bibliográfica completa en menos de 3 minutos. Automatiza tu búsqueda académica.",
  openGraph: {
    title: "ThesisNow",
    description: "Tu revisión bibliográfica, en minutos.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="es" className="h-full scroll-smooth antialiased">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--text)]">
        <PostHogProvider>
          <Navbar user={user} />
          {/* Navbar height: h-16 (64px). Main padding-top must match to prevent overlap. */}
          <main className="flex-1 pt-16">
            {children}
          </main>
          <Footer />
        </PostHogProvider>
      </body>
    </html>
  );
}
