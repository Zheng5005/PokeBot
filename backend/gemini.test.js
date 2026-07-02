import { describe, it, expect } from 'vitest';
import { isRateLimitError, MODEL_CHAIN } from './gemini.js';

describe('isRateLimitError', () => {
  it('detects error.status === 429', () => {
    expect(isRateLimitError({ status: 429 })).toBe(true);
  });

  it('detects RESOURCE_EXHAUSTED in message', () => {
    expect(isRateLimitError(new Error('[429] RESOURCE_EXHAUSTED: quota'))).toBe(true);
  });

  it('detects the word quota in message', () => {
    expect(isRateLimitError(new Error('You exceeded your current quota'))).toBe(true);
  });

  it('returns false for unrelated errors', () => {
    expect(isRateLimitError(new Error('network timeout'))).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(isRateLimitError(null)).toBe(false);
    expect(isRateLimitError(undefined)).toBe(false);
  });
});

describe('MODEL_CHAIN', () => {
  it('has three models ordered best-quality first', () => {
    expect(MODEL_CHAIN).toEqual([
      'gemini-3.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-3.1-flash-lite',
    ]);
  });
});
