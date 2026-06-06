import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private resend: Resend | null = null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
  }

  /**
   * Génère token vérification (16 bytes hex)
   */
  generateToken(): string {
    return randomBytes(16).toString('hex');
  }

  /**
   * Envoie email (Resend si API key, sinon log dev)
   */
  async send(payload: EmailPayload): Promise<void> {
    if (this.resend) {
      // Resend disponible → utiliser
      try {
        await this.resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'noreply@ebook.local',
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
        });
      } catch (error) {
        console.error('Resend error:', error);
        throw new InternalServerErrorException('Erreur envoi email');
      }
    } else {
      // Dev mode: log seulement
      console.log(`📧 [DEV] Email à ${payload.to}:`);
      console.log(payload.html);
    }
  }

  async sendVerificationEmail(
    email: string,
    token: string,
    frontendUrl: string,
  ): Promise<void> {
    const verifyUrl = `${frontendUrl}/auth/verify?token=${token}`;

    await this.send({
      to: email,
      subject: 'Vérifiez votre email - Ebook Generator',
      html: `
        <h2>Bienvenue sur Ebook Generator!</h2>
        <p>Veuillez vérifier votre adresse email en cliquant le lien ci-dessous:</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 4px;">
          Vérifier mon email
        </a>
        <p style="color: #666; font-size: 12px;">Ou copier ce lien: ${verifyUrl}</p>
        <p style="color: #999; font-size: 11px;">Ce lien expire dans 24h.</p>
      `,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.send({
      to: email,
      subject: 'Bienvenue sur Ebook Generator!',
      html: `
        <h2>Bienvenue, ${name}!</h2>
        <p>Ton compte est activé et prêt à utiliser.</p>
        <p>Tu as reçu <strong>10 crédits gratuits</strong> à l'inscription. Commence à créer tes ebooks!</p>
        <ul style="color: #666;">
          <li>Crée un ebook en décrivant le sujet</li>
          <li>Générateur IA va écrire les chapitres</li>
          <li>Exporte en PDF ou EPUB</li>
        </ul>
        <p style="color: #999; font-size: 12px;">Questions? Contacte-nous sur support@ebook.local</p>
      `,
    });
  }
}
