import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Button, ButtonStyle, Popup } from '../Utils';

import * as s from './MailStep.module.scss';

const MailStep = React.memo(({ title, mailId, onGenerate, onReset, onDelete, onCopy, onBack }) => {
  const [t] = useTranslation();

  return (
    <>
      <Popup.Header onBack={onBack}>{title}</Popup.Header>
      <Popup.Content className={s.content}>
        <div className={s.buttons}>
          {mailId && (
            <Button style={ButtonStyle.PopupContext} onClick={onCopy}>
              {t('action.copyMailId')}
            </Button>
          )}
          <Button style={ButtonStyle.PopupContext} onClick={mailId ? onReset : onGenerate}>
            {t(mailId ? 'action.resetMailId' : 'action.generateMailId')}
          </Button>
          {mailId && (
            <Button style={ButtonStyle.PopupContext} onClick={onDelete}>
              {t('action.deleteMailId')}
            </Button>
          )}
        </div>
      </Popup.Content>
    </>
  );
});

MailStep.propTypes = {
  title: PropTypes.string.isRequired,
  mailId: PropTypes.string,
  onGenerate: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

MailStep.defaultProps = {
  mailId: undefined,
  onBack: undefined,
};

export default MailStep;
