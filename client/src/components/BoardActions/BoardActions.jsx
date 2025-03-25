import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import classNames from 'classnames';
import pick from 'lodash/pick';
import PropTypes from 'prop-types';

import Paths from '../../constants/Paths';
import CardSearch from '../CardSearch';
import MembershipPermissionsSelectStep from '../MembershipPermissionsSelectStep';
import Memberships from '../Memberships';
import { Icon, IconType, IconSize, Button, ButtonStyle } from '../Utils';
import Connections from './Connections';
import Filters from './Filters';

import * as gs from '../../global.module.scss';
import * as s from './BoardActions.module.scss';

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
    isProjectManager,
    boardData,
    boardSearchParams,
    viewMode,
    onViewModeChange,
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
    onBoardSearchParamsUpdate,
  }) => {
    const [t] = useTranslation();

    const handleConnectionsUpdate = useCallback(
      (data) => {
        onBoardUpdate(boardData.id, data);
      },
      [boardData.id, onBoardUpdate],
    );

    return (
      <div className={classNames(s.wrapper, gs.scrollableX)}>
        <div className={s.githubAction}>
          <Connections defaultData={pick(boardData, ['isGithubConnected', 'githubRepo'])} onUpdate={handleConnectionsUpdate} offset={16}>
            <Icon
              type={IconType.Github}
              size={IconSize.Size14}
              className={classNames(boardData.isGithubConnected ? s.githubGreen : s.githubGrey)}
              title={boardData.isGithubConnected ? t('common.connectedToGithub', { repo: boardData.githubRepo }) : t('common.notConnectedToGithub')}
            />
          </Connections>
        </div>
        <div title={boardData.name} className={classNames(s.title, s.action)}>
          {boardData.name}
        </div>
        <div className={classNames(s.cardsCount, s.action)}>{isFiltered ? `${filteredCardCount} ${t('common.ofCards', { count: cardCount })}` : `${t('common.cards', { count: cardCount })}`}</div>
        <div className={s.action}>
          <Memberships
            items={memberships}
            allUsers={allUsers}
            permissionsSelectStep={MembershipPermissionsSelectStep}
            canEdit={isProjectManager}
            onCreate={onMembershipCreate}
            onUpdate={onMembershipUpdate}
            onDelete={onMembershipDelete}
          />
        </div>
        <div className={s.action}>
          <CardSearch defaultValue={boardSearchParams.query} matchCase={boardSearchParams.matchCase} anyMatch={boardSearchParams.anyMatch} onBoardSearchParamsUpdate={onBoardSearchParamsUpdate} />
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
        <div className={s.action}>
          <Button style={ButtonStyle.IconBase} title={t('common.switchToBoardView')} onClick={() => onViewModeChange('board')} className={classNames(s.switchViewButton, viewMode === 'board' && s.active)}>
            <Icon type={IconType.Board} size={IconSize.Size18} />
          </Button>
          <Button style={ButtonStyle.IconBase} title={t('common.switchToListView')} onClick={() => onViewModeChange('list')} className={classNames(s.switchViewButton, viewMode === 'list' && s.active)}>
            <Icon type={IconType.List} size={IconSize.Size18} />
          </Button>
        </div>
        {isProjectManager && (
          <div className={classNames(s.action, s.actionRightFirst)}>
            <Link to={Paths.SETTINGS_PROJECT.replace(':id', projectId)}>
              <Button style={ButtonStyle.Icon} title={t('common.projectSettings')}>
                <Icon type={IconType.ProjectSettings} size={IconSize.Size18} />
              </Button>
            </Link>
          </div>
        )}
        <div className={classNames(s.action, s.actionRightLast, !isProjectManager && s.actionRightFirst)}>
          <Link to={Paths.PROJECTS.replace(':id', projectId)}>
            <Button style={ButtonStyle.Icon} title={t('common.backToProject')}>
              <Icon type={IconType.ArrowLeftBig} size={IconSize.Size18} />
            </Button>
          </Link>
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
  isProjectManager: PropTypes.bool.isRequired,
  boardData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  boardSearchParams: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  viewMode: PropTypes.string.isRequired,
  onViewModeChange: PropTypes.func.isRequired,
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
  onBoardSearchParamsUpdate: PropTypes.func.isRequired,
};

export default BoardActions;
