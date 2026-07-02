import { describe, it, expect, vi, afterEach } from 'vitest';
import { getInitialLang, getLangCode } from './types';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getInitialLang', () => {
  it('returns stored value from localStorage when it is es', () => {
    vi.stubGlobal('localStorage', { getItem: () => 'es' });
    vi.stubGlobal('navigator', { language: 'en-US' });
    expect(getInitialLang()).toBe('es');
  });

  it('returns stored value from localStorage when it is en', () => {
    vi.stubGlobal('localStorage', { getItem: () => 'en' });
    vi.stubGlobal('navigator', { language: 'es-AR' });
    expect(getInitialLang()).toBe('en');
  });

  it('falls back to es when navigator.language starts with es', () => {
    vi.stubGlobal('localStorage', { getItem: () => null });
    vi.stubGlobal('navigator', { language: 'es-AR' });
    expect(getInitialLang()).toBe('es');
  });

  it('falls back to en when navigator.language does not start with es', () => {
    vi.stubGlobal('localStorage', { getItem: () => null });
    vi.stubGlobal('navigator', { language: 'pt-BR' });
    expect(getInitialLang()).toBe('en');
  });
});

describe('getLangCode', () => {
  it('returns es-ES for es', () => {
    expect(getLangCode('es')).toBe('es-ES');
  });

  it('returns en-US for en', () => {
    expect(getLangCode('en')).toBe('en-US');
  });
});
