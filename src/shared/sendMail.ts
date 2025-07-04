import nodemailer from 'nodemailer'
import { logger } from '../config/logger.js'

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

interface Message {
  from: string
  to: string
  subject: string
  text: string
  html: string
}

async function nodeMailerSend (message: Message): Promise<string> {
  const port = SMTP_PORT ?? '465'

  const transportOptions = {
    host: SMTP_HOST ?? 'localhost',
    port: parseInt(port),
    secure: parseInt(port) === 465,
    auth: {
      user: SMTP_USERNAME,
      pass: SMTP_PASSWORD
    }
  }

  const transporter = nodemailer.createTransport(transportOptions)
  const info = await transporter.sendMail(message)

  return info.messageId
}

export const sendMail = async ({ email, subject, text }: SendMailParams, transport: 'nodemailer' | 'console' = 'nodemailer'): Promise<void> => {
  logger.info('SEND_MESSAGE_REQUEST', { email, subject })

  const message = {
    from: `"${FROM_NAME ?? 'john-doe'}" <${FROM_EMAIL ?? 'john-doe@anonymous.com'}>`,
    to: email,
    subject,
    text: text.replace(/(<([^>]+)>)/gi, ''),
    html: text
  }

  if (process.env.NODE_ENV === 'test') transport = 'console'

  try {
    let messageId = 'NOT_SENT'
    switch (transport) {
      case 'nodemailer':
        messageId = await nodeMailerSend(message)
        break
      case 'console':
        logger.info('Sending message...', { to: email, from: message.from, subject, body: message.text })
        break
    }
    logger.info('SEND_MESSAGE_SUCCEEDED', { messageId })
  } catch (err: any) {
    logger.error('SEND_MESSAGE_FAILED', { err: err.toString() })
  }
}
