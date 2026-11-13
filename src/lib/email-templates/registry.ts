import type { ComponentType } from 'react'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
import { template as complaintOwnerCopy } from './complaint-owner-copy'
import { template as privateMessageAlert } from './private-message-alert'
import { template as suggestionDigest } from './suggestion-digest'
import { template as departmentMessage } from './department-message'
import { template as passReminder } from './pass-reminder'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'department-message': departmentMessage,
  'complaint-owner-copy': complaintOwnerCopy,
  'private-message-alert': privateMessageAlert,
  'suggestion-digest': suggestionDigest,
  'pass-reminder': passReminder,
}
