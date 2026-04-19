import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { AppProviders } from "@/components/common/app-providers";
import { BottomNavigation } from "@/components/navigation/bottom-navigation";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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
    <html lang="zh-CN" className={`${ibmPlexSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <AppProviders>
          <div className="app-stage">
            <div className="app-device-shell">
              <div className="app-device-screen">
                <div className="app-scroll-region">{children}</div>
                <BottomNavigation />
              </div>
            </div>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
