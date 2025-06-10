import dotenv from 'dotenv';

dotenv.config();

if (!process.env.INFOBIP_API_KEY) {
  throw new Error('INFOBIP_API_KEY is not defined in environment variables');
}

if (!process.env.INFOBIP_BASE_URL) {
  throw new Error('INFOBIP_BASE_URL is not defined in environment variables');
}

// Asegurarse de que la URL base tenga el protocolo HTTPS
const baseUrl = process.env.INFOBIP_BASE_URL.startsWith('http') 
  ? process.env.INFOBIP_BASE_URL 
  : `https://${process.env.INFOBIP_BASE_URL}`;

// ID del remitente de WhatsApp
const WHATSAPP_SENDER_ID = '584123668513';

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

    const response = await fetch(`${baseUrl}/whatsapp/1/message/text`, {
      method: 'POST',
      headers: {
        'Authorization': `App ${process.env.INFOBIP_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        messages: [{
          from: WHATSAPP_SENDER_ID,
          to: to,
          content: {
            text: message
          },
          notifyUrl: `${process.env.VERCEL_URL || 'https://agente-4l5m6nqe4-adonis386s-projects.vercel.app/'}/api/webhook`,
          callbackData: "Callback data",
          urlOptions: {
            shortenUrl: true,
            trackClicks: true,
            trackingUrl: `${process.env.VERCEL_URL || 'https://agente-4l5m6nqe4-adonis386s-projects.vercel.app/'}/api/tracking`,
            removeProtocol: true
          }
        }]
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
    const response = await fetch(`${baseUrl}/whatsapp/1/senders`, {
      method: 'GET',
      headers: {
        'Authorization': `App ${process.env.INFOBIP_API_KEY}`,
        'Accept': 'application/json'
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