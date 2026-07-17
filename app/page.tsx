"use client";

import { useEffect, useState } from "react";
import { Listing } from "@/types/listing";

const PLATFORM_STYLE: Record<string, { label: string; color: string }> = {
  ヤフオク: { label: "ヤフオク", color: "#E53E3E" },
  メルカリ: { label: "メルカリ", color: "#FF6B35" },
  ラクマ: { label: "ラクマ", color: "#805AD5" },
  PayPayフリマ: { label: "PayPayフリマ", color: "#D69E2E" },
  Chrono24: { label: "Chrono24", color: "#276749" },
};

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [email, setEmail] = useState("");
  const [subMsg, setSubMsg] = useState("");
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    setLoading(true);
    try {
      const res = await fetch("/api/listings");
      const data = await res.json();
      setListings(Array.isArray(data) ? data : []);
    } catch {
      console.error("fetch error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe() {
    if (!email || !email.includes("@")) {
      setSubMsg("正しいメールアドレスを入力してください");
      return;
    }
    setSubLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setSubMsg(data.message || "登録しました");
      setEmail("");
    } catch {
      setSubMsg("エラーが発生しました。再度お試しください。");
    } finally {
      setSubLoading(false);
    }
  }

  const filtered = listings.filter((l) => {
    if (filter === "all") return true;
    if (filter === "warranty") return l.has_warranty === "あり";
    return l.material === filter;
  });

  const formatPrice = (p: number | null) =>
    p ? p.toLocaleString("ja-JP") + "円" : "価格不明";

  const formatDate = (d: string) => {
    const date = new Date(d);
    return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const isNew = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    return diff < 1000 * 60 * 60 * 24; // 24時間以内
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f9f9f7", fontFamily: "sans-serif" }}>
      {/* ヘッダー */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e5e5", padding: "20px 24px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>
          カルティエ サントス MM 中古トラッカー
        </h1>
        <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
          ヤフオク・メルカリ・ラクマ・Chrono24の最新出品を新着順で自動更新
        </p>

        {/* メール登録 */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレスを入力"
            style={{
              height: 38, padding: "0 12px", fontSize: 13, border: "1px solid #ccc",
              borderRadius: 6, outline: "none", width: 240,
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
          />
          <button
            onClick={handleSubscribe}
            disabled={subLoading}
            style={{
              height: 38, padding: "0 16px", fontSize: 13, background: "#1a1a1a",
              color: "#fff", border: "none", borderRadius: 6, cursor: "pointer",
            }}
          >
            {subLoading ? "送信中..." : "🔔 新着通知を受け取る"}
          </button>
        </div>
        {subMsg && (
          <p style={{ marginTop: 8, fontSize: 13, color: subMsg.includes("エラー") ? "#e53e3e" : "#276749" }}>
            {subMsg}
          </p>
        )}
      </div>

      {/* フィルター */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e5e5", padding: "10px 24px", display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { key: "all", label: "すべて" },
          { key: "SS", label: "SS（ステンレス）" },
          { key: "PG", label: "PG（ピンクゴールド）" },
          { key: "コンビ", label: "コンビ" },
          { key: "warranty", label: "保証書あり" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              height: 30, padding: "0 14px", fontSize: 12, borderRadius: 20,
              border: "1px solid",
              borderColor: filter === key ? "#1a1a1a" : "#ccc",
              background: filter === key ? "#1a1a1a" : "#fff",
              color: filter === key ? "#fff" : "#555",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
        <button
          onClick={fetchListings}
          style={{
            height: 30, padding: "0 14px", fontSize: 12, borderRadius: 20,
            border: "1px solid #ccc", background: "#fff", color: "#555", cursor: "pointer",
            marginLeft: "auto",
          }}
        >
          ↻ 更新
        </button>
      </div>

      {/* 件数 */}
      <p style={{ padding: "10px 24px 0", fontSize: 13, color: "#888" }}>
        {loading ? "読み込み中..." : `${filtered.length}件の出品`}
      </p>

      {/* カード一覧 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 12,
        padding: "12px 24px 32px",
      }}>
        {!loading && filtered.length === 0 && (
          <p style={{ color: "#888", fontSize: 14, gridColumn: "1/-1" }}>
            出品が見つかりません。しばらくお待ちください。
          </p>
        )}
        {filtered.map((l) => (
          <a
            key={l.id}
            href={l.listing_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div style={{
              background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5",
              overflow: "hidden", transition: "border-color 0.15s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#aaa")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e5e5")}
            >
              {/* 画像 */}
              <div style={{
                width: "100%", aspectRatio: "1", background: "#f0f0f0",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#bbb", fontSize: 13,
              }}>
                {l.image_url ? (
                  <img src={l.image_url} alt={l.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  "🕐"
                )}
              </div>

              {/* 内容 */}
              <div style={{ padding: "10px 12px 12px" }}>
                {/* プラットフォーム */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{
                    fontSize: 11, padding: "2px 8px", borderRadius: 20,
                    background: PLATFORM_STYLE[l.platform]?.color ?? "#666",
                    color: "#fff",
                  }}>
                    {l.platform}
                  </span>
                  {isNew(l.listed_at) && (
                    <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "#FFF5F5", color: "#E53E3E", border: "1px solid #FED7D7" }}>
                      NEW
                    </span>
                  )}
                </div>

                {/* 価格 */}
                <div style={{ fontSize: 17, fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>
                  {formatPrice(l.price)}
                </div>

                {/* タイトル */}
                <div style={{
                  fontSize: 12, color: "#555", marginBottom: 8, lineHeight: 1.4,
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {l.title}
                </div>

                {/* タグ */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {[
                    l.material,
                    `保証書${l.has_warranty}`,
                    `箱${l.has_box}`,
                    l.condition,
                  ].map((tag) => (
                    <span key={tag} style={{
                      fontSize: 11, padding: "2px 6px", borderRadius: 4,
                      background: tag.includes("保証書あり") ? "#F0FFF4" : "#f5f5f5",
                      color: tag.includes("保証書あり") ? "#276749" : "#555",
                      border: `1px solid ${tag.includes("保証書あり") ? "#C6F6D5" : "#e5e5e5"}`,
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 日時 */}
                <div style={{ fontSize: 11, color: "#aaa", marginTop: 8 }}>
                  {formatDate(l.listed_at)}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
