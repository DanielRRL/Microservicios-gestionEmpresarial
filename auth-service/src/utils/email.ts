import nodemailer from 'nodemailer';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  static async sendPasswordReset(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Restablecer contraseña - LoyesTask',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Restablecer contraseña</h2>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Restablecer contraseña
          </a>
          <p>Este enlace expirará en 10 minutos.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Error al enviar el correo electrónico');
    }
  }
}
