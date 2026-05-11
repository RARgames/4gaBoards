const localesModule = require('@4gaboards/locales');
const i18next = require('i18next');

let rendererModulesPromise;
const i18nextInstances = new Map();

const getActivityScopeLabelKey = (scope, scopes) => {
  switch (scope) {
    case scopes.INSTANCE:
      return 'activity.instance';
    case scopes.USER:
      return 'activity.user';
    case scopes.PROJECT:
      return 'activity.project';
    case scopes.BOARD:
      return 'activity.board';
    case scopes.LIST:
      return 'activity.list';
    case scopes.CARD:
      return 'activity.card';
    case scopes.TASK:
      return 'activity.task';
    case scopes.COMMENT:
      return 'activity.comment';
    case scopes.ATTACHMENT:
      return 'activity.attachment';
    default:
      return 'activity.all';
  }
};

const getI18nextTranslator = async (language, activityLocale) => {
  if (i18nextInstances.has(language)) {
    return i18nextInstances.get(language);
  }

  if (!activityLocale) {
    return null;
  }

  const instance = i18next.createInstance();
  await instance.init({
    lng: language,
    resources: {
      [language]: activityLocale,
    },
    interpolation: {
      escapeValue: false,
    },
  });

  const translator = instance.t.bind(instance);
  i18nextInstances.set(language, translator);
  return translator;
};

const getLocaleByLanguage = (locales, language) => {
  const fallback = locales.find((l) => l.language === 'en') || locales[0];

  if (!language) return fallback;

  const normalized = language.toLowerCase();
  const base = normalized.split('-')[0];

  return locales.find((l) => l.language === language) || locales.find((l) => l.language.toLowerCase() === base) || fallback;
};

const loadRendererModules = async () => {
  if (!rendererModulesPromise) {
    rendererModulesPromise = Promise.resolve({
      locales: localesModule.default,
      activityLocales: localesModule.activityLocales,
    });
  }

  return rendererModulesPromise;
};

module.exports = {
  getActivityScopeLabelKey,
  getI18nextTranslator,
  getLocaleByLanguage,
  loadRendererModules,
};
