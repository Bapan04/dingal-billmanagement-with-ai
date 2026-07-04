import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter. For production, configure with actual SMTP settings.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'ethereal_user',
    pass: process.env.SMTP_PASS || 'ethereal_pass',
  },
});

export const sendAdmissionEmail = async (toEmail, studentName, courseName) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER || '"Dingal Institute" <admin@dingal.com>',
      to: toEmail,
      subject: 'Welcome to Dingal Institute!',
      text: `Hello ${studentName},\n\nYou have successfully enrolled in ${courseName}. Welcome aboard!\n\nBest Regards,\nDingal Institute Team`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('SMTP Error (Admission):', error.message);
  }
};

export const sendPaymentEmail = async (toEmail, studentName, amount, isEmi = false) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER || '"Dingal Institute" <admin@dingal.com>',
      to: toEmail,
      subject: 'Payment Confirmation - Dingal Institute',
      text: `Hello ${studentName},\n\nWe have received your payment of Rs. ${amount}. ${isEmi ? 'This was recorded towards your EMI plan.' : ''}\n\nThank you!\nDingal Institute Team`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('SMTP Error (Payment):', error.message);
  }
};
