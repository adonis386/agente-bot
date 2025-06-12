import { sendWhatsAppMessage } from '@/lib/whatsapp/client';
import { generateResponse } from '@/lib/gemini/client';

export class ChatbotService {
  private static instance: ChatbotService;
  private conversationHistory: Map<string, string[]> = new Map();

  private constructor() {}

  public static getInstance(): ChatbotService {
    if (!ChatbotService.instance) {
      ChatbotService.instance = new ChatbotService();
    }
    return ChatbotService.instance;
  }

  private getConversationHistory(phoneNumber: string): string[] {
    return this.conversationHistory.get(phoneNumber) || [];
  }

  private updateConversationHistory(phoneNumber: string, message: string) {
    const history = this.getConversationHistory(phoneNumber);
    history.push(message);
    if (history.length > 10) history.shift(); // Mantener solo las últimas 10 interacciones
    this.conversationHistory.set(phoneNumber, history);
  }

  public async handleMessage(phoneNumber: string, message: string) {
    try {
      // Actualizar historial de conversación
      this.updateConversationHistory(phoneNumber, message);

      // Generar contexto para el modelo
      const conversationContext = this.getConversationHistory(phoneNumber).join('\n');
      const prompt = `Contexto de la conversación:\n${conversationContext}\n\nMensaje actual: ${message}\n\nGenera una respuesta apropiada:`;

      // Generar respuesta usando Gemini
      const response = await generateResponse(prompt);

      // Enviar respuesta por WhatsApp
      await sendWhatsAppMessage(phoneNumber, response.toString());

      return response;
    } catch (error) {
      console.error('Error handling message:', error);
      throw error;
    }
  }
} 