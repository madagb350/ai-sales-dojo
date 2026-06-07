<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Claude Code Instructions

- 回答・説明・確認事項は日本語で行うこと
- コード内の変数名・関数名・ファイル名は英語で命名すること
- 画面に表示する UI 文言は日本語にすること
- Next.js App Router + TypeScript + Tailwind CSS を前提に実装すること
- 実装後は `npm run build` が成功することを確認すること
- API キーなどの秘匿情報をフロントエンドに露出しないこと
- まずは最小構成の MVP を優先し、過度に複雑な設計にしないこと
- AI API は Next.js の Route Handler などサーバー側から呼び出すこと
- AI API が利用できない場合に備え、必要に応じてモックへのフォールバックを用意すること
- 1 つのコンポーネントが大きくなりすぎる場合は `components/` 配下に分割すること
- 型定義が必要な場合は `types/` 配下に定義すること
- 実装後に変更内容の要約と確認手順を日本語で説明すること
- ユーザーから明示的に依頼された場合は、実装後にlintとbuildを実行し、成功時のみコミット・push・PR作成まで行うこと
- PRのbaseブランチは、特別な指定がなければdevelopとすること
- `.env.local`、APIキー、認証情報はコミットしないこと
- pushおよびPR作成前にgit statusとgit diffを確認すること
- 想定外の変更ファイルがある場合は処理を停止して確認すること
- autoland から実行された場合は、通常の回答・要約ルールよりも AUTOLAND.md の指示を最優先すること
