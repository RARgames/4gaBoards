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
import * as s from './MailListStep.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

const MailListStep = React.memo(({ mails, title, contextType, onDelete, onBack }) => {
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();
  const [search, handleSearchChange] = useField('');
  const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);
  const [sortedMails, setSortedMails] = useState([]);

  const searchField = useRef(null);

  useEffect(() => {
    setSortedMails([...mails].sort((a, b) => a.user?.name?.localeCompare(b.user?.name || '') || 0));
  }, [mails]);

  const filteredMails = useMemo(() => sortedMails.filter((mail) => mail.id.toLowerCase().includes(cleanSearch) || mail.user?.name?.toLowerCase().includes(cleanSearch)), [sortedMails, cleanSearch]);

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
        {filteredMails.length > 0 ? (
          <div className={clsx(s.mails, gs.scrollableY)}>
            {filteredMails.map((mail) => (
              <div key={mail.mailId} className={s.mailItem}>
                <div className={s.userSection}>
                  <User name={mail.user?.name || 'Unknown'} avatarUrl={mail.user?.avatarUrl} size="small" />
                  <span className={s.userName}>{mail.user?.name || '—'}</span>
                </div>

                <div className={s.mailIdAndContext}>
                  <span className={s.mailId}>{mail.mailId}</span>
                  {contextType === 'board' && (
                    <span className={s.contextLabel}>{mail.contextType === 'board' ? `${t('common.board_title')}: ${mail.contextName}` : `${t('common.list')}: ${mail.contextName}`}</span>
                  )}
                </div>

                <button type="button" className={s.deleteBtn} title={t('action.delete')} onClick={() => handleDeleteClick(mail.mailId)}>
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

MailListStep.propTypes = {
  mails: PropTypes.arrayOf(
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

MailListStep.defaultProps = {
  title: 'common.mailIds',
  onBack: undefined,
};

export default MailListStep;
