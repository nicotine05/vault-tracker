import "./globals.css";
import Navigation from "./Navigation";
import { AuthProvider } from "@/components/AuthProvider";
import CoachReadOnlyBanner from "@/components/CoachReadOnlyBanner";
import { ProgramStateProvider } from "@/components/ProgramStateProvider";
import SyncConflictBanner from "@/components/SyncConflictBanner";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("vault-theme");if(t)document.documentElement.dataset.theme=t;}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <ProgramStateProvider>
            <ThemeProvider>
              <CoachReadOnlyBanner />
              <SyncConflictBanner />
              <main className="pb-24">{children}</main>

              <Navigation />
            </ThemeProvider>
          </ProgramStateProvider>
        </AuthProvider>
      </body>
    </html>
  );
}