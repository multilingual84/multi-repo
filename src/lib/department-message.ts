import { z } from 'zod';
import { departmentIds } from './department-contacts';

export const departmentMessageSchema = z.object({
  department: z.string().refine(value => departmentIds.some(id => id === value)),
  email: z.string().trim().email().max(254).refine(value => !/[\r\n]/.test(value)),
  message: z.string().trim().min(10).max(4000),
  submissionId: z.string().uuid(),
});

export const departmentFormCopy = {
  en: { email: 'Your email', message: 'Your message', send: 'Send message', sending: 'Sending…', sent: 'Message sent to our team.', error: 'Message not sent. Please try again.', invalid: 'Enter a valid email and a message of 10–4,000 characters.' },
  es: { email: 'Tu correo', message: 'Tu mensaje', send: 'Enviar mensaje', sending: 'Enviando…', sent: 'Mensaje enviado a nuestro equipo.', error: 'No se envió. Inténtalo de nuevo.', invalid: 'Introduce un correo válido y un mensaje de 10–4.000 caracteres.' },
  tl: { email: 'Iyong email', message: 'Iyong mensahe', send: 'Ipadala ang mensahe', sending: 'Ipinapadala…', sent: 'Naipadala sa aming koponan.', error: 'Hindi naipadala. Subukan muli.', invalid: 'Maglagay ng wastong email at mensaheng 10–4,000 character.' },
  zh: { email: '您的邮箱', message: '您的留言', send: '发送留言', sending: '发送中…', sent: '留言已发送给团队。', error: '未发送，请重试。', invalid: '请输入有效邮箱及10–4,000字的留言。' },
  de: { email: 'Ihre E-Mail', message: 'Ihre Nachricht', send: 'Nachricht senden', sending: 'Wird gesendet…', sent: 'Nachricht an unser Team gesendet.', error: 'Nicht gesendet. Bitte erneut versuchen.', invalid: 'Gültige E-Mail und Nachricht mit 10–4.000 Zeichen eingeben.' },
  ja: { email: 'メールアドレス', message: 'メッセージ', send: '送信', sending: '送信中…', sent: 'チームに送信しました。', error: '送信できませんでした。再試行してください。', invalid: '有効なメールと10～4,000文字のメッセージを入力してください。' },
};