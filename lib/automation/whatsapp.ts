const OPENCLAW_WHATSAPP_WEBHOOK = process.env.OPENCLAW_WHATSAPP_WEBHOOK;

export async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  if (!OPENCLAW_WHATSAPP_WEBHOOK) {
    console.error('OPENCLAW_WHATSAPP_WEBHOOK not set');
    return false;
  }

  try {
    const response = await fetch(OPENCLAW_WHATSAPP_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message })
    });
    
    return response.ok;
  } catch (error) {
    console.error('WhatsApp send failed:', error);
    return false;
  }
}
