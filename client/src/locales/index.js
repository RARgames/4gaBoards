import cs from './cs';
import da from './da';
import de from './de';
import en from './en';
import es from './es';
import fr from './fr';
import it from './it';
import ja from './ja';
import ko from './ko';
import pl from './pl';
import ptBr from './pt-BR';
import ru from './ru';
import sk from './sk';
import sv from './sv';
import uz from './uz';
import zh from './zh';

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

export const flags = locales.map((locale) => locale.flags);
