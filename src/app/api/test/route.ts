import { NextResponse } from 'next/server';
import { checkWhatsAppNumberStatus, sendWhatsAppMessage } from '@/lib/infobip/client';

export async function GET() {
  try {
    // Verificar el estado del número de WhatsApp
    const status = await checkWhatsAppNumberStatus();
    
    return NextResponse.json({
      status: 'success',
      whatsappStatus: status,
      message: 'WhatsApp configuration is working correctly'
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Error checking WhatsApp configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { phoneNumber, message } = await request.json();

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    const response = await sendWhatsAppMessage(phoneNumber, message);
    
    return NextResponse.json({
      status: 'success',
      message: 'Test message sent successfully',
      response
    });
  } catch (error) {
    console.error('Error sending test message:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Error sending test message',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 