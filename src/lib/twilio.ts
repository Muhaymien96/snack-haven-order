// lib/twilio.ts
export async function sendAdminSmsNotification({
    message,
  }: {
    message: string;
  }) {
    const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID; // Should be defined in .env
    const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN; // Should be defined in .env
    const from = '+16282324491'; // Your Twilio trial phone number
    const to = '+27662538342'; // Verified phone number you’re sending to
  
    const payload = new URLSearchParams({
      From: from,
      To: to,
      Body: message,
    });
  
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload.toString(),
      }
    );
  
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ SMS Failed:', errorText);
      throw new Error('Twilio SMS failed');
    }
  
    console.log('✅ SMS sent!');
  }
  