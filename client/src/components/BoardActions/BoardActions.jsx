import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import pick from 'lodash/pick';
import Filters from './Filters';
import Memberships from '../Memberships';
import BoardMembershipPermissionsSelectStep from '../BoardMembershipPermissionsSelectStep';
import Connections from './Connections';
import { Icon, IconType, IconSize } from '../Utils';

import styles from './BoardActions.module.scss';
import gStyles from '../../globalStyles.module.scss';

const BoardActions = React.memo(
  ({
    cardCount,
    memberships,
    labels,
    filterUsers,
    filterLabels,
    allUsers,
    canEdit,
    canEditMemberships,
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
      <div className={styles.wrapperContainer}>
        <div className={classNames(styles.wrapper, gStyles.scrollableX)}>
          <div className={styles.actions}>
            <div className={classNames(styles.cardsCount, styles.action)}>
              {cardCount} {[cardCount !== 1 ? t('common.cards') : t('common.card')]}
            </div>
            <div className={styles.action}>
              <Memberships
                items={memberships}
                allUsers={allUsers}
                permissionsSelectStep={BoardMembershipPermissionsSelectStep}
                canEdit={canEditMemberships}
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
            <div className={styles.connectionsWrapper}>
              <Connections defaultData={pick(boardData, ['isGithubConnected', 'githubRepo'])} onUpdate={handleConnectionsUpdate} offset={16}>
                <Icon
                  type={IconType.Github}
                  size={IconSize.Size14}
                  className={classNames(boardData.isGithubConnected ? styles.githubGreen : styles.githubGrey)}
                  title={boardData.isGithubConnected ? t('common.connectedToGithub') : t('common.notConnectedToGithub')}
                />
              </Connections>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

BoardActions.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  cardCount: PropTypes.number.isRequired,
  memberships: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  filterUsers: PropTypes.array.isRequired,
  filterLabels: PropTypes.array.isRequired,
  allUsers: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  canEdit: PropTypes.bool.isRequired,
  canEditMemberships: PropTypes.bool.isRequired,
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
