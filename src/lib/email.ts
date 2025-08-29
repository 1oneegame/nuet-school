import Mailgun from 'mailgun.js';
import formData from 'form-data';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    console.log('Sending email via Mailgun to:', options.to);
    
    const data = await mg.messages.create(process.env.MAILGUN_DOMAIN || '', {
      from: process.env.EMAIL_FROM || 'noreply@your-domain.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log('Email sent successfully via Mailgun:', data.id);
    return data;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Email verification function removed - users are now auto-verified