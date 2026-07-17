# カルティエ サントス MM 中古トラッカー — 公開手順書

> この手順書の通りに進めるだけで、プログラミング知識がなくてもサイトを公開できます。
> 所要時間：約30〜40分。費用：すべて無料。

---

## 全体の流れ

```
STEP 1: GitHubにコードをアップロード（10分）
STEP 2: Supabaseでデータベースを作る（10分）
STEP 3: Resendでメール送信を設定する（5分）
STEP 4: Vercelでサイトを公開する（10分）
STEP 5: 動作確認（5分）
```

---

## STEP 1：GitHubにコードをアップロード

GitHubとは、コードを保存する無料のサービスです。

### 1-1. GitHubのアカウントを作る

1. https://github.com を開く
2. 右上の「Sign up」をクリック
3. メールアドレス・パスワード・ユーザー名を入力してアカウントを作成
4. 届いた確認メールのリンクをクリック

### 1-2. 新しいリポジトリ（保存場所）を作る

1. GitHubにログインした状態で https://github.com/new を開く
2. 「Repository name」に `cartier-tracker` と入力
3. 「Private」を選択（公開したくない場合）
4. 「Create repository」をクリック

### 1-3. コードをアップロードする

**方法A：GitHub Desktop（初心者向け、おすすめ）**

1. https://desktop.github.com からGitHub Desktopをダウンロード・インストール
2. GitHub Desktopを開き、自分のGitHubアカウントでログイン
3. 「File」→「Add Local Repository」→ `cartier-tracker` フォルダを選択
4. 「Publish repository」をクリック
5. 先ほど作ったリポジトリ名 `cartier-tracker` を選んでアップロード

**方法B：ドラッグ＆ドロップ（最も簡単）**

1. GitHubの先ほど作ったリポジトリページを開く
2. 「uploading an existing file」というリンクをクリック
3. `cartier-tracker` フォルダの中身をすべてドラッグ＆ドロップ
4. 「Commit changes」をクリック

---

## STEP 2：Supabaseでデータベースを作る

Supabaseとは、データを保存するための無料サービスです。
出品情報やメールアドレスをここに保存します。

### 2-1. Supabaseのアカウントを作る

1. https://supabase.com を開く
2. 「Start your project」をクリック
3. 「Continue with GitHub」→ GitHubアカウントでログイン

### 2-2. 新しいプロジェクトを作る

1. 「New project」をクリック
2. 以下を入力：
   - **Name**：`cartier-tracker`
   - **Database Password**：自分で決めたパスワード（メモしておく）
   - **Region**：`Northeast Asia (Tokyo)` を選択
3. 「Create new project」をクリック
4. 1〜2分待つ（セットアップ中）

### 2-3. テーブル（データの入れ物）を作る

1. 左メニューの「SQL Editor」をクリック
2. 「New query」をクリック
3. 以下のSQL文をコピーして貼り付ける：

```sql
-- 出品データを保存するテーブル
create table listings (
  id uuid primary key,
  title text not null,
  price integer,
  image_url text,
  listing_url text unique not null,
  platform text,
  material text,
  condition text,
  has_warranty text,
  has_box text,
  listed_at timestamptz,
  created_at timestamptz default now()
);

-- メール登録者を保存するテーブル
create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  confirmed boolean default false,
  confirm_token text,
  created_at timestamptz default now()
);
```

4. 「Run」ボタン（▶）をクリック
5. 「Success」と表示されればOK

### 2-4. APIキーをメモする

1. 左メニューの「Settings」→「API」をクリック
2. 以下の2つをメモ帳にコピーしておく：
   - **Project URL**：`https://xxxxxxxxxxxxxx.supabase.co` という形式
   - **service_role key**：`eyJ...` から始まる長い文字列（「service_role」の行）
   
   ⚠️ **注意**：`anon` keyではなく `service_role` keyをコピーしてください

---

## STEP 3：Resendでメール送信を設定する

Resendとは、メールを自動送信するための無料サービスです。

### 3-1. Resendのアカウントを作る

1. https://resend.com を開く
2. 「Get Started for Free」をクリック
3. メールアドレスを入力してアカウントを作成

### 3-2. APIキーを取得する

1. Resendにログイン後、左メニューの「API Keys」をクリック
2. 「Create API Key」をクリック
3. 名前は何でもOK（例：`cartier-tracker`）
4. 「Add」をクリック
5. 表示された `re_` から始まる文字列をメモ帳にコピー
   ⚠️ このページを閉じると二度と見られないので必ずコピーすること

### 3-3. 送信元ドメインを設定する（無料プランの場合）

無料プランでは `onboarding@resend.dev` というアドレスから送信されます。
自分のドメインを使いたい場合は後から設定できますが、まずはこのまま進めてOKです。

`lib/mailer.ts` の以下の行を：
```
from: "カルティエ サントス通知 <notify@yourdomain.com>",
```
以下に変更：
```
from: "カルティエ サントス通知 <onboarding@resend.dev>",
```

**変更方法**：GitHubの `lib/mailer.ts` ファイルを開き、鉛筆アイコン（編集）をクリックして変更 → 「Commit changes」で保存

---

## STEP 4：Vercelでサイトを公開する

Vercelとは、Webサイトを無料で公開できるサービスです。
ここでコードが実際に動くサイトになります。

### 4-1. Vercelのアカウントを作る

1. https://vercel.com を開く
2. 「Start Deploying」をクリック
3. 「Continue with GitHub」→ GitHubアカウントでログイン

### 4-2. プロジェクトをインポートする

1. 「Add New...」→「Project」をクリック
2. 「Import Git Repository」で `cartier-tracker` を探して「Import」をクリック

### 4-3. 環境変数を設定する

「Configure Project」の画面で「Environment Variables」を展開し、以下を1つずつ入力する：

| 変数名（Name） | 値（Value） |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | STEP 2-4 でメモした Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | STEP 2-4 でメモした service_role key |
| `RESEND_API_KEY` | STEP 3-2 でメモした re_ から始まるキー |
| `CRON_SECRET` | 自分で決めた文字列（例：`mySecret123abc`）メモしておく |
| `NEXT_PUBLIC_SITE_URL` | 後で設定するのでいったんスキップでもOK |

入力方法：
1. Name欄に変数名を入力
2. Value欄に値を貼り付け
3. 「Add」をクリック
4. 次の変数を繰り返す

### 4-4. デプロイする

「Deploy」ボタンをクリック → 2〜3分待つ → 「Congratulations!」が表示されたら完了

### 4-5. サイトのURLを確認・設定する

1. デプロイ完了後に表示されるURL（例：`https://cartier-tracker-abc123.vercel.app`）をメモ
2. Vercelのダッシュボード → 「Settings」→「Environment Variables」
3. `NEXT_PUBLIC_SITE_URL` を追加（値は上記のURL）
4. 「Redeploy」で再デプロイ

### 4-6. Cronジョブ（自動実行）を確認する

Vercelは `vercel.json` の設定に従って20分ごとに自動でスクレイピングを実行します。
ただし、Cronジョブを実行するには認証が必要です。

Vercelダッシュボード → 「Settings」→「Cron Jobs」で確認できます。

---

## STEP 5：動作確認

### 5-1. サイトにアクセスする

STEP 4-5 で確認したURL（例：`https://cartier-tracker-abc123.vercel.app`）をブラウザで開く

### 5-2. 最初のデータ取得を手動で実行する

最初はデータが空なので、手動でスクレイピングを実行します。
以下のURLをブラウザで開く（`your-app` は自分のURLに変更、`YOUR_SECRET` はSTEP 4-3で設定した CRON_SECRET に変更）：

```
https://your-app.vercel.app/api/cron
```

ただし、このURLにはブラウザから直接アクセスできません（認証が必要）。
代わりにVercelのダッシュボードから「Functions」→ 手動実行 が可能です。

または、Supabaseの「SQL Editor」で直接テストデータを入れることもできます：

```sql
insert into listings (id, title, price, listing_url, platform, material, condition, has_warranty, has_box, listed_at)
values (
  gen_random_uuid(),
  'カルティエ サントス MM ステンレス 保証書あり（テストデータ）',
  580000,
  'https://auctions.yahoo.co.jp/',
  'ヤフオク',
  'SS',
  '美品',
  'あり',
  'あり',
  now()
);
```

このSQLを実行すると、サイトにテストデータが表示されます。

### 5-3. 20分後に自動更新を確認する

Vercelが20分ごとにヤフオクのデータを自動取得します。
Vercelダッシュボードの「Deployments」または「Functions」タブでログを確認できます。

---

## よくあるトラブル

| 症状 | 原因 | 対処法 |
|---|---|---|
| サイトが真っ白 | 環境変数が未設定 | STEP 4-3 を再確認 |
| 「Error」と表示される | Supabaseのキーが間違い | service_role keyを再コピー |
| 出品が表示されない | まだスクレイピング未実行 | STEP 5-2 のテストデータを試す |
| メールが届かない | Resendの設定不足 | from アドレスを onboarding@resend.dev に変更 |
| デプロイが失敗する | コードのエラー | Vercelのログを確認してClaude.aiに相談 |

---

## 困ったときは

エラーメッセージをそのままコピーして Claude.ai（このチャット）に貼り付けてください。
一緒に解決します。

---

## 自動更新のしくみ

- **20分ごと**にVercelがヤフオクのRSSフィードを自動取得
- 新しい出品が見つかると自動でデータベースに保存
- 登録したメールアドレスに即時通知

メルカリ・ラクマ・Chrono24への対応は、利用規約の確認後に追加できます。
