import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "HOS ELD Trip Visualizer",
  description: "HOS ELD Trip Visualizer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

