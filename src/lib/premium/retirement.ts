// Immutable product retirement: environment flags cannot reopen paid synthesis.
export const ENHANCED_VOICE_AVAILABLE = false;
export function requireEnhancedVoice(): never {
  throw new Error('Enhanced voice is no longer offered. Standard voice remains available.');
}