import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY is not defined in environment variables');
}

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.0-flash-lite',
  apiKey: process.env.GOOGLE_API_KEY,
});

export const generateResponse = async (prompt: string) => {
  try {
    const response = await model.invoke(prompt);
    return response.content;
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}; 