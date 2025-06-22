# ai-editor

## 概要
AIエディタは、複数のLLM（OpenAI, Azure OpenAI, Gemini, DeepSeek, IBM Graniteなど）と連携できるNext.jsベースのエディタです。

## セットアップ手順

1. リポジトリをクローン

```bash
git clone <このリポジトリのURL>
cd ai-editor
```

2. 依存パッケージのインストール

```bash
pnpm install
```

3. 環境変数ファイルの作成

`.env.local` ファイルをプロジェクトルートに作成し、以下のように記述してください。

```
# OpenAI (またはAzure OpenAI)
OPENAI_API_KEY=sk-xxxxxxx
OPENAI_API_ENDPOINT=https://api.openai.com
OPENAI_MODEL=gpt-3.5-turbo

# Azure OpenAI
AZURE_OPENAI_API_KEY=xxxxxxx
AZURE_OPENAI_API_ENDPOINT=https://<your-resource-name>.openai.azure.com
AZURE_OPENAI_MODEL=<deployment-name>

# Google Gemini
GEMINI_API_KEY=xxxxxxx
GEMINI_MODEL=gemini-pro

# DeepSeek
DEEPSEEK_API_KEY=xxxxxxx
DEEPSEEK_API_ENDPOINT=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

# IBM Granite
IBM_GRANITE_API_KEY=xxxxxxx   # IBM Cloud IAMアクセストークン
IBM_GRANITE_API_ENDPOINT=https://<region>.ml.cloud.ibm.com
IBM_GRANITE_MODEL=<deployment_id>
```

※各サービスのAPIキーやエンドポイントはご自身のアカウント・契約内容に合わせて設定してください。

4. 開発サーバーの起動

```bash
pnpm dev
```

## LLM呼び出し例

`src/lib/llm/llm.ts` で各LLMプロバイダの呼び出し関数が用意されています。

```typescript
import { callIBMGraniteStream } from '@/lib/llm/llm';

const response = await callIBMGraniteStream({
  model: process.env.IBM_GRANITE_MODEL!,
  message: [{ role: 'user', content: 'こんにちは' }],
  apiKey: process.env.IBM_GRANITE_API_KEY!,
  endpoint: process.env.IBM_GRANITE_API_ENDPOINT!,
});
```

他のプロバイダも同様のインターフェースで呼び出せます。

---

## 注意事項
- APIキーやエンドポイント情報は絶対に公開しないでください。
- IBM GraniteのAPIキーはIAMアクセストークンを指定してください（APIキーからトークン取得が必要な場合はIBM Cloudのドキュメントを参照）。
- 詳細な使い方やカスタマイズは`src/lib/llm/llm.ts`を参照してください。
