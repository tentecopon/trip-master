# 出張管理ツール（ベータ版）

「出張管理ツール 実装設計書 Version 0.1」に基づく実装です。
React + TypeScript + Vite + Dexie(IndexedDB) + PWA 構成で、認証・クラウド同期なしのローカル完結型アプリです。

## セットアップ

```bash
npm install
npm run dev       # 開発サーバー
npm run typecheck # 型チェックのみ
npm run build     # 本番ビルド（tsc --noEmit → vite build、dist/ に出力・Service Worker生成）
npm run preview   # ビルド結果をローカルで確認
```

動作確認済み: `npm install` / `npm run typecheck` / `npm run build` はいずれも本リポジトリでエラーなく完了します。

`public/icon-192.png` / `icon-512.png` はプレースホルダーです。実運用前に正式なアプリアイコンに差し替えてください。

## アーキテクチャ

設計書§3の階層構造をそのまま踏襲しています。

```
Page → Component → Custom Hook → Service → Dexie → IndexedDB
```

- `src/types/` … §5〜12 のTypeScript型定義
- `src/db/database.ts` … Dexieスキーマ（Version 1）。§15の方針通り、構造変更時は`version(2).stores(...).upgrade(...)`を追記します
- `src/services/` … §17〜24 の業務ロジック（Componentから直接IndexedDBを操作しない = Rule 1）
- `src/hooks/` … §25 のCustom Hook。ServiceとReact Stateの橋渡し
- `src/components/` … §29 のComponent構成
- `src/pages/` … §28 の画面構成、`src/app/routes.tsx` に §27 のルーティング定義

## 実装設計書からの主な統合（file数を抑えるための変更点）

設計書§29のComponent一覧は細粒度でしたが、実装では密接に関連する部品を1ファイルにまとめています。挙動・責務分担は設計書通りです。

| 設計書上のComponent | 実装ファイル |
| --- | --- |
| TripPhaseBadge / TripStatusBadge | `components/trip/TripBadges.tsx` |
| TodoGroup / TodoItem / TodoStatusButton | `components/todo/TodoSection.tsx` + `SortableTodoList.tsx` |
| TodoForm | `components/todo/TodoEditModal.tsx` に統合 |
| WorkLogItem / WorkStartButton / WorkEndButton | `components/worklog/WorkLogSection.tsx` |
| TemplateTodoList / TemplateTodoItem | `components/template/TemplateForm.tsx` に統合 |
| BackupExport / BackupImport / RestoreConfirm | `components/backup/BackupPanel.tsx` |

## 実装済み範囲（§62 ベータ版実装範囲に対応）

- Trip: 登録・編集・削除（関連データ一括削除）・完了（未完了ToDo確認あり）・再開
- Todo: 登録・編集・削除・状態変更（todo→doing→done、巻き戻し可）・ドラッグ&ドロップ並び替え（dnd-kit）・コメント・予定日、今日のToDo/持ち越し判定
- WorkLog: 開始・終了（二重開始防止、tripId+dateを論理キーとして使用）・手動修正・出張期間外警告・日付跨ぎ（自動分割なし）
- Template: 登録・編集・削除・適用（生成後Todoはテンプレートと完全独立 = Rule 4）
- Master: 装置・目的マスターのCRUD（削除してもTripの名称表記には影響しない）
- Backup: 自動バックアップ（起動時、当日未作成なら1回）・手動バックアップ（JSON書き出し）・3世代管理・JSON検証・完全置換方式の復元・復元前の自動バックアップ
- PWA: `vite-plugin-pwa`によるオフラインキャッシュ、更新検知バナー（自動更新しない）
- 状態管理: Redux等は不使用。useState/useReducer/Custom Hookのみ、IndexedDBを唯一の正とする

## 未実装（§63 実装対象外に準拠）

ログイン・認証・複数ユーザー・クラウド同期・プッシュ通知・写真機能・1日複数WorkLog・複数テンプレート組み合わせ・高度な検索・削除データ復元は、設計書の方針通り本ベータ版には含まれていません。

## 次にやること

1. `public/icon-192.png` / `icon-512.png` を正式デザインに差し替え
2. 実機（iPhone / iPad Safari）でのPWAインストール・オフライン動作確認
3. §65 テスト方針に基づく単体・結合テストの追加（本実装にはテストコードは含まれていません）
