import React, { useCallback, useImperativeHandle, useRef, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'semantic-ui-react';

import styles from './ListField.module.scss';

const ListField = React.forwardRef(({ children, projectsToLists, defaultPath, onMove }, ref) => {
  const [t] = useTranslation();

  const selectedProject = useMemo(() => projectsToLists.find((project) => project.id === defaultPath.projectId) || null, [projectsToLists, defaultPath.projectId]);

  const selectedBoard = useMemo(() => (selectedProject && selectedProject.boards.find((board) => board.id === defaultPath.boardId)) || null, [selectedProject, defaultPath.boardId]);

  const selectedList = useMemo(() => (selectedBoard && selectedBoard.lists.find((list) => list.id === defaultPath.listId)) || null, [selectedBoard, defaultPath.listId]);

  const [isOpened, setIsOpened] = useState(false);
  const field = useRef(null);

  const open = useCallback(() => {
    setIsOpened(true);
  }, []);

  const close = useCallback(() => {
    setIsOpened(false);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
    }),
    [open, close],
  );

  const handleSubmit = useCallback(
    (_, selected) => {
      if (selected.value !== selectedList.id) {
        onMove(selected.value);
      }
      close();
    },
    [close, onMove, selectedList.id],
  );

  if (!isOpened) {
    return children;
  }

  return (
    <div className={styles.wrapper}>
      <Dropdown
        ref={field}
        fluid
        search
        selection
        selectOnNavigation={false}
        name="listId"
        options={selectedBoard.lists.map((list) => ({
          text: list.name,
          value: list.id,
        }))}
        value={selectedList && selectedList.id}
        placeholder={selectedBoard.isFetching === false && selectedBoard.lists.length === 0 ? t('common.noLists') : t('common.selectList')}
        loading={selectedBoard.isFetching !== false}
        disabled={selectedBoard.isFetching !== false || selectedBoard.lists.length === 0}
        className={styles.field}
        onChange={handleSubmit}
        onBlur={handleSubmit}
        onClose={handleSubmit}
        searchInput={{ autoFocus: true }}
      />
    </div>
  );
});

ListField.propTypes = {
  children: PropTypes.element.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  projectsToLists: PropTypes.array.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  defaultPath: PropTypes.object.isRequired,
  onMove: PropTypes.func.isRequired,
};

export default React.memo(ListField);
