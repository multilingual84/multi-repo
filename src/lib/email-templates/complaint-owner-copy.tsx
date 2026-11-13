import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  reference?: string
  contact?: string
  message?: string
  event?: string
}

const Email = ({ reference, contact, message, event }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Complaint ${reference ?? ''} — ${event ?? 'update'}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Multi-Lingual™ complaint desk</Heading>
        <Text style={text}>{event ?? 'A complaint was updated.'}</Text>
        <Text style={text}><strong>Reference:</strong> {reference ?? '—'}</Text>
        <Text style={text}><strong>Customer contact:</strong> {contact ?? '—'}</Text>
        <Text style={text}><strong>Message:</strong></Text>
        <Text style={box}>{message ?? '—'}</Text>
        <Text style={muted}>Open the complaint desk on your site and enter your approval code to review or resolve this complaint. No refund or free service is ever applied automatically.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => `Complaint ${data['reference'] ?? ''} — ${data['event'] ?? 'update'}`,
  displayName: 'Complaint owner copy',
  previewData: { reference: 'ML-XXXX-XXXX', contact: 'customer@example.com', message: 'Sample complaint text.', event: 'New complaint filed' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '20px 25px' }
const heading = { fontSize: '20px', color: '#111111' }
const text = { fontSize: '14px', color: '#222222', lineHeight: '1.5' }
const box = { fontSize: '14px', color: '#222222', backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '8px', whiteSpace: 'pre-wrap' as const }
const muted = { fontSize: '12px', color: '#666666', lineHeight: '1.5' }
