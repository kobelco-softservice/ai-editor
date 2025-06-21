// src/env.d.ts

declare global {
    namespace NodeJS {
      interface ProcessEnv {
        // DeepSeek
        LLM_API_KEY: string;
        LLM_API_ENDPOINT: string;
        LLM_MODEL: string;
        LLM_PROVIDER: string;
  
        // Other environment variables
        NODE_ENV: 'development' | 'production' | 'test';
        NEXT_PUBLIC_API_BASE_URL?: string;
      }
    }
  }
  
  // TypeScriptの設定で必要
  export {};