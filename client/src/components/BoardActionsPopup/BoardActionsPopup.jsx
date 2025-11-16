import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useSteps } from '../../hooks';
import { ActivityStep } from '../ActivityPopup';
import { ConnectionsStep } from '../ConnectionsPopup';
import DeleteStep from '../DeleteStep';
import ExportStep from '../ExportStep';
import MailListStep from '../Mail/MailListStep';
import MailStep from '../Mail/MailStep';
import RenameStep from '../RenameStep';
import { Button, ButtonStyle, Icon, IconType, IconSize, Popup, withPopup } from '../Utils';

import * as s from './BoardActionsPopup.module.scss';

const StepTypes = {
  RENAME: 'RENAME',
  GITHUB: 'GITHUB',
  EXPORT: 'EXPORT',
  DELETE: 'DELETE',
  ACTIVITY: 'ACTIVITY',
  MAIL: 'MAIL',
  MAIL_LIST: 'MAIL_LIST',
};

const BoardActionsStep = React.memo(
  ({
    defaultDataRename,
    defaultDataGithub,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    memberships,
    boardId,
    mailId,
    mailCountForBoardId,
    mailsForBoard,
    onUpdate,
    onExport,
    onDelete,
    onMailCreate,
    onMailUpdate,
    onMailCopy,
    onMailDelete,
    onClose,
  }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();

    const handleExportClick = useCallback(() => {
      openStep(StepTypes.EXPORT);
    }, [openStep]);

    const handleActivityClick = useCallback(() => {
      openStep(StepTypes.ACTIVITY);
    }, [openStep]);

    const handleMailOptionsClick = useCallback(() => {
      openStep(StepTypes.MAIL);
    }, [openStep]);

    const handleMailListOptionsClick = useCallback(() => {
      openStep(StepTypes.MAIL_LIST);
    }, [openStep]);

    if (step) {
      switch (step.type) {
        case StepTypes.RENAME:
          return (
            <RenameStep
              title={t('common.renameBoard', { context: 'title' })}
              defaultData={defaultDataRename}
              placeholder={t('common.enterBoardName')}
              onUpdate={onUpdate}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        case StepTypes.GITHUB:
          return <ConnectionsStep defaultData={defaultDataGithub} onUpdate={onUpdate} onBack={handleBack} onClose={onClose} />;
        case StepTypes.EXPORT:
          return <ExportStep title={t('common.exportBoard', { context: 'title' })} onExport={onExport} onBack={handleBack} onClose={onClose} />;
        case StepTypes.DELETE:
          return (
            <DeleteStep
              title={t('common.deleteBoard', { context: 'title' })}
              content={t('common.areYouSureYouWantToDeleteThisBoard')}
              buttonContent={t('common.deleteBoard', { context: 'title' })}
              onConfirm={onDelete}
              onBack={handleBack}
            />
          );
        case StepTypes.ACTIVITY:
          return (
            <ActivityStep
              title={t('common.activityFor', { name: defaultDataRename.name })}
              createdAt={createdAt}
              createdBy={createdBy}
              updatedAt={updatedAt}
              updatedBy={updatedBy}
              memberships={memberships}
              isNotMemberTitle={t('common.noLongerBoardMember')}
              // TODO replace with actual activities
              activities={[]}
              isFetching={false}
              isAllFetched
              onFetch={() => {}}
              onBack={handleBack}
            />
          );
        case StepTypes.MAIL:
          return (
            <MailStep
              mailId={mailId}
              totalMails={mailCountForBoardId}
              contextType="board"
              contextId={boardId}
              onGenerate={onMailCreate}
              onReset={onMailUpdate}
              onCopy={onMailCopy}
              onDelete={onMailDelete}
              onBack={handleBack}
            />
          );
        case StepTypes.MAIL_LIST:
          return <MailListStep title={t('common.mailIds', { context: 'title' })} mails={mailsForBoard} contextType="board" onDelete={onMailDelete} onBack={handleBack} />;
        default:
      }
    }

    return (
      <>
        <Button style={ButtonStyle.PopupContext} title={t('common.renameBoard', { context: 'title' })} onClick={() => openStep(StepTypes.RENAME)}>
          <Icon type={IconType.Pencil} size={IconSize.Size13} className={s.icon} />
          {t('common.renameBoard', { context: 'title' })}
        </Button>
        <Button style={ButtonStyle.PopupContext} title={t('common.connections', { context: 'title' })} onClick={() => openStep(StepTypes.GITHUB)}>
          <Icon type={IconType.Github} size={IconSize.Size13} className={s.icon} />
          {t('common.connections', { context: 'title' })}
        </Button>
        <Button style={ButtonStyle.PopupContext} title={t('common.exportBoard', { context: 'title' })} onClick={handleExportClick}>
          <Icon type={IconType.Board} size={IconSize.Size13} className={s.icon} />
          {t('common.exportBoard', { context: 'title' })}
        </Button>
        <Button style={ButtonStyle.PopupContext} title={t('common.checkActivity', { context: 'title' })} onClick={handleActivityClick}>
          <Icon type={IconType.Activity} size={IconSize.Size13} className={s.icon} />
          {t('common.checkActivity', { context: 'title' })}
        </Button>
        <Button style={ButtonStyle.PopupContext} title={t('common.mailSettings', { context: 'title' })} onClick={handleMailOptionsClick}>
          {t('common.mailSettings', { context: 'title' })}
        </Button>
        <Button style={ButtonStyle.PopupContext} title={t('common.mailIds')} onClick={handleMailListOptionsClick}>
          {t('common.mailIds')}
        </Button>
        <Popup.Separator />
        <Button style={ButtonStyle.PopupContext} title={t('common.deleteBoard', { context: 'title' })} onClick={() => openStep(StepTypes.DELETE)}>
          <Icon type={IconType.Trash} size={IconSize.Size13} className={s.icon} />
          {t('common.deleteBoard', { context: 'title' })}
        </Button>
      </>
    );
  },
);

BoardActionsStep.propTypes = {
  defaultDataRename: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  defaultDataGithub: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  createdAt: PropTypes.instanceOf(Date),
  createdBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.instanceOf(Date),
  updatedBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  memberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardId: PropTypes.string.isRequired,
  mailId: PropTypes.string,
  mailCountForBoardId: PropTypes.number.isRequired,
  mailsForBoard: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onMailCreate: PropTypes.func.isRequired,
  onMailUpdate: PropTypes.func.isRequired,
  onMailCopy: PropTypes.func.isRequired,
  onMailDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

BoardActionsStep.defaultProps = {
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
  mailId: null,
};

export default withPopup(BoardActionsStep);
