import React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  expiresAt?: string
  link?: string
}

const Email = ({ expiresAt, link }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Multi-Lingual™ 7-day pass ends in about 24 hours</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Multi-Lingual™</Heading>
        <Text style={text}>Your free 7-day pass ends in about 24 hours{expiresAt ? ` (${expiresAt})` : ''}.</Text>
        <Text style={text}>While the pass is active, calls, video and the translator stay unlimited on your device. After it ends, the free daily minutes still renew every day, and your Personal Translator stays free for life.</Text>
        {link ? (
          <Section style={buttonSection}>
            <Button href={link} style={button}>Open your pass</Button>
          </Section>
        ) : null}
        <Text style={footer}>You received this one-time reminder because you asked for it on the pass screen. We keep no user information beyond this reminder.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Your 7-day pass ends in about 24 hours',
  displayName: 'Pass expiry reminder',
  previewData: { expiresAt: 'Nov 3, 2026, 7:00 AM', link: 'https://multi-lingual.tech' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '20px 25px' }
const heading = { color: '#1a1a2e', fontSize: '24px' }
const text = { color: '#333333', fontSize: '14px', lineHeight: '22px' }
const buttonSection = { textAlign: 'center' as const, margin: '24px 0' }
const button = { backgroundColor: '#ea580c', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none' }
const footer = { color: '#777777', fontSize: '12px', lineHeight: '18px', marginTop: '24px' }
