import nodemailer from 'nodemailer';

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER!,
      to,
      subject,
      text,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
    throw new Error('이메일 전송 실패');
  }
};
