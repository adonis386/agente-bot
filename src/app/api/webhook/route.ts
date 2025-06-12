import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp/client';
import { generateResponse } from '@/lib/gemini/client';

// Token de verificación del webhook
const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_TOKEN;

// Endpoint GET para verificar el webhook
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verificar el token
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Webhook recibido:', JSON.stringify(body, null, 2));

    // Verificar si es un mensaje de WhatsApp
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry[0];
      const changes = entry.changes[0];
      const value = changes.value;

      if (value.messages && value.messages.length > 0) {
        const message = value.messages[0];
        console.log('Mensaje recibido:', JSON.stringify(message, null, 2));
        
        // Verificar si es un mensaje de texto
        if (message.type === 'text') {
          const from = message.from;
          const messageText = message.text.body;
          console.log('Procesando mensaje de texto:', { from, messageText });
          
          try {
            // Generar respuesta usando Gemini
            console.log('Generando respuesta con Gemini...');
            const botResponse = await generateResponse(messageText);
            console.log('Respuesta generada:', botResponse);
            
            // Enviar respuesta por WhatsApp
            console.log('Enviando respuesta por WhatsApp...');
            await sendWhatsAppMessage(from, botResponse.toString());
            console.log('Respuesta enviada exitosamente');
          } catch (error) {
            console.error('Error en el procesamiento del mensaje:', error);
            throw error;
          }
        } else {
          console.log('Mensaje no es de tipo texto:', message.type);
        }
      } else {
        console.log('No se encontraron mensajes en el webhook');
      }
    } else {
      console.log('No es un webhook de WhatsApp Business');
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error procesando webhook:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 