import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import ProjectNavContainer from '../../../containers/Project/ProjectNavContainer';
import { DeleteStepPopup } from '../../DeleteStep';
import { Button, ButtonStyle, Checkbox, Dropdown, DropdownStyle, Icon, IconType, IconSize } from '../../Utils';
import AddProjectMemberStep from './AddProjectMemberStep';

import * as gs from '../../../global.module.scss';
import * as s from './ProjectMembers.module.scss';

const ROLE_OPTIONS = [
  { id: 'editor', name: 'Editor' },
  { id: 'viewer', name: 'Viewer' },
];

const ProjectMembers = React.memo(
  ({
    projectId,
    items,
    isFetching,
    allUsers,
    isAdmin,
    onFetch,
    onAddMember,
    onRemoveMember,
    onUpdateMember,
    onAddManager,
    onRemoveManager,
    onAddBoardMembership,
    onUpdateBoardMembership,
    onRemoveBoardMembership,
  }) => {
    const [t] = useTranslation();

    useEffect(() => {
      onFetch(projectId);
    }, [onFetch, projectId]);

    const refetchSoon = useCallback(() => {
      setTimeout(() => onFetch(projectId), 400);
    }, [onFetch, projectId]);

    const boards = items[0]?.boards.map(({ boardId, boardName }) => ({ boardId, boardName })) || [];

    const availableUsers = allUsers.filter((user) => !items.some((item) => item.userId === user.id));

    const handleAddMember = useCallback(
      (userId) => {
        onAddMember(projectId, userId);
        refetchSoon();
      },
      [onAddMember, projectId, refetchSoon],
    );

    const handleRemove = useCallback(
      (item) => {
        if (item.role === 'manager') {
          onRemoveManager(item.projectManagerId);
        } else {
          onRemoveMember(item.projectMembershipId);
        }
        refetchSoon();
      },
      [onRemoveManager, onRemoveMember, refetchSoon],
    );

    const handleMakeManager = useCallback(
      (item) => {
        onAddManager(projectId, item.userId);
        refetchSoon();
      },
      [onAddManager, projectId, refetchSoon],
    );

    const handleRemoveManager = useCallback(
      (item) => {
        onRemoveManager(item.projectManagerId);
        refetchSoon();
      },
      [onRemoveManager, refetchSoon],
    );

    const handleToggleFlag = useCallback(
      (item, field) => {
        onUpdateMember(item.projectMembershipId, { [field]: !item[field] });
        refetchSoon();
      },
      [onUpdateMember, refetchSoon],
    );

    const handleToggleBoard = useCallback(
      (item, board) => {
        if (board.boardMembershipId) {
          onRemoveBoardMembership(board.boardMembershipId);
        } else {
          onAddBoardMembership(board.boardId, item.userId);
        }
        refetchSoon();
      },
      [onAddBoardMembership, onRemoveBoardMembership, refetchSoon],
    );

    const handleBoardRoleChange = useCallback(
      (board, role) => {
        onUpdateBoardMembership(board.boardMembershipId, { role });
        refetchSoon();
      },
      [onUpdateBoardMembership, refetchSoon],
    );

    return (
      <div className={s.wrapper}>
        <ProjectNavContainer />
        <div className={s.content}>
          <div className={s.header}>
            <h2 className={s.headerText}>
              {t('common.members')} <span className={s.headerTextDetails}>({items.length})</span>
            </h2>
            <AddProjectMemberStep users={availableUsers} onSelect={handleAddMember} offset={5} position="bottom-end">
              <Button style={ButtonStyle.DefaultBorder} content={t('action.addMember')} />
            </AddProjectMemberStep>
          </div>
          {isFetching && items.length === 0 ? (
            <div className={s.empty}>{t('common.loading')}</div>
          ) : (
            <div className={clsx(s.tableWrapper, gs.scrollableX)}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th className={s.stickyCol}>{t('common.name')}</th>
                    <th>{t('common.managers')}</th>
                    <th>{t('common.canEditWiki')}</th>
                    <th>{t('common.canManageDocuments')}</th>
                    {boards.map((board) => (
                      <th key={board.boardId}>{board.boardName}</th>
                    ))}
                    <th aria-label={t('action.remove')} />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.userId}>
                      <td className={s.stickyCol}>
                        <div className={s.userName}>{item.name}</div>
                        <div className={s.userEmail}>{item.email}</div>
                      </td>
                      <td className={s.centeredCell}>
                        {isAdmin ? (
                          <Checkbox
                            checked={item.role === 'manager'}
                            aria-label={t('common.toggleProjectManager')}
                            title={t('common.toggleProjectManager')}
                            onChange={() => (item.role === 'manager' ? handleRemoveManager(item) : handleMakeManager(item))}
                          />
                        ) : (
                          <span className={s.roleText}>{item.role === 'manager' ? t('common.managers') : '—'}</span>
                        )}
                      </td>
                      <td className={s.centeredCell}>{item.role === 'member' && <Checkbox checked={item.canEditWiki} onChange={() => handleToggleFlag(item, 'canEditWiki')} />}</td>
                      <td className={s.centeredCell}>{item.role === 'member' && <Checkbox checked={item.canManageDocuments} onChange={() => handleToggleFlag(item, 'canManageDocuments')} />}</td>
                      {item.boards.map((board) => (
                        <td key={board.boardId} className={s.boardCell}>
                          <Checkbox checked={!!board.boardMembershipId} onChange={() => handleToggleBoard(item, board)} />
                          {board.boardMembershipId && (
                            <Dropdown
                              style={DropdownStyle.FullWidth}
                              options={ROLE_OPTIONS}
                              defaultItem={ROLE_OPTIONS.find((option) => option.id === board.role)}
                              placeholder={board.role}
                              onChange={(option) => handleBoardRoleChange(board, option.id)}
                              className={s.roleDropdown}
                            />
                          )}
                        </td>
                      ))}
                      <td className={s.centeredCell}>
                        <DeleteStepPopup
                          title={t('common.removeMember_title')}
                          content={t('common.removeMemberContent')}
                          buttonContent={t('action.remove')}
                          onConfirm={() => handleRemove(item)}
                          offset={5}
                          position="bottom-end"
                        >
                          <Button style={ButtonStyle.Icon} title={t('common.removeMember_title')} className={s.removeButton}>
                            <Icon type={IconType.Trash} size={IconSize.Size13} />
                          </Button>
                        </DeleteStepPopup>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  },
);

ProjectMembers.propTypes = {
  projectId: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isFetching: PropTypes.bool.isRequired,
  allUsers: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isAdmin: PropTypes.bool.isRequired,
  onFetch: PropTypes.func.isRequired,
  onAddMember: PropTypes.func.isRequired,
  onRemoveMember: PropTypes.func.isRequired,
  onUpdateMember: PropTypes.func.isRequired,
  onAddManager: PropTypes.func.isRequired,
  onRemoveManager: PropTypes.func.isRequired,
  onAddBoardMembership: PropTypes.func.isRequired,
  onUpdateBoardMembership: PropTypes.func.isRequired,
  onRemoveBoardMembership: PropTypes.func.isRequired,
};

export default ProjectMembers;
