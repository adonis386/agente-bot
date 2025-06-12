import dotenv from 'dotenv';

dotenv.config();

if (!process.env.WHATSAPP_TOKEN) {
  throw new Error('WHATSAPP_TOKEN is not defined in environment variables');
}

if (!process.env.WHATSAPP_PHONE_NUMBER_ID) {
  throw new Error('WHATSAPP_PHONE_NUMBER_ID is not defined in environment variables');
}

const WHATSAPP_API_VERSION = 'v17.0';
const WHATSAPP_API_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

export const sendWhatsAppMessage = async (to: string, message: string) => {
  try {
    // Validar el número de teléfono
    if (!to || !to.match(/^\+\d{1,15}$/)) {
      throw new Error('Invalid phone number format. Must be in E.164 format (e.g., +1234567890)');
    }

    // Validar el mensaje
    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    // Remover el '+' del número de teléfono para la API de WhatsApp
    const formattedNumber = to.replace('+', '');

    console.log('Enviando mensaje a:', to);

    const response = await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedNumber,
        type: 'text',
        text: {
          body: message
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('WhatsApp message sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
};

// Función para verificar el estado del número de WhatsApp
export const checkWhatsAppNumberStatus = async () => {
  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('WhatsApp number status:', data);
    return data;
  } catch (error) {
    console.error('Error checking WhatsApp number status:', error);
    throw error;
  }
}; 