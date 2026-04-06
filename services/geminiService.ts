// geminiService.ts

// This service is responsible for integrating with the Gemini API to parse questions from text.

import axios from 'axios';

const GEMINI_API_URL = 'https://api.gemini.com';

export const parseQuestions = async (text: string) => {
    try {
        const response = await axios.post(`${GEMINI_API_URL}/parse`, { text });
        return response.data.questions;
    } catch (error) {
        console.error('Error parsing questions from Gemini API:', error);
        throw new Error('Failed to parse questions');
    }
};
