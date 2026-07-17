import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "カルティエ サントス MM 中古トラッカー",
  description: "ヤフオク・メルカリ・ラクマ・Chrono24の最新出品を新着順で自動表示",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
