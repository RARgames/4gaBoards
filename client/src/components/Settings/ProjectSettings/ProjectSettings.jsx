import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import PropTypes from 'prop-types';

import Paths from '../../../constants/Paths';
import DeletePopup from '../../DeletePopup';
import Memberships from '../../Memberships';
import { Button, ButtonVariant, Icon, IconType, IconSize } from '../../Utils';
import BackgroundPane from './BackgroundPane';
import InformationEdit from './InformationEdit';

import * as gs from '../../../global.module.scss';
import * as sShared from '../SettingsShared.module.scss';
import * as s from './ProjectSettings.module.scss';

const ProjectSettings = React.memo(
  ({
    projectId,
    name,
    background,
    backgroundImage,
    isBackgroundImageUpdating,
    managers,
    allUsers,
    isManager,
    onUpdate,
    onBackgroundImageUpdate,
    onDelete,
    onManagerCreate,
    onManagerDelete,
    onUserEmailLookup,
  }) => {
    const [t] = useTranslation();

    const handleBackgroundUpdate = useCallback(
      (newBackground) => {
        onUpdate(projectId, { background: newBackground });
      },
      [onUpdate, projectId],
    );

    const handleBackgroundImageDelete = useCallback(() => {
      onUpdate(projectId, { backgroundImage: null });
    }, [onUpdate, projectId]);

    return (
      <div className={sShared.wrapper}>
        <div className={sShared.header}>
          <div className={s.headerButtonOffset} />
          <h2 className={sShared.headerText}>{t('common.projectSettings')}</h2>
          <div className={s.headerButton}>
            <Link to={Paths.PROJECTS.replace(':id', projectId)}>
              <Button variant={ButtonVariant.Icon} title={t('common.backToProject')}>
                <Icon type={IconType.ArrowLeftBig} size={IconSize.Size18} />
              </Button>
            </Link>
          </div>
        </div>
        <div className={s.projectName}>{name}</div>
        <div>
          <div className={s.actionsWrapper}>
            <div className={s.action}>
              <InformationEdit
                defaultData={{ name }}
                onUpdate={(data) => {
                  onUpdate(projectId, data);
                }}
              />
              <div className={s.text}>{t('common.managers')}</div>
              <Memberships
                items={managers}
                allUsers={allUsers}
                addTitle="common.addManager"
                leaveButtonContent="common.leaveProject"
                leaveConfirmationTitle="common.leaveProject"
                leaveConfirmationContent="common.areYouSureYouWantToLeaveProject"
                leaveConfirmationButtonContent="common.leaveProject"
                deleteButtonContent="common.removeFromProject"
                deleteConfirmationTitle="common.removeManager"
                deleteConfirmationContent="common.areYouSureYouWantToRemoveThisManagerFromProject"
                deleteConfirmationButtonContent="common.removeManager"
                canLeaveIfLast={false}
                canEdit={isManager}
                onCreate={(data) => {
                  onManagerCreate(projectId, data);
                }}
                onDelete={onManagerDelete}
                onUserEmailLookup={onUserEmailLookup}
              />
            </div>
            <div className={s.action}>
              <div className={s.text}>{t('common.background')}</div>
              <BackgroundPane
                item={background}
                imageCoverUrl={backgroundImage && backgroundImage.coverUrl}
                isImageUpdating={isBackgroundImageUpdating}
                onUpdate={handleBackgroundUpdate}
                onImageUpdate={(data) => {
                  onBackgroundImageUpdate(projectId, data);
                }}
                onImageDelete={handleBackgroundImageDelete}
              />
            </div>
            <div className={s.action}>
              <h4 className={s.dangerZone}>{t('common.dangerZone', { context: 'title' })}</h4>
              <DeletePopup
                title={t('common.deleteProject', { context: 'title' })}
                content={t('common.areYouSureYouWantToDeleteThisProject')}
                buttonContent={t('common.deleteProject')}
                onConfirm={() => {
                  onDelete(projectId);
                }}
              >
                <div className={gs.controlsCenter}>
                  <Button variant={ButtonVariant.Cancel} content={t('common.deleteProject', { context: 'title' })} />
                </div>
              </DeletePopup>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

ProjectSettings.propTypes = {
  projectId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  background: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  backgroundImage: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  isBackgroundImageUpdating: PropTypes.bool.isRequired,
  managers: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allUsers: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isManager: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onBackgroundImageUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onManagerCreate: PropTypes.func.isRequired,
  onManagerDelete: PropTypes.func.isRequired,
  onUserEmailLookup: PropTypes.func.isRequired,
};

ProjectSettings.defaultProps = {
  background: undefined,
  backgroundImage: undefined,
};

export default ProjectSettings;
