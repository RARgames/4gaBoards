import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import zxcvbn from 'zxcvbn';

import { useToggle } from '../../../lib/hooks';
import { Button, ButtonVariant } from '../Button';
import { Icon, IconType, IconSize } from '../Icon';
import { ProgressBar, ProgressBarSize } from '../ProgressBar';
import InputVariant from './InputVariant';

import * as s from './Input.module.scss';
import * as sPassword from './InputPassword.module.scss';

const InputPassword = React.forwardRef(({ variant, value, withStrengthBar, minStrengthScore, className, isError, ...props }, ref) => {
  const [t] = useTranslation();
  const [isVisible, toggleVisible] = useToggle();
  const variants = Array.isArray(variant) ? variant.map((v) => s[v]) : variant && s[variant];

  const strengthScore = useMemo(() => {
    if (!withStrengthBar) {
      return undefined;
    }

    return zxcvbn(value).score;
  }, [value, withStrengthBar]);

  const handleToggleClick = useCallback(() => {
    toggleVisible();
    ref.current?.focus();
  }, [ref, toggleVisible]);

  const inputProps = {
    ...props,
    ref,
    type: isVisible ? 'text' : 'password',
  };

  return (
    <div className={sPassword.inputWrapper}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <input {...inputProps} className={clsx(s.input, sPassword.inputPassword, variants, className, isError && s.inputError)} />
      <Button variant={ButtonVariant.Icon} title={t('common.togglePasswordVisibility')} onClick={handleToggleClick} className={sPassword.passwordIcon} tabIndex="-1">
        <Icon type={isVisible ? IconType.Eye : IconType.EyeSlash} size={IconSize.Size20} />
      </Button>
      {withStrengthBar && <ProgressBar value={value ? strengthScore + 1 : 0} total={5} size={ProgressBarSize.Tiny} className={sPassword.progressBar} />}
    </div>
  );
});

InputPassword.propTypes = {
  variant: PropTypes.oneOfType([PropTypes.oneOf(Object.values(InputVariant)), PropTypes.arrayOf(PropTypes.oneOf(Object.values(InputVariant)))]),
  value: PropTypes.string.isRequired,
  withStrengthBar: PropTypes.bool,
  minStrengthScore: PropTypes.number,
  className: PropTypes.string,
  isError: PropTypes.bool,
};

InputPassword.defaultProps = {
  variant: undefined,
  withStrengthBar: false,
  minStrengthScore: 2,
  className: undefined,
  isError: false,
};

export default React.memo(InputPassword);
