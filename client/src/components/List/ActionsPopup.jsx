import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux'; // test mail button
import PropTypes from 'prop-types';

import { useSteps } from '../../hooks';
import selectors from '../../selectors'; // test mail button
import { ActivityStep } from '../ActivityPopup';
import DeleteStep from '../DeleteStep';
import { Button, ButtonStyle, Icon, IconType, IconSize, Popup, withPopup } from '../Utils';

import * as s from './ActionsPopup.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
  ACTIVITY: 'ACTIVITY',
};

const ActionsStep = React.memo(
  ({
    name,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    boardMemberships,
    activities,
    isActivitiesFetching,
    isAllActivitiesFetched,
    lastActivityId,
    onNameEdit,
    onCardAdd,
    onDelete,
    onActivitiesFetch,
    onMailCreate,
    onClose,
    onMailCreate
  }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();

  /* test mail button */
  const listId = '1626398009086444718';

  const testMail = useSelector((state) => {
    try {
      return selectors.selectMailForCurrentUserByListId(state, listId);
    } catch (e) {
      console.warn('Mail selector error:', e);
      return null;
    }
  });
  /* test mail button */

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

  const handleMailClick = useCallback(() => {
    onMailCreate();
  }, [onMailCreate]);

    if (step) {
      switch (step.type) {
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
              activities={activities}
              isFetching={isActivitiesFetching}
              isAllFetched={isAllActivitiesFetched}
              lastActivityId={lastActivityId}
              hideListDetails
              onFetch={onActivitiesFetch}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        default:
      }
    }

    return (
      <>
        <Button style={ButtonStyle.PopupContext} title={t('action.editName', { context: 'title' })} onClick={handleEditNameClick}>
          <Icon type={IconType.Pencil} size={IconSize.Size13} className={s.icon} />
          {t('action.editName', { context: 'title' })}
        </Button>
        <Button style={ButtonStyle.PopupContext} title={t('common.checkActivity', { context: 'title' })} onClick={handleActivityClick}>
          <Icon type={IconType.Activity} size={IconSize.Size13} className={s.icon} />
          {t('common.checkActivity', { context: 'title' })}
        </Button>
        <Button style={ButtonStyle.PopupContext} title={t('action.addCard', { context: 'title' })} onClick={handleAddCardClick}>
          <Icon type={IconType.Plus} size={IconSize.Size13} className={s.icon} />
          {t('action.addCard', { context: 'title' })}
        </Button>
      <Button style={ButtonStyle.PopupContext} title={t('action.generateMailId', { context: 'title' })} onClick={handleMailClick}>
        {t('action.generateMailId', { context: 'title' })}
      </Button>
      {/* test mail button */}
      <Button
        style={ButtonStyle.PopupContext}
        title="Test Mail Selector"
        onClick={() => {
          console.log('Test mail selector for listId', listId, ':', testMail);
        }}
      >
        Test Mail
      </Button>
      {/* test mail button */}
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
  createdAt: PropTypes.instanceOf(Date),
  createdBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.instanceOf(Date),
  updatedBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  activities: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isActivitiesFetching: PropTypes.bool.isRequired,
  isAllActivitiesFetched: PropTypes.bool.isRequired,
  lastActivityId: PropTypes.string,
  onNameEdit: PropTypes.func.isRequired,
  onCardAdd: PropTypes.func.isRequired,
  onMailCreate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onActivitiesFetch: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

ActionsStep.defaultProps = {
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
  lastActivityId: undefined,
};

export default withPopup(ActionsStep);
