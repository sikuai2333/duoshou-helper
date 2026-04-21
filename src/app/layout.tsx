import type { Metadata } from "next";
import { AppProviders } from "@/components/common/app-providers";
import { QuickEntryDrawer } from "@/components/ledger/quick-entry-drawer";
import { BottomNavigation } from "@/components/navigation/bottom-navigation";
import "./globals.css";


export const metadata: Metadata = {
  title: {
    default: "剁手辅助",
    template: "%s | 剁手辅助",
  },
  description: "一个帮你判断该不该花、这个月还能花多少的本地优先消费辅助网站。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <AppProviders>
          <div className="app-stage">
            <div className="app-device-shell">
              <div id="app-device-screen" className="app-device-screen">
                <div className="app-scroll-region">{children}</div>
                <div id="app-overlay-root" className="app-overlay-root" />
                <QuickEntryDrawer />
                <BottomNavigation />
              </div>
            </div>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
