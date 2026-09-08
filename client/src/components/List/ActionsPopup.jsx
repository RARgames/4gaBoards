import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { useSteps } from '../../hooks';
import { ActivityStep } from '../ActivityPopup';
import DeleteStep from '../DeleteStep';
import { Button, ButtonStyle, Icon, IconType, IconSize, Popup, withPopup } from '../Utils';

import * as s from './ActionsPopup.module.scss';

const StepTypes = {
  ARCHIVE_ALL: 'ARCHIVE_ALL',
  DELETE: 'DELETE',
  ACTIVITY: 'ACTIVITY',
  LIST_TYPE: 'LIST_TYPE',
};

const LIST_TYPES = ['none', 'active', 'blocked', 'done'];

// §6.1: the mockup's four-option list-type menu, translated into this app's popup-step
// convention (same shape as DeleteStep/ActivityStep — Popup.Header w/ onBack + Popup.Content).
const ListTypeStep = React.memo(({ type, wipLimit, autoArchiveDays, onUpdate, onBack }) => {
  const [t] = useTranslation();

  const handleWipLimitChange = useCallback(
    (event) => {
      const { value } = event.target;
      onUpdate({ wipLimit: value === '' ? null : Number(value) });
    },
    [onUpdate],
  );

  const handleAutoArchiveDaysChange = useCallback(
    (event) => {
      const { value } = event.target;
      onUpdate({ autoArchiveDays: value === '' ? null : Number(value) });
    },
    [onUpdate],
  );

  return (
    <>
      <Popup.Header onBack={onBack}>{t('common.listType')}</Popup.Header>
      <Popup.Content>
        {LIST_TYPES.map((candidateType) => (
          <Button key={candidateType} style={ButtonStyle.PopupContext} className={clsx(s.typeOption, candidateType === type && s.typeOptionSelected)} onClick={() => onUpdate({ type: candidateType })}>
            <span className={clsx(s.typeOptionDot, s[`typeOptionDot-${candidateType}`])} />
            <span className={s.typeOptionText}>
              <b>{t(`common.listType${candidateType.charAt(0).toUpperCase()}${candidateType.slice(1)}`)}</b>
              <small>{t(`common.listType${candidateType.charAt(0).toUpperCase()}${candidateType.slice(1)}Description`)}</small>
            </span>
            {candidateType === type && <Icon type={IconType.Check} size={IconSize.Size13} className={s.typeOptionCheck} />}
          </Button>
        ))}
        {type === 'active' && (
          <div className={s.typeField}>
            <label htmlFor="listActionsPopupWipLimit">{t('common.wipLimit')}</label>
            <input id="listActionsPopupWipLimit" type="number" min="0" value={wipLimit ?? ''} onChange={handleWipLimitChange} />
          </div>
        )}
        {type === 'done' && (
          <div className={s.typeField}>
            <label htmlFor="listActionsPopupAutoArchiveDays">{t('common.autoArchiveAfter')}</label>
            <input id="listActionsPopupAutoArchiveDays" type="number" min="1" value={autoArchiveDays ?? ''} onChange={handleAutoArchiveDaysChange} />
          </div>
        )}
      </Popup.Content>
    </>
  );
});

ListTypeStep.propTypes = {
  type: PropTypes.oneOf(LIST_TYPES).isRequired,
  wipLimit: PropTypes.number,
  autoArchiveDays: PropTypes.number,
  onUpdate: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

ListTypeStep.defaultProps = {
  wipLimit: undefined,
  autoArchiveDays: undefined,
  onBack: undefined,
};

const ActionsStep = React.memo(
  ({
    name,
    type,
    wipLimit,
    autoArchiveDays,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    boardMemberships,
    cardsCount,
    isAllCardsSelected,
    onNameEdit,
    onCardAdd,
    onSelectAllToggle,
    onArchiveAll,
    onDelete,
    onTypeUpdate,
    onClose,
  }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();

    const handleEditNameClick = useCallback(() => {
      onNameEdit();
    }, [onNameEdit]);

    const handleAddCardClick = useCallback(() => {
      onCardAdd();
      onClose();
    }, [onCardAdd, onClose]);

    const handleDeleteClick = useCallback(() => {
      openStep(StepTypes.DELETE);
    }, [openStep]);

    const handleActivityClick = useCallback(() => {
      openStep(StepTypes.ACTIVITY);
    }, [openStep]);

    const handleSelectAllClick = useCallback(() => {
      onSelectAllToggle();
      onClose();
    }, [onClose, onSelectAllToggle]);

    const handleArchiveAllClick = useCallback(() => {
      openStep(StepTypes.ARCHIVE_ALL);
    }, [openStep]);

    const handleArchiveAllConfirm = useCallback(() => {
      onArchiveAll();
      onClose();
    }, [onArchiveAll, onClose]);

    const handleListTypeClick = useCallback(() => {
      openStep(StepTypes.LIST_TYPE);
    }, [openStep]);

    if (step) {
      switch (step.type) {
        case StepTypes.ARCHIVE_ALL:
          return (
            <DeleteStep
              title={t('common.archiveAllCards', { context: 'title' })}
              content={t('common.areYouSureYouWantToArchiveTheseCards', { count: cardsCount })}
              buttonContent={t('action.archiveAllCards', { count: cardsCount })}
              buttonStyle={ButtonStyle.Submit}
              onConfirm={handleArchiveAllConfirm}
              onBack={handleBack}
            />
          );
        case StepTypes.DELETE:
          return (
            <DeleteStep
              title={t('common.deleteList', { context: 'title' })}
              content={t('common.areYouSureYouWantToDeleteThisList')}
              buttonContent={t('action.deleteList')}
              onConfirm={onDelete}
              onBack={handleBack}
            />
          );
        case StepTypes.ACTIVITY:
          return (
            <ActivityStep
              title={t('common.activityFor', { name })}
              createdAt={createdAt}
              createdBy={createdBy}
              updatedAt={updatedAt}
              updatedBy={updatedBy}
              memberships={boardMemberships}
              isNotMemberTitle={t('common.noLongerBoardMember')}
              // TODO replace with actual activities
              activities={[]}
              isFetching={false}
              isAllFetched
              onFetch={() => {}}
              onBack={handleBack}
            />
          );
        case StepTypes.LIST_TYPE:
          return <ListTypeStep type={type} wipLimit={wipLimit} autoArchiveDays={autoArchiveDays} onUpdate={onTypeUpdate} onBack={handleBack} />;
        default:
      }
    }

    return (
      <>
        <Button style={ButtonStyle.PopupContext} title={t('action.editName', { context: 'title' })} onClick={handleEditNameClick}>
          <Icon type={IconType.Pencil} size={IconSize.Size13} className={s.icon} />
          {t('action.editName', { context: 'title' })}
        </Button>
        <Button style={ButtonStyle.PopupContext} title={t('common.listType')} onClick={handleListTypeClick}>
          <Icon type={IconType.Sliders} size={IconSize.Size13} className={s.icon} />
          {t('common.listType')}
        </Button>
        <Button style={ButtonStyle.PopupContext} title={t('common.checkActivity', { context: 'title' })} onClick={handleActivityClick}>
          <Icon type={IconType.Activity} size={IconSize.Size13} className={s.icon} />
          {t('common.checkActivity', { context: 'title' })}
        </Button>
        <Button style={ButtonStyle.PopupContext} title={t('action.addCard', { context: 'title' })} onClick={handleAddCardClick}>
          <Icon type={IconType.Plus} size={IconSize.Size13} className={s.icon} />
          {t('action.addCard', { context: 'title' })}
        </Button>
        <Button style={ButtonStyle.PopupContext} title={t(isAllCardsSelected ? 'common.deselectAllCardsInList' : 'common.selectAllCardsInList')} onClick={handleSelectAllClick} disabled={cardsCount === 0}>
          <Icon type={IconType.Check} size={IconSize.Size13} className={s.icon} />
          {t(isAllCardsSelected ? 'common.deselectAllCardsInList' : 'common.selectAllCardsInList')}
        </Button>
        <Popup.Separator />
        <Button style={ButtonStyle.PopupContext} title={t('common.archiveAllCards', { context: 'title' })} onClick={handleArchiveAllClick} disabled={cardsCount === 0}>
          <Icon type={IconType.Archive} size={IconSize.Size13} className={s.icon} />
          {t('common.archiveAllCards', { context: 'title' })}
        </Button>
        <Popup.Separator />
        <Button style={ButtonStyle.PopupContext} title={t('action.deleteList', { context: 'title' })} onClick={handleDeleteClick}>
          <Icon type={IconType.Trash} size={IconSize.Size13} className={s.icon} />
          {t('action.deleteList', { context: 'title' })}
        </Button>
      </>
    );
  },
);

ActionsStep.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf(LIST_TYPES).isRequired,
  wipLimit: PropTypes.number,
  autoArchiveDays: PropTypes.number,
  createdAt: PropTypes.instanceOf(Date),
  createdBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.instanceOf(Date),
  updatedBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  cardsCount: PropTypes.number,
  isAllCardsSelected: PropTypes.bool,
  onNameEdit: PropTypes.func.isRequired,
  onCardAdd: PropTypes.func.isRequired,
  onSelectAllToggle: PropTypes.func.isRequired,
  onArchiveAll: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onTypeUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

ActionsStep.defaultProps = {
  cardsCount: 0,
  isAllCardsSelected: false,
  wipLimit: undefined,
  autoArchiveDays: undefined,
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
};

export default withPopup(ActionsStep);
