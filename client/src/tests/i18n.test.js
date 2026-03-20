/* eslint-disable no-plusplus, no-param-reassign, no-continue, no-console */
const fs = require('fs');
const path = require('path');

// eslint-disable-next-line no-undef
const LOCALES_DIR = path.resolve(__dirname, '../locales');
const BASE_LANG = 'en';

// helper: extract {{variables}}
const extractVariables = (str) => {
  const regex = /{{\s*([^}]+)\s*}}/g;
  const vars = [];
  let match;
  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(str)) !== null) vars.push(match[1]);
  return vars.sort();
};

// helper: extract react-i18next tags <0>...</0>
const extractTags = (str) => {
  const regex = /<(\d+)>/g;
  const tags = [];
  let match;
  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(str)) !== null) tags.push(match[1]);
  return tags.sort();
};

// eslint-disable-next-line default-param-last, no-shadow
const compareTranslations = (baseObj, obj, path = [], stats) => {
  // eslint-disable-next-line guard-for-in, no-restricted-syntax
  for (const key in baseObj) {
    const fullPath = [...path, key];
    const baseVal = baseObj[key];
    const val = obj[key];

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
      compareTranslations(baseVal, val, fullPath, stats);
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
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const fileData = require(fullPath);

    data[file.replace('.js', '')] = fileData.default || fileData;
  }

  return data;
};

describe('i18n translations coverage', () => {
  test('should calculate translation coverage', () => {
    const languages = fs.readdirSync(LOCALES_DIR).filter((d) => fs.statSync(path.join(LOCALES_DIR, d)).isDirectory());
    const baseTranslations = loadLanguage(BASE_LANG);

    languages.forEach((lang) => {
      if (lang === BASE_LANG) return;

      const targetTranslations = loadLanguage(lang);
      const stats = {
        total: 0,
        missing: 0,
        translated: 0,
        missingKeys: [],
        variableMismatches: [],
        tagMismatches: [],
      };

      Object.keys(baseTranslations).forEach((namespace) => {
        const baseFile = baseTranslations[namespace];
        const targetFile = targetTranslations[namespace] || {};

        compareTranslations(baseFile, targetFile, [], stats);
      });

      const coverage = stats.total ? ((stats.translated / stats.total) * 100).toFixed(2) : '0.00';
      console.log(`\nLanguage "${lang}" coverage: ${coverage}% (${stats.translated}/${stats.total} translated)\n`);

      if (stats.missingKeys.length || stats.variableMismatches.length || stats.tagMismatches.length) {
        const messages = [];

        if (stats.missingKeys.length) {
          messages.push(`Missing keys:\n${stats.missingKeys.join('\n')}`);
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
      expect(stats.variableMismatches.length).toBe(0);
      expect(stats.tagMismatches.length).toBe(0);
    });
  });
});
