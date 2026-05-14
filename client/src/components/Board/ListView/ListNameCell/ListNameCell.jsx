import React, { useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { Dropdown, DropdownVariant } from '../../../Utils';

import * as gs from '../../../../global.module.scss';
import * as s from './ListNameCell.module.scss';

const ListNameCell = React.memo(({ cellClassName, projectId, boardId, listId, allProjectsToLists, canEdit, onMove }) => {
  const [t] = useTranslation();
  const dropdown = useRef(null);

  const selectedProject = useMemo(() => allProjectsToLists.find((project) => project.id === projectId) || null, [allProjectsToLists, projectId]);
  const selectedBoard = useMemo(() => (selectedProject && selectedProject.boards.find((board) => board.id === boardId)) || null, [selectedProject, boardId]);
  const selectedList = useMemo(() => (selectedBoard && selectedBoard.lists.find((list) => list.id === listId)) || null, [selectedBoard, listId]);
  const selectedListName = useMemo(() => (selectedList?.name?.startsWith('common.') ? t(selectedList.name) : selectedList?.name), [selectedList, t]);

  const handleDropdownClick = useCallback(() => {
    if (canEdit) {
      dropdown.current?.open();
    }
  }, [canEdit]);

  return (
    <div className={clsx(cellClassName, s.listName)}>
      <Dropdown
        ref={dropdown}
        variant={DropdownVariant.FullWidth}
        options={selectedBoard?.lists.map((list) => ({
          name: list.name,
          id: list.id,
        }))}
        placeholder={selectedListName}
        defaultItem={selectedList}
        translateI18nKeys
        isSearchable
        onChange={(list) => onMove(list.id)}
        selectFirstOnSearch
      >
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div className={clsx(canEdit && gs.cursorPointer)} onClick={handleDropdownClick} data-prevent-card-switch>
          <div className={clsx(s.headerListField)} title={selectedListName}>
            {selectedListName}
          </div>
        </div>
      </Dropdown>
    </div>
  );
});

ListNameCell.propTypes = {
  cellClassName: PropTypes.string,
  listId: PropTypes.string.isRequired,
  boardId: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
  allProjectsToLists: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  onMove: PropTypes.func.isRequired,
};

ListNameCell.defaultProps = {
  cellClassName: '',
};

export default ListNameCell;
