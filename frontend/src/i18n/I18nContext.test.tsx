import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider, useI18n } from './I18nContext';

beforeEach(() => {
  vi.stubGlobal('localStorage', {
    getItem: () => null,
    setItem: vi.fn(),
  });
  vi.stubGlobal('navigator', { language: 'es-AR' });
});

describe('I18nProvider', () => {
  it('provides translations to children via render props', () => {
    function TestChild() {
      const { t } = useI18n();
      return <p>{t.app.subtitle}</p>;
    }
    render(
      <I18nProvider>
        <TestChild />
      </I18nProvider>,
    );
    expect(screen.getByText('Preguntame sobre un Pokémon o decime que guarde uno como favorito.')).toBeInTheDocument();
  });

  it('toggleLang switches between es and en', () => {
    function TestChild() {
      const { t, toggleLang, lang } = useI18n();
      return (
        <div>
          <span data-testid="lang">{lang}</span>
          <span data-testid="subtitle">{t.app.subtitle}</span>
          <button onClick={toggleLang}>Toggle</button>
        </div>
      );
    }
    render(
      <I18nProvider>
        <TestChild />
      </I18nProvider>,
    );
    expect(screen.getByTestId('lang').textContent).toBe('es');
    expect(screen.getByTestId('subtitle').textContent).toContain('Preguntame');

    fireEvent.click(screen.getByText('Toggle'));

    expect(screen.getByTestId('lang').textContent).toBe('en');
    expect(screen.getByTestId('subtitle').textContent).toContain('Ask me');
  });

  it('setLang persists to localStorage', () => {
    const setItem = vi.fn();
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem,
    });

    function TestChild() {
      const { setLang } = useI18n();
      return <button onClick={() => setLang('en')}>Set EN</button>;
    }
    render(
      <I18nProvider>
        <TestChild />
      </I18nProvider>,
    );
    fireEvent.click(screen.getByText('Set EN'));
    expect(setItem).toHaveBeenCalledWith('pokebot-lang', 'en');
  });
});

describe('useI18n', () => {
  it('throws when used outside I18nProvider', () => {
    function Broken() {
      useI18n();
      return null;
    }
    expect(() => render(<Broken />)).toThrow('useI18n must be used within I18nProvider');
  });
});
