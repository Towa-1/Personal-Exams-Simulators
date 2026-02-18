
import { GoogleGenAI, Type } from "@google/genai";
import type { QuestionAnswer } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseQuestionsFromText = async (text: string): Promise<QuestionAnswer[]> => {
  const prompt = `You are an expert data parser for "Ntow's Exams Simulator".
Your task is to parse the following pipe-separated data:
Format: Type (MCQ/NUM) | Question Text | Options (Comma-separated for MCQ, or Unit for NUM) | Correct Answer | Explanation | Image URL

Output a valid JSON array of objects with these keys:
- type: "MCQ" or "NUM"
- question: string
- options: array of strings (empty if type is NUM)
- unit: string (empty if type is MCQ)
- answerKey: string
- explanation: string
- imageUrl: string or null

Data:
${text}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ["MCQ", "NUM"] },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              unit: { type: Type.STRING },
              answerKey: { type: Type.STRING },
              explanation: { type: Type.STRING },
              imageUrl: { type: Type.STRING, nullable: true }
            },
            required: ["type", "question", "answerKey", "explanation"]
          }
        }
      }
    });

    const jsonString = response.text;
    if (!jsonString) throw new Error("Empty response from AI.");
    
    return JSON.parse(jsonString) as QuestionAnswer[];
  } catch (error) {
    console.error("Error parsing questions:", error);
    throw new Error("Failed to parse the exam dataset. Please check your format.");
  }
};
