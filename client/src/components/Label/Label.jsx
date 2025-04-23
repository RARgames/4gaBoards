import React from 'react';
import classNames from 'classnames';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';

import LabelColors from '../../constants/LabelColors';
import { Button } from '../Utils';

import * as bs from '../../backgrounds.module.scss';
import * as gs from '../../global.module.scss';
import * as s from './Label.module.scss';

const VARIANTS = {
  CARD: 'card',
  CARDMODAL: 'cardModal',
  LABELS: 'labels',
};

const Label = React.memo(({ name, color, variant, isDisabled, isRemovable, isClickable, className, onClick }) => {
  const contentNode = (
    <div
      title={name}
      className={classNames(
        s.wrapper,
        s[`wrapper${upperFirst(variant)}`],
        onClick && s.wrapperHoverable,
        isRemovable && s.wrapperRemovable,
        bs[`background${upperFirst(camelCase(color))}`],
        (onClick || isClickable) && gs.cursorPointer,
        className,
      )}
    >
      {name}
    </div>
  );

  return onClick ? (
    <Button onClick={onClick} disabled={isDisabled} className={s.button}>
      {contentNode}
    </Button>
  ) : (
    contentNode
  );
});

Label.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.oneOf(LabelColors).isRequired,
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
  isDisabled: PropTypes.bool,
  isRemovable: PropTypes.bool,
  className: PropTypes.string,
  isClickable: PropTypes.bool,
  onClick: PropTypes.func,
};

Label.defaultProps = {
  variant: VARIANTS.CARDMODAL,
  isDisabled: false,
  isRemovable: false,
  className: undefined,
  isClickable: false,
  onClick: undefined,
};

export default Label;
