import { GoogleGenerativeAI } from '@langchain/google-genai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import dotenv from 'dotenv';

dotenv.config();

const model = new ChatGoogleGenerativeAI({
  modelName: 'gemini-pro',
  maxOutputTokens: 2048,
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