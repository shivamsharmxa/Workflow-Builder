/**
 * Trigger.dev v4 Task: Execute Google Gemini LLM
 * Assignment Requirement: ALL LLM calls must run as Trigger.dev tasks
 */

import { task } from "@trigger.dev/sdk/v3";
import { runGemini, type GeminiModel } from "../gemini";

export const executeLLMTask = task({
  id: "execute-llm",
  run: async (payload: {
    model?: GeminiModel;
    systemPrompt?: string;
    userMessage: string;
    images?: string[];
  }) => {
    console.log("[Trigger.dev] Starting LLM execution", {
      model: payload.model,
      hasSystemPrompt: !!payload.systemPrompt,
      hasImages: payload.images && payload.images.length > 0,
    });

    try {
      const result = await runGemini({
        model: payload.model,
        systemPrompt: payload.systemPrompt,
        userMessage: payload.userMessage,
        images: payload.images,
      });

      console.log("[Trigger.dev] LLM execution completed", {
        resultLength: result.length,
      });

      return {
        success: true,
        result,
        model: payload.model || "gemini-1.5-flash",
      };
    } catch (error: any) {
      console.error("[Trigger.dev] LLM execution failed", error);
      
      return {
        success: false,
        error: error.message || "LLM execution failed",
        model: payload.model || "gemini-1.5-flash",
      };
    }
  },
});
