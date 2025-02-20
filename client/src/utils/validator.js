import zxcvbn from 'zxcvbn';

import Config from '../constants/Config';

const USERNAME_REGEX = /^[a-zA-Z0-9]+((_|\.)?[a-zA-Z0-9])*$/;

export const isPassword = (string) => zxcvbn(string).score >= Config.REQUIRED_PASSWORD_STRENGTH;

export const isUsername = (string) => string.length >= 3 && string.length <= 16 && USERNAME_REGEX.test(string);
