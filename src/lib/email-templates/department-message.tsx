import React from 'react';
import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components';
import type { TemplateEntry } from './registry';

function DepartmentMessage({ department = 'Support', email = '', message = '' }: { department?: string; email?: string; message?: string }) {
  return <Html><Head /><Preview>New website department message</Preview><Body style={{ backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }}><Container style={{ padding: '24px' }}><Heading>Multi-Lingual™ — {department}</Heading><Text>Reply contact: {email}</Text><Text style={{ whiteSpace: 'pre-wrap' }}>{message}</Text></Container></Body></Html>;
}

export const template = {
  component: DepartmentMessage,
  subject: (data: Record<string, unknown>) => `Multi-Lingual™ department message — ${data['department'] ?? 'Support'}`,
  displayName: 'Website department message',
  previewData: { department: 'Support', email: 'visitor@example.com', message: 'A website contact message.' },
} satisfies TemplateEntry;