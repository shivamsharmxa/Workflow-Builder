import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
try {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent('Hi');
  const response = await result.response;
  console.log('✅✅✅ SUCCESS! API KEY WORKS! ✅✅✅');
  console.log('Response:', response.text());
} catch (e) {
  console.log('❌ Still invalid:', e.message.substring(0, 200));
}
