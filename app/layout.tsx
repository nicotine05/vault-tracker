import "./globals.css";
import NavigationGate from "@/components/NavigationGate";
import { AuthProvider } from "@/components/AuthProvider";
import { VideoFocusModeProvider } from "@/components/vault/video/VideoFocusModeContext";
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
              <VideoFocusModeProvider>
                <CoachReadOnlyBanner />
                <SyncConflictBanner />
                <main className="pb-24">{children}</main>

                <NavigationGate />
              </VideoFocusModeProvider>
            </ThemeProvider>
          </ProgramStateProvider>
        </AuthProvider>
      </body>
    </html>
  );
}