import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import pick from 'lodash/pick';
import { Link } from 'react-router-dom';
import Filters from './Filters';
import Memberships from '../Memberships';
import BoardMembershipPermissionsSelectStep from '../BoardMembershipPermissionsSelectStep';
import Connections from './Connections';
import { Icon, IconType, IconSize, Button, ButtonStyle } from '../Utils';
import Paths from '../../constants/Paths';

import styles from './BoardActions.module.scss';
import gStyles from '../../globalStyles.module.scss';

const BoardActions = React.memo(
  ({
    projectId,
    cardCount,
    isFiltered,
    filteredCardCount,
    memberships,
    labels,
    filterUsers,
    filterLabels,
    allUsers,
    canEdit,
    isCurrentUserManager,
    boardData,
    onMembershipCreate,
    onMembershipUpdate,
    onMembershipDelete,
    onUserToFilterAdd,
    onUserFromFilterRemove,
    onLabelToFilterAdd,
    onLabelFromFilterRemove,
    onLabelCreate,
    onLabelUpdate,
    onLabelMove,
    onLabelDelete,
    onBoardUpdate,
  }) => {
    const [t] = useTranslation();

    const handleConnectionsUpdate = useCallback(
      (data) => {
        onBoardUpdate(boardData.id, data);
      },
      [boardData.id, onBoardUpdate],
    );

    return (
      <div className={styles.wrapper}>
        <div className={classNames(styles.actions, gStyles.scrollableX)}>
          <div title={boardData.name} className={classNames(styles.title, styles.action)}>
            {boardData.name}
          </div>
          <div className={classNames(styles.cardsCount, styles.action)}>
            {isFiltered ? `${filteredCardCount} ${t('common.ofCards', { count: cardCount })}` : `${t('common.cards', { count: cardCount })}`}
          </div>
          <div className={styles.action}>
            <Memberships
              items={memberships}
              allUsers={allUsers}
              permissionsSelectStep={BoardMembershipPermissionsSelectStep}
              canEdit={isCurrentUserManager}
              onCreate={onMembershipCreate}
              onUpdate={onMembershipUpdate}
              onDelete={onMembershipDelete}
            />
          </div>
          <div className={styles.action}>
            <Filters
              users={filterUsers}
              labels={filterLabels}
              allBoardMemberships={memberships}
              allLabels={labels}
              canEdit={canEdit}
              onUserAdd={onUserToFilterAdd}
              onUserRemove={onUserFromFilterRemove}
              onLabelAdd={onLabelToFilterAdd}
              onLabelRemove={onLabelFromFilterRemove}
              onLabelCreate={onLabelCreate}
              onLabelUpdate={onLabelUpdate}
              onLabelMove={onLabelMove}
              onLabelDelete={onLabelDelete}
            />
          </div>
          <div className={styles.action}>
            <Connections defaultData={pick(boardData, ['isGithubConnected', 'githubRepo'])} onUpdate={handleConnectionsUpdate} offset={16}>
              <Icon
                type={IconType.Github}
                size={IconSize.Size14}
                className={classNames(boardData.isGithubConnected ? styles.githubGreen : styles.githubGrey)}
                title={boardData.isGithubConnected ? t('common.connectedToGithub') : t('common.notConnectedToGithub')}
              />
            </Connections>
          </div>
          {isCurrentUserManager && (
            <div className={classNames(styles.action, styles.actionRightFirst)}>
              <Link to={Paths.SETTINGS_PROJECT.replace(':id', projectId)}>
                <Button style={ButtonStyle.Icon} title={t('common.projectSettings')}>
                  <Icon type={IconType.ProjectSettings} size={IconSize.Size18} />
                </Button>
              </Link>
            </div>
          )}
          <div className={classNames(styles.action, styles.actionRightLast, !isCurrentUserManager && styles.actionRightFirst)}>
            <Link to={Paths.PROJECTS.replace(':id', projectId)}>
              <Button style={ButtonStyle.Icon} title={t('common.backToProject')}>
                <Icon type={IconType.ArrowLeftBig} size={IconSize.Size18} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  },
);

BoardActions.propTypes = {
  projectId: PropTypes.string.isRequired,
  /* eslint-disable react/forbid-prop-types */
  cardCount: PropTypes.number.isRequired,
  isFiltered: PropTypes.bool.isRequired,
  filteredCardCount: PropTypes.number.isRequired,
  memberships: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  filterUsers: PropTypes.array.isRequired,
  filterLabels: PropTypes.array.isRequired,
  allUsers: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  canEdit: PropTypes.bool.isRequired,
  isCurrentUserManager: PropTypes.bool.isRequired,
  boardData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onMembershipCreate: PropTypes.func.isRequired,
  onMembershipUpdate: PropTypes.func.isRequired,
  onMembershipDelete: PropTypes.func.isRequired,
  onUserToFilterAdd: PropTypes.func.isRequired,
  onUserFromFilterRemove: PropTypes.func.isRequired,
  onLabelToFilterAdd: PropTypes.func.isRequired,
  onLabelFromFilterRemove: PropTypes.func.isRequired,
  onLabelCreate: PropTypes.func.isRequired,
  onLabelUpdate: PropTypes.func.isRequired,
  onLabelMove: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
  onBoardUpdate: PropTypes.func.isRequired,
};

export default BoardActions;
