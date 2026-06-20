import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const pretendardJp = localFont({
  src: "./fonts/PretendardJPVariable.woff2",
  variable: "--font-pretendard-jp",
  display: "swap",
  weight: "45 920",
});

export const metadata: Metadata = {
  title: "ITNA - 필요한 웹/앱 제품을 자연어로 찾기",
  description: "ITNA는 유용한 웹/앱 제품을 자연어 검색으로 발견하는 한국어 제품 디스커버리 플랫폼입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendardJp.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
