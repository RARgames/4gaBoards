import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Button, ButtonStyle } from '../../Utils';

import * as gs from '../../../global.module.scss';
import * as s from './ReassignConfirmDialog.module.scss';

const ReassignConfirmDialog = React.memo(({ cardName, fromLabel, toLabel, additive, onConfirm, onCancel }) => {
  const [t] = useTranslation();

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className={s.backdrop} onClick={onCancel}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className={s.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={s.title}>{t('common.reassignCard', { context: 'title' })}</div>
        <div className={s.body}>{additive ? t('common.areYouSureYouWantToAddThisCardToUser', { cardName, toLabel }) : t('common.areYouSureYouWantToReassignThisCard', { cardName, fromLabel, toLabel })}</div>
        <div className={gs.controlsSpaceBetween}>
          <Button style={ButtonStyle.Default} content={t('action.cancel')} onClick={onCancel} />
          <Button style={ButtonStyle.DefaultBorder} content={t('action.confirm')} onClick={onConfirm} />
        </div>
      </div>
    </div>
  );
});

ReassignConfirmDialog.propTypes = {
  cardName: PropTypes.string.isRequired,
  fromLabel: PropTypes.string.isRequired,
  toLabel: PropTypes.string.isRequired,
  additive: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

ReassignConfirmDialog.defaultProps = {
  additive: false,
};

export default ReassignConfirmDialog;
