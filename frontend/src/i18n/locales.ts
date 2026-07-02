import { es } from './es';
import { en } from './en';
import type { Lang, Translations } from './types';

export type { Lang, Translations } from './types';
export { getInitialLang, getLangCode } from './types';

export const translations: Record<Lang, Translations> = { es, en };
