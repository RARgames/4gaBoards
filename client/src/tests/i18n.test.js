/* eslint-disable no-plusplus, no-param-reassign, no-continue, no-console */
const fs = require('fs');
const path = require('path');

const localesPackageJson = require.resolve('@4gaboards/locales');
const LOCALES_DIR = path.dirname(localesPackageJson);
const BASE_LANG = 'en';
const IGNORED_EXTRA_KEY_PREFIXES = ['dateFns'];

// list of plural forms
const LANGUAGE_PLURALS = {
  cs: ['one', 'few', 'other'],
  da: ['one', 'other'],
  de: ['one', 'other'],
  en: ['one', 'other'],
  es: ['one', 'other'],
  fr: ['one', 'other'],
  it: ['one', 'other'],
  ja: ['other'],
  ko: ['other'],
  pl: ['one', 'few', 'many'], // TODO technically it should include 'other', but we don't use fractions
  pt_br: ['one', 'other'],
  ru: ['one', 'few', 'many', 'other'],
  sk: ['one', 'few', 'other'],
  sv: ['one', 'other'],
  uz: ['one', 'other'],
  zh: ['other'],
};

// helper: extract {{variables}}
const extractVariables = (str) => {
  const regex = /{{\s*([^}]+)\s*}}/g;
  const vars = [];
  let match;
  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(str)) !== null) vars.push(match[1]);
  return vars.sort();
};

// helper: extract react-i18next tags <card>...</card>
const extractTags = (str) => {
  const regex = /<([a-zA-Z][a-zA-Z0-9]*)>/g;
  const tags = [];
  let match;
  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(str)) !== null) tags.push(match[1]);
  return tags.sort();
};

// helper: check if key is a plural key
const isPluralKey = (key) => /_(zero|one|two|few|many|other)$/.test(key);

// helper: get stem of plural key
const getPluralStem = (key) => key.replace(/_(zero|one|two|few|many|other)$/, '');

// eslint-disable-next-line default-param-last, no-shadow
const collectExtraKeys = (baseObj, obj, path = [], stats, lang = 'en') => {
  if (!obj || typeof obj !== 'object') {
    return;
  }

  const baseKeys = Object.keys(baseObj || {});
  const targetKeys = Object.keys(obj);
  const requiredPlurals = LANGUAGE_PLURALS[lang] || ['one', 'other'];

  // eslint-disable-next-line no-restricted-syntax
  for (const key of targetKeys) {
    const baseVal = baseObj ? baseObj[key] : undefined;
    const val = obj[key];
    const fullPath = [...path, key].join('.');

    if (IGNORED_EXTRA_KEY_PREFIXES.some((prefix) => fullPath === prefix || fullPath.startsWith(`${prefix}.`))) {
      continue;
    }

    if (baseVal === undefined) {
      // Allow extra plural forms (e.g. _few/_many) only when the stem exists in base and the suffix is required for the target language.
      if (isPluralKey(key)) {
        const stem = getPluralStem(key);
        const suffix = key.slice(stem.length + 1);
        const baseHasPluralStem = baseKeys.some((baseKey) => isPluralKey(baseKey) && getPluralStem(baseKey) === stem);

        if (baseHasPluralStem && requiredPlurals.includes(suffix)) {
          continue;
        }
      }

      stats.extraKeys.push(fullPath);
      continue;
    }

    if (typeof baseVal === 'object' && baseVal !== null && typeof val === 'object' && val !== null) {
      collectExtraKeys(baseVal, val, [...path, key], stats, lang);
    }
  }
};

// eslint-disable-next-line default-param-last, no-shadow
const compareTranslations = (baseObj, obj, path = [], stats, lang = 'en') => {
  const baseKeys = Object.keys(baseObj);
  const targetKeys = obj ? Object.keys(obj) : [];
  const requiredPlurals = LANGUAGE_PLURALS[lang] || ['one', 'other'];

  // eslint-disable-next-line no-restricted-syntax
  for (const key of baseKeys) {
    const fullPath = [...path, key];
    const baseVal = baseObj[key];
    const val = obj ? obj[key] : undefined;

    // handle plurals
    if (isPluralKey(key)) {
      const stem = getPluralStem(key);
      const targetPluralKeys = targetKeys.filter((k) => getPluralStem(k) === stem);

      // count only required plurals for the target language
      const missingPlurals = requiredPlurals.filter((suf) => !targetPluralKeys.includes(`${stem}_${suf}`));

      stats.total += requiredPlurals.length;
      stats.translated += requiredPlurals.length - missingPlurals.length;

      missingPlurals.forEach((suf) => {
        stats.missing++;
        stats.missingKeys.push([...path, `${stem}_${suf}`].join('.'));
      });

      continue;
    }

    if (val === undefined) {
      if (typeof baseVal === 'string') {
        stats.total++;
        stats.missing++;
        stats.missingKeys.push(fullPath.join('.'));
      } else if (typeof baseVal === 'object' && baseVal !== null) {
        stats.missingKeys.push(fullPath.join('.'));
      }
      continue;
    }

    if (typeof baseVal === 'string') {
      stats.total++;

      const baseVars = extractVariables(baseVal);
      const valVars = extractVariables(val);
      if (baseVars.join() !== valVars.join()) {
        stats.variableMismatches.push({
          key: fullPath.join('.'),
          base: baseVars,
          target: valVars,
        });
      }

      const baseTags = extractTags(baseVal);
      const valTags = extractTags(val);
      if (baseTags.join() !== valTags.join()) {
        stats.tagMismatches.push({
          key: fullPath.join('.'),
          base: baseTags,
          target: valTags,
        });
      }

      stats.translated++;
    } else if (typeof baseVal === 'object' && baseVal !== null) {
      compareTranslations(baseVal, val, fullPath, stats, lang);
    } else {
      stats.total++;
      stats.translated++;
    }
  }
};

const loadLanguage = (lang) => {
  const langDir = path.join(LOCALES_DIR, lang);
  const files = fs.readdirSync(langDir).filter((f) => f.endsWith('.js') && f !== 'index.js');

  const data = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const file of files) {
    const fullPath = path.join(langDir, file);
    // eslint-disable-next-line import-x/no-dynamic-require, global-require
    const fileData = require(fullPath);

    data[file.replace('.js', '')] = fileData.default || fileData;
  }

  return data;
};

describe('i18n translations coverage', () => {
  const languages = fs
    .readdirSync(LOCALES_DIR)
    .filter((d) => fs.statSync(path.join(LOCALES_DIR, d)).isDirectory())
    .filter((lang) => lang !== BASE_LANG && lang !== 'node_modules');

  const baseTranslations = loadLanguage(BASE_LANG);

  languages.forEach((lang) => {
    test(`translation coverage for "${lang}"`, () => {
      const targetTranslations = loadLanguage(lang);
      const stats = {
        total: 0,
        missing: 0,
        translated: 0,
        missingKeys: [],
        extraKeys: [],
        variableMismatches: [],
        tagMismatches: [],
      };

      Object.keys(baseTranslations).forEach((namespace) => {
        const baseFile = baseTranslations[namespace];
        const targetFile = targetTranslations[namespace] || {};
        compareTranslations(baseFile, targetFile, [], stats, lang);
        collectExtraKeys(baseFile, targetFile, [], stats, lang);
      });

      const coverage = stats.total ? ((stats.translated / stats.total) * 100).toFixed(2) : '0.00';
      console.log(`\nLanguage "${lang}" coverage: ${coverage}% (${stats.translated}/${stats.total} translated)\n`);

      if (stats.missingKeys.length || stats.extraKeys.length || stats.variableMismatches.length || stats.tagMismatches.length) {
        const messages = [];

        if (stats.missingKeys.length) {
          messages.push(`Missing keys:\n${stats.missingKeys.join('\n')}`);
        }

        if (stats.extraKeys.length) {
          messages.push(`Extra keys:\n${stats.extraKeys.join('\n')}`);
        }

        if (stats.variableMismatches.length) {
          messages.push(`Variable mismatches:\n${stats.variableMismatches.map((m) => `${m.key} -> base:[${m.base}] target:[${m.target}]`).join('\n')}`);
        }

        if (stats.tagMismatches.length) {
          messages.push(`Tag mismatches:\n${stats.tagMismatches.map((m) => `${m.key} -> base:[${m.base}] target:[${m.target}]`).join('\n')}`);
        }

        console.warn(`\n[${lang}] Translation issues:\n${messages.join('\n\n')}`);
      }

      expect(stats.missing).toBe(0);
      expect(stats.extraKeys.length).toBe(0);
      expect(stats.variableMismatches.length).toBe(0);
      expect(stats.tagMismatches.length).toBe(0);
    });
  });
});
