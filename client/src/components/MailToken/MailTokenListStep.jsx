import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import trashIcon from '../../assets/icons/Trash.svg';
import { useField, useSteps } from '../../hooks';
import DeleteStep from '../DeleteStep';
import User from '../User';
import { Popup, Input, InputStyle } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './MailTokenListStep.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

const MailTokenListStep = React.memo(({ mailTokens, title, contextType, onDelete, onBack }) => {
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();
  const [search, handleSearchChange] = useField('');
  const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);
  const [sortedMailTokens, setSortedMailTokens] = useState([]);

  const searchField = useRef(null);

  useEffect(() => {
    setSortedMailTokens([...mailTokens].sort((a, b) => a.user?.name?.localeCompare(b.user?.name || '') || 0));
  }, [mailTokens]);

  // TODO check later
  const filteredMailTokens = useMemo(
    () => sortedMailTokens.filter((mail) => mail.id.toLowerCase().includes(cleanSearch) || mail.user?.name?.toLowerCase().includes(cleanSearch)),
    [sortedMailTokens, cleanSearch],
  );

  useEffect(() => {
    searchField.current?.focus({ preventScroll: true });
  }, []);

  const handleDeleteClick = useCallback(
    (mailId) => {
      openStep(StepTypes.DELETE, { mailId });
    },
    [openStep],
  );

  if (step) {
    switch (step.type) {
      case StepTypes.DELETE:
        return (
          <DeleteStep
            title={t('common.deleteMailId_title', { context: 'title' })}
            content={t('common.areYouSureYouWantToDeleteThisMailId')}
            buttonContent={t('action.delete')}
            onConfirm={() => {
              onDelete(step.params.mailId);
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
      <Popup.Header onBack={onBack}>{title}</Popup.Header>
      <Popup.Content>
        <Input ref={searchField} style={InputStyle.Default} value={search} placeholder={t('common.searchUsers')} onChange={handleSearchChange} />
        {filteredMailTokens.length > 0 ? (
          <div className={clsx(s.mails, gs.scrollableY)}>
            {filteredMailTokens.map((mailToken) => (
              <div key={mailToken.id} className={s.mailItem}>
                <div className={s.userSection}>
                  <User name={mailToken.user?.name || 'Unknown'} avatarUrl={mailToken.user?.avatarUrl} size="small" />
                  <span className={s.userName}>{mailToken.user?.name || '—'}</span>
                </div>

                <div className={s.mailIdAndContext}>
                  <span className={s.mailId}>{mailToken.mailId}</span>
                  {contextType === 'board' && (
                    <span className={s.contextLabel}>{mailToken.contextType === 'board' ? `${t('common.board_title')}: ${mailToken.contextName}` : `${t('common.list')}: ${mailToken.contextName}`}</span>
                  )}
                </div>

                <button type="button" className={s.deleteBtn} title={t('action.delete')} onClick={() => handleDeleteClick(mailToken.id)}>
                  <img src={trashIcon} alt="Delete" className={s.trashIcon} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={s.noMailId}>{t('common.noMailId')}</div>
        )}
      </Popup.Content>
    </>
  );
});

MailTokenListStep.propTypes = {
  mailTokens: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      user: PropTypes.shape({
        name: PropTypes.string,
        avatarUrl: PropTypes.string,
      }),
      contextType: PropTypes.string,
      contextName: PropTypes.string,
    }),
  ).isRequired,
  title: PropTypes.string,
  contextType: PropTypes.oneOf(['list', 'board']).isRequired,
  onDelete: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

MailTokenListStep.defaultProps = {
  title: 'common.mailTokens',
  onBack: undefined,
};

export default MailTokenListStep;
