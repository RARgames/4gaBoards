import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { DeleteStepPopup } from '../../DeleteStep';
import { Button, ButtonStyle, Checkbox, Dropdown, DropdownStyle, Icon, IconType, IconSize, Input, InputStyle, Table } from '../../Utils';
import AddToProjectStep from './AddToProjectStep';

import * as gs from '../../../global.module.scss';
import * as sShared from '../SettingsShared.module.scss';
import * as s from './MembersSettings.module.scss';

const ROLE_OPTIONS = [
  { id: 'editor', name: 'Editor' },
  { id: 'viewer', name: 'Viewer' },
];

const MembersSettings = React.memo(
  ({ items, isFetching, onFetch, onAddMembership, onAddManager, onRemoveMembership, onRemoveManager, onUpdateMembership, onAddBoardMembership, onUpdateBoardMembership, onRemoveBoardMembership }) => {
    const [t] = useTranslation();
    const [search, setSearch] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [viewMode, setViewMode] = useState('list');

    useEffect(() => {
      onFetch();
    }, [onFetch]);

    const refetchSoon = useCallback(() => {
      setTimeout(() => onFetch(), 400);
    }, [onFetch]);

    const cleanSearch = search.trim().toLowerCase();
    const filteredItems = useMemo(() => items.filter((item) => !cleanSearch || item.name.toLowerCase().includes(cleanSearch) || item.email.toLowerCase().includes(cleanSearch)), [items, cleanSearch]);

    const allProjects = useMemo(() => {
      const byId = {};
      items.forEach((item) => {
        item.projects.forEach((project) => {
          byId[project.projectId] = { id: project.projectId, name: project.projectName };
        });
      });
      return Object.values(byId);
    }, [items]);

    const selectedItem = items.find((item) => item.userId === selectedUserId) || null;

    const handleRowClick = useCallback((userId) => {
      setSelectedUserId(userId);
      setViewMode('list');
    }, []);

    const handleAddToProject = useCallback(
      (projectId, asManager) => {
        if (asManager) {
          onAddManager(projectId, selectedUserId);
        } else {
          onAddMembership(projectId, selectedUserId);
        }
        refetchSoon();
      },
      [onAddManager, onAddMembership, selectedUserId, refetchSoon],
    );

    const handleRemoveFromProject = useCallback(
      (project) => {
        if (project.role === 'manager') {
          onRemoveManager(project.projectManagerId);
        } else {
          onRemoveMembership(project.projectMembershipId);
        }
        refetchSoon();
      },
      [onRemoveManager, onRemoveMembership, refetchSoon],
    );

    const handleToggleFlag = useCallback(
      (project, field) => {
        onUpdateMembership(project.projectMembershipId, { [field]: !project[field] });
        refetchSoon();
      },
      [onUpdateMembership, refetchSoon],
    );

    const handleToggleBoard = useCallback(
      (board) => {
        if (board.boardMembershipId) {
          onRemoveBoardMembership(board.boardMembershipId);
        } else {
          onAddBoardMembership(board.boardId, selectedUserId);
        }
        refetchSoon();
      },
      [onAddBoardMembership, onRemoveBoardMembership, selectedUserId, refetchSoon],
    );

    const handleBoardRoleChange = useCallback(
      (board, role) => {
        onUpdateBoardMembership(board.boardMembershipId, { role });
        refetchSoon();
      },
      [onUpdateBoardMembership, refetchSoon],
    );

    const availableProjectsForAdd = selectedItem ? allProjects.filter((project) => !selectedItem.projects.some((p) => p.projectId === project.id)) : [];

    const renderDetail = () => {
      if (!selectedItem) {
        return <div className={s.emptyDetail}>{t('common.selectUserForDetails')}</div>;
      }

      return (
        <div className={s.detail}>
          <div className={s.detailHeader}>
            <div className={s.detailUser}>
              <strong>{selectedItem.name}</strong>
              <span className={s.detailUserEmail}>{selectedItem.email}</span>
            </div>
            {availableProjectsForAdd.length > 0 && (
              <AddToProjectStep projects={availableProjectsForAdd} onSelect={handleAddToProject} offset={5} position="bottom-end">
                <Button style={ButtonStyle.DefaultBorder} content={t('common.addToProject', { context: 'title' })} />
              </AddToProjectStep>
            )}
          </div>
          {selectedItem.projects.length === 0 && <div className={s.emptyDetail}>{t('common.noProjects', { context: 'title' })}</div>}
          {selectedItem.projects.map((project) => (
            <div key={project.projectId} className={s.projectSection}>
              <div className={s.projectSectionHeader}>
                <span className={s.projectName}>{project.projectName}</span>
                <span className={clsx(s.roleChip, project.role === 'manager' && s.roleChipManager)}>{project.role === 'manager' ? t('common.managers') : t('common.members')}</span>
                <DeleteStepPopup
                  title={t('common.removeFromProject', { context: 'title' })}
                  content={t('common.removeFromProjectContent')}
                  buttonContent={t('action.remove')}
                  onConfirm={() => handleRemoveFromProject(project)}
                  offset={5}
                  position="bottom-end"
                >
                  <Button style={ButtonStyle.Icon} title={t('common.removeFromProject', { context: 'title' })} className={s.removeButton}>
                    <Icon type={IconType.Trash} size={IconSize.Size13} />
                  </Button>
                </DeleteStepPopup>
              </div>
              {project.role === 'member' && (
                <div className={s.flagsRow}>
                  <label htmlFor={`canEditWiki-${project.projectMembershipId}`}>
                    <Checkbox id={`canEditWiki-${project.projectMembershipId}`} checked={project.canEditWiki} onChange={() => handleToggleFlag(project, 'canEditWiki')} />
                    {t('common.canEditWiki')}
                  </label>
                  <label htmlFor={`canManageDocuments-${project.projectMembershipId}`}>
                    <Checkbox id={`canManageDocuments-${project.projectMembershipId}`} checked={project.canManageDocuments} onChange={() => handleToggleFlag(project, 'canManageDocuments')} />
                    {t('common.canManageDocuments')}
                  </label>
                </div>
              )}
              <div className={s.boardsGrid}>
                {project.boards.length === 0 && <div className={s.noBoards}>{t('common.noBoardAccess')}</div>}
                {project.boards.map((board) => (
                  <div key={board.boardId} className={s.boardRow}>
                    <label htmlFor={`board-${board.boardId}`} className={s.boardLabel}>
                      <Checkbox id={`board-${board.boardId}`} checked={!!board.boardMembershipId} onChange={() => handleToggleBoard(board)} />
                      {board.boardName}
                    </label>
                    {board.boardMembershipId && (
                      <Dropdown
                        style={DropdownStyle.FullWidth}
                        options={ROLE_OPTIONS}
                        defaultItem={ROLE_OPTIONS.find((option) => option.id === board.role)}
                        placeholder={board.role}
                        onChange={(item) => handleBoardRoleChange(board, item.id)}
                        className={s.roleDropdown}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    };

    const renderMatrix = () => (
      <div className={clsx(s.matrixWrapper, gs.scrollableX)}>
        <table className={s.matrixTable}>
          <thead>
            <tr>
              <th className={s.matrixUserHeader}>{t('common.name')}</th>
              {allProjects.map((project) => (
                <th key={project.id}>{project.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.userId} className={gs.cursorPointer} onClick={() => handleRowClick(item.userId)}>
                <td className={s.matrixUserCell}>{item.name}</td>
                {allProjects.map((project) => {
                  const membership = item.projects.find((p) => p.projectId === project.id);
                  if (!membership) {
                    return (
                      <td key={project.id} className={s.matrixCellEmpty}>
                        —
                      </td>
                    );
                  }
                  const boardCount = membership.boards.filter((board) => board.boardMembershipId).length;
                  return (
                    <td key={project.id} className={s.matrixCell}>
                      {membership.role === 'manager' ? t('common.managers') : `${boardCount}/${membership.boards.length}`}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    const renderList = () => (
      <div className={s.body}>
        <Table.Container className={s.listContainer}>
          <Table.Wrapper className={clsx(gs.scrollableY)}>
            <table className={s.listTable}>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.userId} className={clsx(gs.cursorPointer, item.userId === selectedUserId && s.rowSelected)} onClick={() => handleRowClick(item.userId)}>
                    <td className={s.userCell}>
                      <div className={s.userName}>{item.name}</div>
                      <div className={s.userEmail}>{item.email}</div>
                    </td>
                    <td className={s.summaryCell}>{t('common.projectsCount', { count: item.projects.length })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Table.Wrapper>
        </Table.Container>
        <div className={s.detailPanel}>{renderDetail()}</div>
      </div>
    );

    const renderBody = () => {
      if (isFetching && items.length === 0) {
        return <div className={s.emptyDetail}>{t('common.loading')}</div>;
      }

      return viewMode === 'matrix' ? renderMatrix() : renderList();
    };

    return (
      <div className={clsx(sShared.wrapper, s.wrapper)}>
        <div className={sShared.header}>
          <div className={sShared.headerFlex}>
            <h2 className={sShared.headerText}>
              {t('common.members')} <span className={s.headerTextDetails}>({items.length})</span>
            </h2>
            <div className={s.headerActions}>
              <Input style={InputStyle.Default} value={search} placeholder={t('common.searchUsers')} onChange={(e) => setSearch(e.target.value)} className={s.searchInput} />
              <Button style={ButtonStyle.DefaultBorder} title={t('common.matrixView')} onClick={() => setViewMode(viewMode === 'matrix' ? 'list' : 'matrix')}>
                {viewMode === 'matrix' ? t('common.listView') : t('common.matrixView')}
              </Button>
            </div>
          </div>
        </div>
        {renderBody()}
      </div>
    );
  },
);

MembersSettings.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isFetching: PropTypes.bool.isRequired,
  onFetch: PropTypes.func.isRequired,
  onAddMembership: PropTypes.func.isRequired,
  onAddManager: PropTypes.func.isRequired,
  onRemoveMembership: PropTypes.func.isRequired,
  onRemoveManager: PropTypes.func.isRequired,
  onUpdateMembership: PropTypes.func.isRequired,
  onAddBoardMembership: PropTypes.func.isRequired,
  onUpdateBoardMembership: PropTypes.func.isRequired,
  onRemoveBoardMembership: PropTypes.func.isRequired,
};

export default MembersSettings;
