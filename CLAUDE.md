# Simple Memo — プロジェクト概要

Chrome 拡張機能のシンプルなメモアプリ。`manifest.json` / `popup.html` / `popup.css` / `popup.js` の4ファイル構成。

## ファイル構成

| ファイル | 役割 |
|----------|------|
| `manifest.json` | 拡張機能の設定 |
| `popup.html` | ポップアップの HTML。JS・CSS を読み込む |
| `popup.css` | スタイル定義 |
| `popup.js` | ロジック全体。Chrome Storage API でデータ永続化 |

## データ構造

メモは `chrome.storage.local` に `{ memos: Memo[] }` 形式で保存。

```js
{
  text: string,       // メモ本文
  createdAt: number,  // Unix タイムスタンプ（ソート用。UI には非表示）
  title?: string      // タイトル（任意）
}
```

## UI 構成

### 入力エリア
- `<textarea>` — プレースホルダー "Take a note..."
- `+` ボタン（`#addBtn`）— SVG プラスアイコン、36×36px 青塗り。`Ctrl+Enter` / `Cmd+Enter` でも追加可能

### メモ一覧（`.memo-list`）
新しい順に表示。各メモ（`.memo-item`）の構造：

```
.memo-header
  ├── .memo-title         ← クリックでインライン編集（.memo-title-input に切り替わる）
  └── .memo-actions
        ├── .copy-btn     ← コピーアイコン（押下後チェックマークに変化、700ms 後に戻る）
        ├── .edit-btn     ← 鉛筆アイコン
        └── .delete-btn   ← ゴミ箱アイコン
.memo-text                ← 本文（編集時は .memo-edit-textarea に切り替わる）
```

### 編集モード（`.edit-btn` 押下時）
`.memo-text` → `<textarea class="memo-edit-textarea">` に置換。  
`.memo-actions` のボタンが以下に切り替わる：

```
.cancel-btn（✕）  .save-btn（✓）  [26px spacer]
```

spacer は削除ボタンの幅分のダミーで、保存ボタンの右端を編集ボタンの右端に揃えるため。

### タイトル編集
`.memo-title` クリック → `<input class="memo-title-input">` に置換。  
`Enter` / blur で `updateMemoTitle()` を呼び保存。`Escape` でキャンセル（元の span に戻す）。

### Export / Import エリア
- **Export JSON** — `simple-memo-YYYY-MM-DD.json` でダウンロード
- **Import JSON** — 既存メモと `createdAt` で重複排除して結合

## アイコン一覧（すべて Feather Icons 系 SVG、stroke="currentColor"）

| ボタン | サイズ | 色 | hover |
|--------|--------|----|-------|
| ＋（追加） | 36×36px 塗り | white / blue bg | darker blue |
| コピー | 26×26px 枠 | #4a90e2 | 青塗り |
| 編集 | 26×26px 枠 | #6c9e6c | 緑塗り |
| 削除 | 26×26px 枠 | #e05252 | 赤塗り |
| 保存（✓） | 26×26px 枠 | #6c9e6c | 緑塗り |
| キャンセル（✕） | 26×26px 枠 | #999 | グレー塗り |

## 主要関数

| 関数 | 説明 |
|------|------|
| `loadMemos()` | ストレージからメモを読み込み `renderMemos` を呼ぶ |
| `renderMemos(memos)` | メモ一覧を全件再描画 |
| `addMemo()` | 入力欄のテキストを追加して再描画 |
| `startTitleEdit(titleEl, index, currentTitle)` | タイトルのインライン編集を開始 |
| `updateMemoTitle(index, title)` | タイトルをストレージに保存して再描画 |
| `startMemoEdit(textEl, actionsEl, index, currentText)` | 本文のインライン編集を開始 |
| `updateMemoText(index, text)` | 本文をストレージに保存して再描画 |
| `copyMemo(text, btn)` | クリップボードにコピー。ボタンアイコンを一時的に ✓ に変更 |
| `deleteMemo(index)` | メモを削除して再描画 |

## ポップアップ幅

```css
min-width: 440px;
max-width: 560px;
```
