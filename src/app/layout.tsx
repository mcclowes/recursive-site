import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recursive Site",
  description: "A NextJS web application with AI-powered improvement suggestions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
