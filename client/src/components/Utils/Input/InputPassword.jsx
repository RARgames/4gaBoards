import zxcvbn from 'zxcvbn';
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useToggle } from '../../../lib/hooks';
import { Icon, IconType, IconSize } from '../Icon';
import { Button, ButtonStyle } from '../Button';
import { ProgressBar, ProgressBarSize } from '../ProgressBar';
import InputStyle from './InputStyle';

import styles from './Input.module.scss';
import sPassword from './InputPassword.module.scss';

const STRENGTH_SCORE_COLORS = ['red', 'orange', 'yellow', 'olive', 'green'];

const InputPassword = React.forwardRef(({ style, value, withStrengthBar, minStrengthScore, className, ...props }, ref) => {
  const [t] = useTranslation();
  const [isVisible, toggleVisible] = useToggle();

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

  if (!withStrengthBar) {
    return (
      <>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <input {...inputProps} className={classNames(styles.base, style && styles[style], className)} />
        <Button style={ButtonStyle.Icon} title={t('common.togglePasswordVisibility')} onClick={handleToggleClick} className={sPassword.passwordIcon} tabIndex="-1">
          <Icon type={isVisible ? IconType.Eye : IconType.EyeSlash} size={IconSize.Size20} />
        </Button>
      </>
    );
  }

  // TODO show visual error on input field if error={!!value && strengthScore < minStrengthScore}
  return (
    <>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <input {...inputProps} className={classNames(styles.base, style && styles[style], className)} />
      <Button style={ButtonStyle.Icon} title={t('common.togglePasswordVisibility')} onClick={handleToggleClick} className={sPassword.passwordIcon} tabIndex="-1">
        <Icon type={isVisible ? IconType.Eye : IconType.EyeSlash} size={IconSize.Size20} />
      </Button>
      <ProgressBar value={value ? strengthScore + 1 : 0} total={5} color={STRENGTH_SCORE_COLORS[strengthScore]} size={ProgressBarSize.Tiny} />
    </>
  );
});

InputPassword.propTypes = {
  style: PropTypes.oneOf(Object.values(InputStyle)),
  value: PropTypes.string.isRequired,
  withStrengthBar: PropTypes.bool,
  minStrengthScore: PropTypes.number,
  className: PropTypes.string,
};

InputPassword.defaultProps = {
  style: undefined,
  withStrengthBar: false,
  minStrengthScore: 2,
  className: undefined,
};

export default React.memo(InputPassword);
