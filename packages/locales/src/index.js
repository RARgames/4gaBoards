import cs from './cs';
import csActivity from './cs/activity';
import da from './da';
import daActivity from './da/activity';
import de from './de';
import deActivity from './de/activity';
import en from './en';
import enActivity from './en/activity';
import es from './es';
import esActivity from './es/activity';
import fr from './fr';
import frActivity from './fr/activity';
import it from './it';
import itActivity from './it/activity';
import ja from './ja';
import jaActivity from './ja/activity';
import ko from './ko';
import koActivity from './ko/activity';
import pl from './pl';
import plActivity from './pl/activity';
import ptBr from './pt-BR';
import ptBrActivity from './pt-BR/activity';
import ru from './ru';
import ruActivity from './ru/activity';
import sk from './sk';
import skActivity from './sk/activity';
import sv from './sv';
import svActivity from './sv/activity';
import uz from './uz';
import uzActivity from './uz/activity';
import zh from './zh';
import zhActivity from './zh/activity';

const locales = [cs, da, de, en, es, fr, it, ja, ko, pl, ptBr, ru, sk, sv, uz, zh];

export default locales;

export const languages = locales.map((locale) => locale.language);

export const embeddedLocales = locales.reduce(
  (result, locale) => ({
    ...result,
    [locale.language]: locale.embeddedLocale,
  }),
  {},
);

export const activityLocales = {
  cs: csActivity,
  da: daActivity,
  de: deActivity,
  en: enActivity,
  es: esActivity,
  fr: frActivity,
  it: itActivity,
  ja: jaActivity,
  ko: koActivity,
  pl: plActivity,
  'pt-BR': ptBrActivity,
  ru: ruActivity,
  sk: skActivity,
  sv: svActivity,
  uz: uzActivity,
  zh: zhActivity,
};

export const flags = locales.map((locale) => locale.flags);
