
import { GoogleGenAI, Type } from "@google/genai";
import type { QuestionAnswer } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseQuestionsFromText = async (text: string): Promise<QuestionAnswer[]> => {
  const prompt = `You are a strict data parsing engine for an Exam Proctor app.
Your goal is to convert pipe-separated raw text into a structured JSON array.

INPUT DATA FORMAT (EXTREMELY IMPORTANT - 6 COLUMNS):
Column 1: Type (Must be "MCQ" or "NUM")
Column 2: Question (The text of the question)
Column 3: Options/Unit (Comma-separated options for MCQ, or the unit name for NUM)
Column 4: Answer (The correct option text for MCQ, or the correct numeric value for NUM)
Column 5: Explanation (A detailed explanation of the answer)
Column 6: IMAGE_URL (A URL to an image/diagram, or the string "null" if no image exists)

LOGIC:
- Split EVERY line by the '|' character.
- Ensure you extract the 6th element (Index 5) as the imageUrl.
- If the 6th element is "null" or empty, set imageUrl to null.
- If the 6th element is a valid URL, set imageUrl to that URL string.
- NEVER ignore the 6th column.

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
              type: { type: Type.STRING, enum: ["MCQ", "NUM"] },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              unit: { type: Type.STRING },
              answerKey: { type: Type.STRING },
              explanation: { type: Type.STRING },
              imageUrl: { type: Type.STRING, nullable: true }
            },
            required: ["type", "question", "answerKey", "explanation", "imageUrl"]
          }
        }
      }
    });

    const jsonString = response.text;
    if (!jsonString) throw new Error("Empty response from AI.");
    
    const data = JSON.parse(jsonString);
    
    return data.map((item: any) => ({
      ...item,
      // Ensure absolute cleanliness of the imageUrl field
      imageUrl: (item.imageUrl === "null" || !item.imageUrl || item.imageUrl.toString().trim() === "") ? null : item.imageUrl.toString().trim()
    })) as QuestionAnswer[];
  } catch (error) {
    console.error("Error parsing questions:", error);
    throw new Error("Dataset initialization failed. Ensure you have 6 columns separated by pipes (|) on each line.");
  }
};
