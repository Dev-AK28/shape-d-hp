import { NextRequest, NextResponse } from 'next/server';

const CONTACT_EMAIL = 'kota.icehockey2016@gmail.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, message, to } = body;

    // For now, we'll use a simple approach with mailto or console log
    // In production, you'd use a service like SendGrid, Resend, or Formspree
    
    console.log('Contact form submission:', {
      name,
      email,
      company,
      message,
      to: to || CONTACT_EMAIL
    });

    // Simple response for now - in production, integrate with email service
    // You can use services like:
    // - Resend (https://resend.com)
    // - SendGrid (https://sendgrid.com)
    // - Formspree (https://formspree.io)
    // - EmailJS (https://www.emailjs.com)

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json({ success: false, error: 'Failed to process form' }, { status: 500 });
  }
}
