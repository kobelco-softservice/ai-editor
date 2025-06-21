# Node.js の公式軽量イメージを使用
FROM node:21-alpine

WORKDIR /app

ENV NODE_ENV=production

# `pnpm` をインストール
RUN npm install -g pnpm

# `package.json` と `pnpm-lock.yaml` をコピー
COPY package.json pnpm-lock.yaml ./

# すべての依存関係をインストール（devDependencies も含む）
RUN pnpm install --frozen-lockfile

# 残りのソースコードをコピー
COPY . .

# Next.js アプリのビルド
RUN pnpm build

EXPOSE 3300
CMD ["pnpm", "start"]
