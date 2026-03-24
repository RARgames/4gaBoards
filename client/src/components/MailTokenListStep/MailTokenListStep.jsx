import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { useField, useSteps } from '../../hooks';
import DateText from '../DateText';
import DeleteStep from '../DeleteStep';
import User from '../User';
import { Popup, Input, InputStyle, Button, ButtonStyle, Icon, IconSize, IconType } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './MailTokenListStep.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

const MailTokenListStep = React.memo(({ title, mailTokens, mailServiceInboundEmail, canEdit, onCreate, onUpdate, onDelete, onBack }) => {
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();
  const [search, handleSearchChange] = useField('');
  const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);
  const searchField = useRef(null);

  const filteredMailTokens = useMemo(() => mailTokens.filter((mailToken) => mailToken.user?.name?.toLowerCase().includes(cleanSearch)), [mailTokens, cleanSearch]);

  useEffect(() => {
    searchField.current?.focus({ preventScroll: true });
  }, []);

  const handleCreateClick = useCallback(() => {
    onCreate();
  }, [onCreate]);

  const handleUpdateClick = useCallback(
    (mailTokenId) => {
      onUpdate(mailTokenId);
    },
    [onUpdate],
  );

  const handleDeleteClick = useCallback(
    (mailTokenId) => {
      openStep(StepTypes.DELETE, { mailTokenId });
    },
    [openStep],
  );

  const handleCopyClick = useCallback(
    (mailToken) => {
      navigator.clipboard.writeText(`${mailToken}-${mailServiceInboundEmail}`);
    },
    [mailServiceInboundEmail],
  );

  if (step) {
    switch (step.type) {
      case StepTypes.DELETE:
        return (
          <DeleteStep
            title={t('common.deleteEmail_withEmail', { email: step.params.mailTokenId })}
            content={t('common.deleteEmailConfirmation')}
            buttonContent={t('action.delete')}
            onConfirm={() => {
              onDelete(step.params.mailTokenId);
              handleBack();
            }}
            onBack={handleBack}
          />
        );
      default:
    }
  }

  return (
    <>
      <Popup.Header onBack={onBack} tooltip={t('common.mailToCardSyntax')}>
        {title}
      </Popup.Header>
      <Popup.Content>
        <div className={s.inputWrapper}>
          <Input ref={searchField} style={InputStyle.FullWidth} value={search} placeholder={t('common.filterEmailsByUser')} onChange={handleSearchChange} />
          {canEdit && (
            <Button style={ButtonStyle.Icon} title={t('common.generateNewEmail')} onClick={handleCreateClick} className={s.createButton}>
              <Icon type={IconType.Plus} size={IconSize.Size14} />
            </Button>
          )}
        </div>
        {filteredMailTokens.length > 0 ? (
          <div className={clsx(s.items, gs.scrollableY)}>
            {filteredMailTokens.map((mailToken) => (
              <div key={mailToken.id} className={s.item}>
                <div className={s.itemHeader}>
                  <span className={s.user}>
                    <User name={mailToken.user.name} avatarUrl={mailToken.user.avatarUrl} size="tiny" />
                    <span className={s.userName}>{mailToken.user.name}</span>
                  </span>
                  <DateText value={mailToken.createdAt} showTime className={s.createdAt} />
                  <div className={s.itemHeaderButtons}>
                    {mailToken.isCurrentUser && (
                      <Button style={ButtonStyle.Icon} title={t('common.resetEmail')} onClick={() => handleUpdateClick(mailToken.id)}>
                        <Icon type={IconType.Reset} size={IconSize.Size12} />
                      </Button>
                    )}
                    <Button style={ButtonStyle.Icon} title={t('common.deleteEmail')} onClick={() => handleDeleteClick(mailToken.id)}>
                      <Icon type={IconType.Trash} size={IconSize.Size12} />
                    </Button>
                  </div>
                </div>
                <div className={s.itemContent}>
                  <Button style={ButtonStyle.Icon} title={t('common.copyEmail')} onClick={() => handleCopyClick(mailToken.token)} className={s.copyButton}>
                    <Icon type={IconType.Copy} size={IconSize.Size12} />
                  </Button>
                  <span className={s.email}>{`${mailToken.token}-${mailServiceInboundEmail}`}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={s.noEmails}>{t('common.noEmails')}</div>
        )}
      </Popup.Content>
    </>
  );
});

MailTokenListStep.propTypes = {
  title: PropTypes.element.isRequired,
  mailTokens: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  mailServiceInboundEmail: PropTypes.string.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

MailTokenListStep.defaultProps = {
  onBack: undefined,
};

export default MailTokenListStep;
