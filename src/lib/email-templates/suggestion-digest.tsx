import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props { count?: number; digest?: string }

const Email = ({ count, digest }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`${count ?? 0} visitor suggestions reviewed`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Multi-Lingual™ daily suggestions</Heading>
        <Text style={text}>{count ?? 0} new visitor notes, sorted by AI. Nothing has been changed on your site — paste only the ideas you approve into your site builder.</Text>
        <Text style={box}>{digest ?? 'No suggestions today.'}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Daily site suggestions (${d['count'] ?? 0})`,
  displayName: 'Daily suggestion digest',
  to: 'bricktownvirtualstaging@gmail.com',
  previewData: { count: 3, digest: 'WORTH DOING\n- Sample\n\nLIKELY USER ERROR\n- Sample' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '20px 25px' }
const heading = { fontSize: '20px', color: '#111111' }
const text = { fontSize: '14px', color: '#222222', lineHeight: '1.5' }
const box = { fontSize: '14px', color: '#222222', backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '8px', whiteSpace: 'pre-wrap' as const }
