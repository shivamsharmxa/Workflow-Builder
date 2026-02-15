import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('Warning: GOOGLE_AI_API_KEY not set');
}

export const genAI = new GoogleGenerativeAI(apiKey || '');

// Available models (verified from API - gemini-2.5-flash is available)
export const GEMINI_MODELS = {
  'gemini-2.5-flash': 'gemini-2.5-flash',
  'gemini-1.5-flash': 'gemini-1.5-flash',
  'gemini-1.5-pro': 'gemini-1.5-pro',
} as const;

export type GeminiModel = keyof typeof GEMINI_MODELS;

// Helper to run LLM with multimodal support
export async function runGemini({
  model = 'gemini-1.5-flash',
  systemPrompt,
  userMessage,
  images = [],
}: {
  model?: GeminiModel;
  systemPrompt?: string;
  userMessage: string;
  images?: string[]; // Array of image URLs or base64 data
}) {
  const modelInstance = genAI.getGenerativeModel({
    model: GEMINI_MODELS[model],
    systemInstruction: systemPrompt,
  });

  // If there are images, convert to proper format
  const parts: any[] = [{ text: userMessage }];

  for (const imageUrl of images) {
    // If it's a base64 string
    if (imageUrl.startsWith('data:')) {
      const [mimeType, base64Data] = imageUrl.split(';base64,');
      parts.push({
        inlineData: {
          mimeType: mimeType.replace('data:', ''),
          data: base64Data,
        },
      });
    } else {
      // If it's a URL, fetch and convert to base64
      try {
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        parts.push({
          inlineData: {
            mimeType: response.headers.get('content-type') || 'image/jpeg',
            data: base64,
          },
        });
      } catch (error) {
        console.error(`Failed to fetch image ${imageUrl}:`, error);
      }
    }
  }

  const result = await modelInstance.generateContent(parts);
  const response = await result.response;
  return response.text();
}
