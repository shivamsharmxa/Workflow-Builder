const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listAvailableModels() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  
  console.log('🔍 Checking available Gemini models...\n');
  
  const testModels = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'models/gemini-pro',
    'models/gemini-1.5-pro',
    'models/gemini-1.5-flash',
  ];
  
  for (const modelName of testModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Hi');
      const response = await result.response;
      console.log(`✅ ${modelName} - WORKS!`);
      console.log(`   Response: "${response.text().substring(0, 50)}..."\n`);
      break; // Stop after first working model
    } catch (error) {
      console.log(`❌ ${modelName} - ${error.message.split('\n')[0]}`);
    }
  }
}

listAvailableModels();
