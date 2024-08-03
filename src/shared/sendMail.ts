import nodemailer from 'nodemailer'
import { logger } from '../config/logger.js'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USERNAME,
  SMTP_PASSWORD,
  FROM_NAME,
  FROM_EMAIL
} = process.env

interface SendMailParams {
  email: string
  subject: string
  text: string
}

export const sendMail = async ({ email, subject, text }: SendMailParams): Promise<void> => {
  logger.info('SEND_MESSAGE_REQUEST', { email, subject })

  const message = {
    from: `"${FROM_NAME ?? 'john-doe'}" <${FROM_EMAIL ?? 'john-doe@anonymous.com'}>`,
    to: email,
    subject,
    text: text.replace(/(<([^>]+)>)/gi, ''),
    html: text
  }

  const port = SMTP_PORT ?? '465'

  const transport: SMTPTransport.Options = {
    host: SMTP_HOST,
    port: parseInt(port),
    secure: parseInt(port) === 465,
    auth: {
      user: SMTP_USERNAME,
      pass: SMTP_PASSWORD
    }
  }

  const transporter = nodemailer.createTransport(transport)
  try {
    const info = await transporter.sendMail(message)
    logger.info('SEND_MESSAGE_SUCCEEDED', { messageId: info.messageId })
  } catch (err: any) {
    logger.error('SEND_MESSAGE_FAILED', { err: err.toString() })
  }
}
