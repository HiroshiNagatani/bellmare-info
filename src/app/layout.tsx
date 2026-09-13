import type { Metadata } from "next";
import { Noto_Sans_JP, Oswald } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-body",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "湘南ベルマーレ情報まとめ",
  description:
    "X（旧Twitter）で公開されている湘南ベルマーレの最新情報をまとめて表示するアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body
        className={`${notoSans.className} ${oswald.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
