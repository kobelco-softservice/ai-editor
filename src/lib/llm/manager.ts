import { LLMClient } from './client';
import { LLMWrapper } from './llm-wrapper';

class LLMManager {
  private static instance: LLMWrapper;

  public static getInstance(): LLMWrapper {
    if (!LLMManager.instance) {
      const client = LLMClient.getInstance();
      const config = client.getConfiguration();
      LLMManager.instance = new LLMWrapper(config);
    }
    return LLMManager.instance;
  }
}

export { LLMManager }; 