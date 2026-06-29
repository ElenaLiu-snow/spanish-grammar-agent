import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spanish Grammar Agent - RAE Atelier",
  description: "复古风西语语法问答助手，支持 RAE 冠词与介词学习页",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-[#1d1813] antialiased">{children}</body>
    </html>
  );
}
