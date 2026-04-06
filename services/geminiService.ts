
import { GoogleGenAI, Type } from "@google/genai";
import type { QuestionAnswer } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseQuestionsFromText = async (text: string): Promise<QuestionAnswer[]> => {
  const prompt = `You are an intelligent data parsing engine for an Exam Proctor app.
Your goal is to extract questions from the provided raw text into a structured JSON array.

The user might provide text in a strict pipe-separated format (6 columns: Type|Question|Options/Unit|Answer|Explanation|ImageUrl), OR they might just paste raw text containing questions.

INSTRUCTIONS:
- Extract all questions you can find.
- For each question, determine if it is Multiple Choice ("MCQ") or Numeric ("NUM").
- If it's MCQ, extract the options as an array of strings, and the correct answer text.
- If it's NUM, extract the unit (if any) and the correct numeric answer.
- Extract or generate a helpful explanation for the answer.
- If there is an image URL provided for the question, extract it. Otherwise, set imageUrl to null.

DATA TO PARSE:
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
              type: { type: Type.STRING, description: "Must be 'MCQ' or 'NUM'" },
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
    
    const data = JSON.parse(jsonString);
    
    return data.map((item: any) => ({
      ...item,
      type: item.type === "NUM" ? "NUM" : "MCQ", // Enforce type
      // Ensure absolute cleanliness of the imageUrl field
      imageUrl: (item.imageUrl === "null" || !item.imageUrl || item.imageUrl.toString().trim() === "") ? null : item.imageUrl.toString().trim()
    })) as QuestionAnswer[];
  } catch (error) {
    console.error("Error parsing questions:", error);
    throw new Error("Failed to extract questions from the text. Please check your format or try providing clearer text. Details: " + (error as Error).message);
  }
};
