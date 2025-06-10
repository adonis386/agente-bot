import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/infobip/client';
import { generateResponse } from '@/lib/gemini/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received webhook:', body);

    // Verificar si es un mensaje de WhatsApp
    if (body.messages && body.messages.length > 0) {
      const message = body.messages[0];
      
      // Verificar si es un mensaje de texto
      if (message.type === 'TEXT') {
        const from = message.from;
        const messageText = message.text;
        
        // Generar respuesta usando Gemini
        const botResponse = await generateResponse(messageText);
        
        // Enviar respuesta por WhatsApp
        await sendWhatsAppMessage(from, botResponse);
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 