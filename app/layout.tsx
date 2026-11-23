import type { Viewport } from "next";
import "./globals.css";
import NavigationGate from "@/components/NavigationGate";
import { AuthProvider } from "@/components/AuthProvider";
import { VideoFocusModeProvider } from "@/components/vault/video/VideoFocusModeContext";
import CoachReadOnlyBanner from "@/components/CoachReadOnlyBanner";
import { ProgramStateProvider } from "@/components/ProgramStateProvider";
import SyncConflictBanner from "@/components/SyncConflictBanner";
import { ThemeProvider } from "@/components/ThemeProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("vault-theme");if(t){document.documentElement.dataset.theme=t;document.documentElement.dataset.themeMode=(t==="dark"||t==="ember")?"dark":"light";}}catch(e){}})();`,
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