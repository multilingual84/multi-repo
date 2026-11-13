import { createServerFn } from '@tanstack/react-start';
import { departmentMessageSchema } from './department-message';
import { departmentContactCopy, type DepartmentId } from './department-contacts';

export const sendDepartmentMessage = createServerFn({ method: 'POST' })
  .inputValidator(input => departmentMessageSchema.parse(input))
  .handler(async ({ data }) => {
    const recipient = process.env['OWNER_EMAIL'];
    if (!recipient) throw new Error('Department delivery is not configured');
    const { sendTemplateEmail } = await import('./email-templates/send-email');
    const result = await sendTemplateEmail('department-message', recipient, {
      templateData: { department: departmentContactCopy.en.labels[data.department as DepartmentId], email: data.email, message: data.message },
      replyTo: data.email,
      idempotencyKey: `department-message-${data.submissionId}`,
    });
    return { sent: result.sent };
  });