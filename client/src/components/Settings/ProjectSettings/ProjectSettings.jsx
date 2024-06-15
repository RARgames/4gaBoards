import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import InformationEdit from './InformationEdit';
import BackgroundPane from './BackgroundPane';
import DeletePopup from '../../DeletePopup';
import { Button, ButtonStyle } from '../../Utils';
import Memberships from '../../Memberships';
import Paths from '../../../constants/Paths';

import styles from './ProjectSettings.module.scss';
import sShared from '../SettingsShared.module.scss';
import gStyles from '../../../globalStyles.module.scss';

const ProjectSettings = React.memo(
  ({ projectId, project, name, background, backgroundImage, isBackgroundImageUpdating, managers, allUsers, onUpdate, onBackgroundImageUpdate, onDelete, onManagerCreate, onManagerDelete }) => {
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
          <div className={styles.headerButtonOffset} />
          <h2 className={sShared.headerText}>{t('common.projectSettings')}</h2>
          <div className={styles.headerButton}>
            <Link to={project.firstBoardId ? Paths.BOARDS.replace(':id', project.firstBoardId) : Paths.PROJECTS.replace(':id', projectId)}>
              <Button style={ButtonStyle.Submit} type="button" content={t('action.backToProject')} />
            </Link>
          </div>
          <div className={styles.projectName}>{name}</div>
        </div>
        <div className={sShared.contentWrapper}>
          <div className={styles.actionsWrapper}>
            <div className={styles.action}>
              <InformationEdit
                defaultData={{ name }}
                onUpdate={(data) => {
                  onUpdate(projectId, data);
                }}
              />
              <div className={styles.text}>{t('common.managers')}</div>
              <Memberships
                items={managers}
                allUsers={allUsers}
                addTitle="common.addManager"
                leaveButtonContent="action.leaveProject"
                leaveConfirmationTitle="common.leaveProject"
                leaveConfirmationContent="common.areYouSureYouWantToLeaveProject"
                leaveConfirmationButtonContent="action.leaveProject"
                deleteButtonContent="action.removeFromProject"
                deleteConfirmationTitle="common.removeManager"
                deleteConfirmationContent="common.areYouSureYouWantToRemoveThisManagerFromProject"
                deleteConfirmationButtonContent="action.removeManager"
                canLeaveIfLast={false}
                onCreate={(data) => {
                  onManagerCreate(projectId, data);
                }}
                onDelete={onManagerDelete}
              />
            </div>
            <div className={styles.action}>
              <div className={styles.text}>{t('common.background')}</div>
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
            <div className={styles.action}>
              <h4 className={styles.dangerZone}>{t('common.dangerZone', { context: 'title' })}</h4>
              <DeletePopup
                title={t('common.deleteProject', { context: 'title' })}
                content={t('common.areYouSureYouWantToDeleteThisProject')}
                buttonContent={t('action.deleteProject')}
                onConfirm={() => {
                  onDelete(projectId);
                }}
              >
                <div className={gStyles.controlsCenter}>
                  <Button style={ButtonStyle.Cancel} content={t('action.deleteProject', { context: 'title' })} />
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
  project: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  name: PropTypes.string.isRequired,
  /* eslint-disable react/forbid-prop-types */
  background: PropTypes.object,
  backgroundImage: PropTypes.object,
  /* eslint-enable react/forbid-prop-types */
  isBackgroundImageUpdating: PropTypes.bool.isRequired,
  /* eslint-disable react/forbid-prop-types */
  managers: PropTypes.array.isRequired,
  allUsers: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  onUpdate: PropTypes.func.isRequired,
  onBackgroundImageUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onManagerCreate: PropTypes.func.isRequired,
  onManagerDelete: PropTypes.func.isRequired,
};

ProjectSettings.defaultProps = {
  background: undefined,
  backgroundImage: undefined,
};

export default ProjectSettings;
