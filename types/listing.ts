export type Material = "SS" | "PG" | "コンビ" | "不明";
export type Condition = "未使用" | "美品" | "良品" | "使用感あり" | "ジャンク" | "不明";
export type HasItem = "あり" | "なし" | "不明";

export interface Listing {
  id: string;
  title: string;
  price: number | null;
  image_url: string | null;
  listing_url: string;
  platform: string;
  material: Material;
  condition: Condition;
  has_warranty: HasItem;
  has_box: HasItem;
  listed_at: string;
  created_at?: string;
}
