import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import zxcvbn from 'zxcvbn';

import { useToggle } from '../../../lib/hooks';
import { Button, ButtonStyle } from '../Button';
import { Icon, IconType, IconSize } from '../Icon';
import { ProgressBar, ProgressBarSize } from '../ProgressBar';
import InputStyle from './InputStyle';

import * as s from './Input.module.scss';
import * as sPassword from './InputPassword.module.scss';

const InputPassword = React.forwardRef(({ style, value, withStrengthBar, minStrengthScore, className, isError, ...props }, ref) => {
  const [t] = useTranslation();
  const [isVisible, toggleVisible] = useToggle();
  const styles = Array.isArray(style) ? style.map((st) => s[st]) : style && s[style];

  const strengthScore = useMemo(() => {
    if (!withStrengthBar) {
      return undefined;
    }

    return zxcvbn(value).score;
  }, [value, withStrengthBar]);

  const handleToggleClick = useCallback(() => {
    toggleVisible();
  }, [toggleVisible]);

  const inputProps = {
    ...props,
    ref,
    type: isVisible ? 'text' : 'password',
  };

  return (
    <div className={sPassword.inputWrapper}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <input {...inputProps} className={classNames(s.input, sPassword.inputPassword, styles, className, isError && s.inputError)} />
      <Button style={ButtonStyle.Icon} title={t('common.togglePasswordVisibility')} onClick={handleToggleClick} className={sPassword.passwordIcon} tabIndex="-1">
        <Icon type={isVisible ? IconType.Eye : IconType.EyeSlash} size={IconSize.Size20} />
      </Button>
      {withStrengthBar && <ProgressBar value={value ? strengthScore + 1 : 0} total={5} size={ProgressBarSize.Tiny} className={sPassword.progressBar} />}
    </div>
  );
});

InputPassword.propTypes = {
  style: PropTypes.oneOfType([PropTypes.oneOf(Object.values(InputStyle)), PropTypes.arrayOf(PropTypes.oneOf(Object.values(InputStyle)))]),
  value: PropTypes.string.isRequired,
  withStrengthBar: PropTypes.bool,
  minStrengthScore: PropTypes.number,
  className: PropTypes.string,
  isError: PropTypes.bool,
};

InputPassword.defaultProps = {
  style: undefined,
  withStrengthBar: false,
  minStrengthScore: 2,
  className: undefined,
  isError: false,
};

export default React.memo(InputPassword);
