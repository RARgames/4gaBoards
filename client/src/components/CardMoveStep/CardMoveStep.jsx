import React, { useMemo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useForm } from '../../hooks';
import { useToggle, useDidUpdate } from '../../lib/hooks';
import { Button, ButtonStyle, Popup, Form, Dropdown, DropdownStyle } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './CardMoveStep.module.scss';

const CardMoveStep = React.memo(({ projectsToLists, defaultPath, onMove, onTransfer, onBoardFetch, onBack, onClose }) => {
  const [t] = useTranslation();

  const dropdownProject = useRef(null);
  const dropdownBoard = useRef(null);
  const dropdownList = useRef(null);

  const [path, handleFieldChange] = useForm(() => ({
    projectId: null,
    boardId: null,
    listId: null,
    ...defaultPath,
  }));

  const formRef = useRef(null);
  const [focusFormState, focusForm] = useToggle();

  const selectedProject = useMemo(() => projectsToLists.find((project) => project.id === path.projectId) || null, [projectsToLists, path.projectId]);

  const selectedBoard = useMemo(() => (selectedProject && selectedProject.boards.find((board) => board.id === path.boardId)) || null, [selectedProject, path.boardId]);

  const selectedList = useMemo(() => (selectedBoard && selectedBoard.lists.find((list) => list.id === path.listId)) || null, [selectedBoard, path.listId]);

  const handleChange = useCallback(
    (e) => {
      const data = e.target;
      if (data.name === 'boardId') {
        if (selectedProject.boards.find((board) => board.id === data.value).isFetching === null) {
          onBoardFetch(data.value);
        }
      }

      handleFieldChange(e);
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

  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case 'Enter': {
          handleSubmit();
          break;
        }
        default:
      }
    },
    [handleSubmit],
  );

  useDidUpdate(() => {
    formRef.current?.focus();
  }, [focusFormState]);

  return (
    <>
      <Popup.Header onBack={onBack}>{t('common.moveCard', { context: 'title' })}</Popup.Header>
      <Popup.Content>
        <Form ref={formRef} tabIndex="0" onKeyDown={handleKeyDown}>
          <div className={s.text}>{t('common.project', { context: 'title' })}</div>
          <Dropdown
            ref={dropdownProject}
            style={DropdownStyle.Default}
            name="projectId"
            options={projectsToLists.map((project) => ({
              id: project.id,
              name: project.name,
            }))}
            placeholder={projectsToLists.length === 0 ? t('common.noProjects') : t('common.selectProject')}
            defaultItem={selectedProject}
            onChange={handleChange}
            isSearchable
            selectFirstOnSearch
            returnOnChangeEvent
            onBlur={focusForm}
            disabled={projectsToLists.length === 0}
            dropdownMenuClassName={s.dropdownMenu}
          />
          {selectedProject && (
            <>
              <div className={s.text}>{t('common.board', { context: 'title' })}</div>
              <Dropdown
                ref={dropdownBoard}
                style={DropdownStyle.Default}
                name="boardId"
                options={selectedProject.boards.map((board) => ({
                  id: board.id,
                  name: board.name,
                }))}
                placeholder={selectedProject.boards.length === 0 ? t('common.noBoards') : t('common.selectBoard')}
                defaultItem={selectedBoard}
                onChange={handleChange}
                isSearchable
                selectFirstOnSearch
                returnOnChangeEvent
                onBlur={focusForm}
                disabled={selectedProject.boards.length === 0}
                dropdownMenuClassName={s.dropdownMenu}
              />
            </>
          )}
          {selectedBoard && selectedBoard.isFetching === false && (
            <>
              <div className={s.text}>{t('common.list')}</div>
              <Dropdown
                ref={dropdownList}
                style={DropdownStyle.Default}
                name="listId"
                options={selectedBoard.lists.map((list) => ({
                  id: list.id,
                  name: list.name,
                }))}
                placeholder={selectedBoard.lists.length === 0 ? t('common.noLists') : t('common.selectList')}
                defaultItem={selectedList}
                onChange={handleChange}
                isSearchable
                selectFirstOnSearch
                returnOnChangeEvent
                onBlur={focusForm}
                disabled={selectedBoard.lists.length === 0}
                dropdownMenuClassName={s.dropdownMenu}
              />
            </>
          )}
          <div className={gs.controls}>
            <Button style={ButtonStyle.Submit} content={t('action.move')} disabled={(selectedBoard && selectedBoard.isFetching !== false) || !selectedList} onClick={handleSubmit} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

CardMoveStep.propTypes = {
  projectsToLists: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  defaultPath: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
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
