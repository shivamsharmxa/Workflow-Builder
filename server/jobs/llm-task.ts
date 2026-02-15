import { task } from "@trigger.dev/sdk/v3";
import { runGemini, type GeminiModel } from '../gemini';

export const llmTask = task({
  id: "llm-execution",
  run: async (payload: {
    model?: GeminiModel;
    systemPrompt?: string;
    userMessage: string;
    images?: string[];
  }) => {
    console.log('Starting LLM execution via Trigger.dev', { 
      model: payload.model, 
      userMessage: payload.userMessage 
    });

    try {
      const result = await runGemini({
        model: payload.model,
        systemPrompt: payload.systemPrompt,
        userMessage: payload.userMessage,
        images: payload.images,
      });

      console.log('LLM execution completed', { resultLength: result.length });

      return { success: true, result };
    } catch (error) {
      console.error('LLM execution failed', error);
      throw error;
    }
  },
});

// Backward compatibility wrapper
export async function runLLMTask(payload: Parameters<typeof llmTask.run>[0]) {
  return llmTask.run(payload);
}
