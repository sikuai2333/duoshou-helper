import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { AppProviders } from "@/components/common/app-providers";
import { BottomNavigation } from "@/components/navigation/bottom-navigation";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
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
    <html lang="zh-CN" className={`${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <AppProviders>
          <div className="relative flex min-h-screen flex-col">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_center,_rgba(255,211,114,0.18),_transparent_72%)]" />
            <div className="pointer-events-none absolute inset-x-8 top-36 h-56 rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,125,168,0.14),_transparent_72%)] blur-3xl" />
            {children}
            <BottomNavigation />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
