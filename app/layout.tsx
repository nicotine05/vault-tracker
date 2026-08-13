import "./globals.css";
import Navigation from "./Navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="pb-24">
          {children}
        </main>

        <Navigation />
      </body>
    </html>
  );
}