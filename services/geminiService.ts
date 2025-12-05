import { GoogleGenAI, Type } from "@google/genai";
import { DailyQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateDailyQuestionsAI = async (): Promise<DailyQuestion[]> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = "Generate 3 engaging multiple-choice trivia questions related to football, blockchain (Celo), or Arab culture. Provide 4 options for each and the index (0-3) of the correct answer.";

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "The question text in Arabic" },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of 4 possible answers in Arabic"
              },
              correctIndex: { type: Type.NUMBER, description: "The index (0-3) of the correct answer" }
            },
            required: ["question", "options", "correctIndex"]
          }
        }
      }
    });

    const rawData = JSON.parse(response.text || '[]');
    
    return rawData.map((item: any, index: number) => ({
      id: `dq-${Date.now()}-${index}`,
      text: item.question,
      options: item.options,
      correctAnswerIndex: item.correctIndex
    }));

  } catch (error) {
    console.error("Error generating questions:", error);
    // Fallback
    return [
      { 
        id: 'err-1', 
        text: 'ما هي العملة الأساسية لشبكة Celo؟', 
        options: ['ETH', 'BTC', 'CELO', 'SOL'], 
        correctAnswerIndex: 2 
      },
      { 
        id: 'err-2', 
        text: 'أين أقيم كأس العالم 2022؟', 
        options: ['روسيا', 'قطر', 'البرازيل', 'فرنسا'], 
        correctAnswerIndex: 1 
      },
      { 
        id: 'err-3', 
        text: 'ماذا يعني اختصار DeFi؟', 
        options: ['التمويل المركزي', 'التمويل اللامركزي', 'البيانات الرقمية', 'الذكاء الاصطناعي'], 
        correctAnswerIndex: 1 
      },
    ];
  }
};