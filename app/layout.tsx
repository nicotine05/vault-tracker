import "./globals.css";
import Navigation from "./Navigation";
import { AuthProvider } from "@/components/AuthProvider";
import CoachReadOnlyBanner from "@/components/CoachReadOnlyBanner";
import SyncConflictBanner from "@/components/SyncConflictBanner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CoachReadOnlyBanner />
          <SyncConflictBanner />
          <main className="pb-24">
            {children}
          </main>

          <Navigation />
        </AuthProvider>
      </body>
    </html>
  );
}