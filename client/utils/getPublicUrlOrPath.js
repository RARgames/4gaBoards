/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { URL } = require('url');

/**
 * Returns a URL or a path with slash at the end
 * In production can be URL, abolute path, relative path
 * In development always will be an absolute path
 * In development can use `path` module functions for operations
 *
 * @param {boolean} isEnvDevelopment
 * @param {(string|undefined)} homepage a valid url or pathname
 * @param {(string|undefined)} envPublicUrl a valid url or pathname
 * @returns {string}
 */
function getPublicUrlOrPath(isEnvDevelopment, homepage, envPublicUrl) {
  const stubDomain = 'https://create-react-app.dev';

  if (envPublicUrl) {
    // ensure last slash exists
    // eslint-disable-next-line no-param-reassign
    envPublicUrl = envPublicUrl.endsWith('/') ? envPublicUrl : `${envPublicUrl}/`;

    // validate if `envPublicUrl` is a URL or path like
    // `stubDomain` is ignored if `envPublicUrl` contains a domain
    const validPublicUrl = new URL(envPublicUrl, stubDomain);

    // eslint-disable-next-line no-nested-ternary
    return isEnvDevelopment
      ? envPublicUrl.startsWith('.')
        ? '/'
        : validPublicUrl.pathname
      : // Some apps do not use client-side routing with pushState.
        // For these, "homepage" can be set to "." to enable relative asset paths.
        envPublicUrl;
  }

  if (homepage) {
    // strip last slash if exists
    // eslint-disable-next-line no-param-reassign
    homepage = homepage.endsWith('/') ? homepage : `${homepage}/`;

    // validate if `homepage` is a URL or path like and use just pathname
    const validHomepagePathname = new URL(homepage, stubDomain).pathname;
    // eslint-disable-next-line no-nested-ternary
    return isEnvDevelopment
      ? homepage.startsWith('.')
        ? '/'
        : validHomepagePathname
      : // Some apps do not use client-side routing with pushState.
        // For these, "homepage" can be set to "." to enable relative asset paths.
        homepage.startsWith('.')
        ? homepage
        : validHomepagePathname;
  }

  return '/';
}

module.exports = getPublicUrlOrPath;
