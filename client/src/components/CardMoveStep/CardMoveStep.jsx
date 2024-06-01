import React, { useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Popup, Form, Dropdown } from '../Utils';

import { useForm2 } from '../../hooks';

import styles from './CardMoveStep.module.scss';
import gStyles from '../../globalStyles.module.scss';

const CardMoveStep = React.memo(({ projectsToLists, defaultPath, onMove, onTransfer, onBoardFetch, onBack, onClose }) => {
  const [t] = useTranslation();

  const dropdownBoard = useRef(null);
  const dropdownList = useRef(null);

  const [path, handleFieldChange] = useForm2(() => ({
    projectId: null,
    boardId: null,
    listId: null,
    ...defaultPath,
  }));

  const selectedProject = useMemo(() => projectsToLists.find((project) => project.id === path.projectId) || null, [projectsToLists, path.projectId]);

  const selectedBoard = useMemo(() => (selectedProject && selectedProject.boards.find((board) => board.id === path.boardId)) || null, [selectedProject, path.boardId]);

  const selectedList = useMemo(() => (selectedBoard && selectedBoard.lists.find((list) => list.id === path.listId)) || null, [selectedBoard, path.listId]);

  const handleFieldChangeOverride = useCallback(
    (event) => {
      const data = event.target;

      if (data.name === 'projectId') {
        dropdownBoard?.current?.clearSavedDefaultItem();
      } else if (data.name === 'boardId') {
        if (selectedProject.boards.find((board) => board.id === data.value).isFetching === null) {
          onBoardFetch(data.value);
        }
        dropdownList?.current?.clearSavedDefaultItem();
      }

      handleFieldChange(event);
    },
    [handleFieldChange, onBoardFetch, selectedProject],
  );

  const handleSubmit = useCallback(() => {
    if (selectedBoard.id !== defaultPath.boardId) {
      onTransfer(selectedBoard.id, selectedList.id);
    } else if (selectedList.id !== defaultPath.listId) {
      onMove(selectedList.id);
    }

    onClose();
  }, [defaultPath, onMove, onTransfer, onClose, selectedBoard, selectedList]);

  return (
    <>
      <Popup.Header onBack={onBack}>{t('common.moveCard', { context: 'title' })}</Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.text}>{t('common.project')}</div>
          <Dropdown
            name="projectId"
            options={projectsToLists.map((project) => ({
              id: project.id,
              name: project.name,
            }))}
            placeholder={projectsToLists.length === 0 ? t('common.noProjects') : t('common.selectProject')}
            defaultItem={selectedProject}
            onChange={handleFieldChangeOverride}
            isSearchable
            selectFirstOnSearch
            keepState
            returnOnChangeEvent
            disabled={projectsToLists.length === 0}
            className={styles.field}
          />
          {selectedProject && (
            <>
              <div className={styles.text}>{t('common.board')}</div>
              <Dropdown
                ref={dropdownBoard}
                name="boardId"
                options={selectedProject.boards.map((board) => ({
                  id: board.id,
                  name: board.name,
                }))}
                placeholder={selectedProject.boards.length === 0 ? t('common.noBoards') : t('common.selectBoard')}
                defaultItem={selectedBoard}
                onChange={handleFieldChangeOverride}
                isSearchable
                selectFirstOnSearch
                keepState
                returnOnChangeEvent
                disabled={selectedProject.boards.length === 0}
                className={styles.field}
              />
            </>
          )}
          {selectedBoard && selectedBoard.isFetching === false && (
            <>
              <div className={styles.text}>{t('common.list')}</div>
              <Dropdown
                ref={dropdownList}
                name="listId"
                options={selectedBoard.lists.map((list) => ({
                  id: list.id,
                  name: list.name,
                }))}
                placeholder={selectedBoard.lists.length === 0 ? t('common.noLists') : t('common.selectList')}
                defaultItem={selectedList}
                onChange={handleFieldChangeOverride}
                isSearchable
                selectFirstOnSearch
                keepState
                returnOnChangeEvent
                disabled={selectedBoard.lists.length === 0}
                className={styles.field}
              />
            </>
          )}
          <div className={gStyles.controls}>
            <Button style={ButtonStyle.Submit} content={t('action.move')} disabled={(selectedBoard && selectedBoard.isFetching !== false) || !selectedList} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

CardMoveStep.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  projectsToLists: PropTypes.array.isRequired,
  defaultPath: PropTypes.object.isRequired,
  /* eslint-enable react/forbid-prop-types */
  onMove: PropTypes.func.isRequired,
  onTransfer: PropTypes.func.isRequired,
  onBoardFetch: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

CardMoveStep.defaultProps = {
  onBack: undefined,
};

export default CardMoveStep;
