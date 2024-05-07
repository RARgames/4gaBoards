import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeExternalLinks from 'rehype-external-links';
import { visit } from 'unist-util-visit';
import remarkGithub from 'remark-github';
import { Icon, IconType, IconSize } from '../Utils/Icon';
import { ButtonTmp, ButtonType } from '../Utils/Button';
import { Dropdown } from '../Utils';
import { createTimer, startTimer, stopTimer } from '../../utils/timer';
import NameField from './NameField';
import DescriptionEdit from './DescriptionEdit';
import Tasks from './Tasks';
import Attachments from './Attachments';
import AttachmentAddZone from './AttachmentAddZone';
import AttachmentAdd from './AttachmentAdd';
import Activities from './Activities';
import User from '../User';
import Label from '../Label';
import DueDate from '../DueDate';
import Timer from '../Timer';
import BoardMembershipsPopup from '../BoardMembershipsPopup';
import LabelsPopup from '../LabelsPopup';
import DueDateEditPopup from '../DueDateEditPopup';
import TimerEditPopup from '../TimerEditPopup';
import DeletePopup from '../DeletePopup';
import ActionsPopup from '../Card/ActionsPopup';
import { useLocalStorage } from '../../hooks';
import { useToggle } from '../../lib/hooks';

import styles from './CardModal.module.scss';
import gStyles from '../../globalStyles.module.scss';

const CardModal = React.memo(
  ({
    name,
    id,
    description,
    dueDate,
    timer,
    isSubscribed,
    isActivitiesFetching,
    isAllActivitiesFetched,
    isActivitiesDetailsVisible,
    isActivitiesDetailsFetching,
    listId,
    boardId,
    projectId,
    users,
    labels,
    tasks,
    attachments,
    activities,
    descriptionMode,
    descriptionShown,
    tasksShown,
    attachmentsShown,
    commentsShown,
    userId,
    isGithubConnected,
    githubRepo,
    allProjectsToLists,
    allBoardMemberships,
    allLabels,
    canEdit,
    canEditCommentActivities,
    canEditAllCommentActivities,
    onUserUpdate,
    onUpdate,
    onMove,
    onTransfer,
    onDuplicate,
    onDelete,
    onUserAdd,
    onUserRemove,
    onBoardFetch,
    onLabelAdd,
    onLabelRemove,
    onLabelCreate,
    onLabelUpdate,
    onLabelMove,
    onLabelDelete,
    onTaskCreate,
    onTaskUpdate,
    onTaskMove,
    onTaskDelete,
    onAttachmentCreate,
    onAttachmentUpdate,
    onAttachmentDelete,
    onActivitiesFetch,
    onActivitiesDetailsToggle,
    onCommentActivityCreate,
    onCommentActivityUpdate,
    onCommentActivityDelete,
    onClose,
  }) => {
    const [t] = useTranslation();

    const isGalleryOpened = useRef(false);
    const nameEdit = useRef(null);
    const dropdown = useRef(null);
    const tasksRef = useRef(null);
    const descEditRef = useRef(null);
    const descriptionEditButtonRef = useRef(null);
    const [descriptionHeight, setDescriptionHeight] = useState(0);
    const [unsavedDesc, setUnsavedDesc] = useState(false);
    const [, getLocalDesc] = useLocalStorage(`desc-${id}`);
    const [isDescOpened, setIsDescOpened] = useState(false);
    const [descShown, toggleDescShown] = useToggle(descriptionShown);
    const [taskShown, toggleTasksShown] = useToggle(tasksShown);
    const [attacShown, toggleAttacShown] = useToggle(attachmentsShown);
    const [commShown, toggleCommShown] = useToggle(commentsShown);

    const selectedProject = useMemo(() => allProjectsToLists.find((project) => project.id === projectId) || null, [allProjectsToLists, projectId]);
    const selectedBoard = useMemo(() => (selectedProject && selectedProject.boards.find((board) => board.id === boardId)) || null, [selectedProject, boardId]);
    const selectedList = useMemo(() => (selectedBoard && selectedBoard.lists.find((list) => list.id === listId)) || null, [selectedBoard, listId]);

    const handleToggleDescShown = useCallback(() => {
      toggleDescShown();
      // TODO hacky way to update UI faster
      const timeout = setTimeout(() => {
        onUserUpdate(userId, { descriptionShown: !descShown });
      }, 0);
      return () => clearTimeout(timeout);
    }, [descShown, onUserUpdate, toggleDescShown, userId]);

    const handleToggleTasksShown = useCallback(() => {
      toggleTasksShown();
      // TODO hacky way to update UI faster
      const timeout = setTimeout(() => {
        onUserUpdate(userId, { tasksShown: !taskShown });
      }, 0);
      return () => clearTimeout(timeout);
    }, [onUserUpdate, taskShown, toggleTasksShown, userId]);

    const handleToggleAttacShown = useCallback(() => {
      toggleAttacShown();
      // TODO hacky way to update UI faster
      const timeout = setTimeout(() => {
        onUserUpdate(userId, { attachmentsShown: !attacShown });
      }, 0);
      return () => clearTimeout(timeout);
    }, [attacShown, onUserUpdate, toggleAttacShown, userId]);

    const handleToggleCommShown = useCallback(() => {
      toggleCommShown();
      // TODO hacky way to update UI faster
      const timeout = setTimeout(() => {
        onUserUpdate(userId, { commentsShown: !commShown });
      }, 0);
      return () => clearTimeout(timeout);
    }, [commShown, onUserUpdate, toggleCommShown, userId]);

    const handleNameUpdate = useCallback(
      (newName) => {
        onUpdate({
          name: newName,
        });
      },
      [onUpdate],
    );

    const handleDescriptionUpdate = useCallback(
      (newDescription) => {
        onUpdate({
          description: newDescription,
        });
      },
      [onUpdate],
    );

    const handleLocalDescChange = useCallback((isLocallyChanged) => {
      setUnsavedDesc(isLocallyChanged);
    }, []);

    const handleDueDateUpdate = useCallback(
      (newDueDate) => {
        onUpdate({
          dueDate: newDueDate,
        });
      },
      [onUpdate],
    );

    const handleTimerUpdate = useCallback(
      (newTimer) => {
        onUpdate({
          timer: newTimer,
        });
      },
      [onUpdate],
    );

    const handleToggleTimerClick = useCallback(() => {
      // TODO hacky way of creating new timer - should be created using TimerEditStep
      if (!timer) {
        const newTimer = createTimer({ hours: 0, minutes: 0, seconds: 0 });
        onUpdate({
          timer: newTimer.startedAt ? stopTimer(newTimer) : startTimer(newTimer),
        });
      } else {
        onUpdate({
          timer: timer.startedAt ? stopTimer(timer) : startTimer(timer),
        });
      }
    }, [onUpdate, timer]);

    const handleCoverUpdate = useCallback(
      (newCoverAttachmentId) => {
        onUpdate({
          coverAttachmentId: newCoverAttachmentId,
        });
      },
      [onUpdate],
    );

    const handleToggleSubscriptionClick = useCallback(() => {
      onUpdate({
        isSubscribed: !isSubscribed,
      });
    }, [isSubscribed, onUpdate]);

    const handleTaskAddOpen = useCallback(() => {
      if (!taskShown) {
        handleToggleTasksShown();
      }
      const timeout = setTimeout(() => {
        tasksRef.current?.open();
      }, 0);
      return () => clearTimeout(timeout);
    }, [handleToggleTasksShown, taskShown]);

    const handleNameEdit = useCallback(() => {
      if (canEdit) {
        nameEdit.current.open();
      }
    }, [canEdit]);

    const handleGalleryOpen = useCallback(() => {
      isGalleryOpened.current = true;
    }, []);

    const handleGalleryClose = useCallback(() => {
      isGalleryOpened.current = false;
    }, []);

    const handleClose = useCallback(() => {
      if (isGalleryOpened.current) {
        return;
      }
      onClose();
    }, [onClose]);

    const handleDropdownClick = useCallback(() => {
      if (canEdit) {
        dropdown.current.open();
      }
    }, [canEdit]);

    const handleDescButtonClick = useCallback(() => {
      if (!descShown) {
        handleToggleDescShown();
      }
      if (!isDescOpened) {
        setIsDescOpened(true);
      } else if (descEditRef.current) {
        descEditRef.current.focus();
      }
    }, [descShown, handleToggleDescShown, isDescOpened]);

    const handleDescClick = useCallback((e) => {
      if (descriptionEditButtonRef.current) {
        setDescriptionHeight(descriptionEditButtonRef.current.offsetHeight);
      }
      if (e.ctrlKey) {
        return;
      }
      setIsDescOpened(true);
    }, []);

    const handleDescClose = useCallback(() => {
      setIsDescOpened(false);
      setUnsavedDesc(false);
    }, []);

    // eslint-disable-next-line consistent-return
    useEffect(() => {
      // TODO here reset state of all inner components (tasks, comments)
      setUnsavedDesc(false);
      setIsDescOpened(false);
      if (getLocalDesc()) {
        setUnsavedDesc(true);
        const timeout = setTimeout(() => {
          setIsDescOpened(true);
        }, 0);

        return () => clearTimeout(timeout);
      }
    }, [getLocalDesc, id]);

    const userIds = users.map((user) => user.id);
    const labelIds = labels.map((label) => label.id);

    // TODO remove after testing
    // eslint-disable-next-line no-param-reassign
    // canEdit = false;

    const headerNode = (
      <div className={styles.header}>
        <NameField defaultValue={name} onUpdate={handleNameUpdate} ref={nameEdit}>
          {/*  eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div className={classNames(styles.headerTitle, canEdit && gStyles.cursorPointer)} onClick={handleNameEdit}>
            {name}
          </div>
        </NameField>
        <ButtonTmp type={ButtonType.Icon} title={t('common.closeCard')} onClick={handleClose} className={styles.headerButton}>
          <Icon type={IconType.Close} size={IconSize.Size14} />
        </ButtonTmp>
        {canEdit && (
          <ActionsPopup
            card={{
              dueDate,
              timer,
              boardId,
              listId,
              projectId,
            }}
            projectsToLists={allProjectsToLists}
            boardMemberships={allBoardMemberships}
            currentUserIds={users.map((user) => user.id)}
            labels={allLabels}
            currentLabelIds={labels.map((label) => label.id)}
            onNameEdit={handleNameEdit}
            onUpdate={onUpdate}
            onMove={onMove}
            onTransfer={onTransfer}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onUserAdd={onUserAdd}
            onUserRemove={onUserRemove}
            onBoardFetch={onBoardFetch}
            onLabelAdd={onLabelAdd}
            onLabelRemove={onLabelRemove}
            onLabelCreate={onLabelCreate}
            onLabelUpdate={onLabelUpdate}
            onLabelMove={onLabelMove}
            onLabelDelete={onLabelDelete}
          >
            <ButtonTmp type={ButtonType.Icon} title={t('common.editCard')} className={styles.headerButton}>
              <Icon type={IconType.EllipsisVertical} size={IconSize.Size14} />
            </ButtonTmp>
          </ActionsPopup>
        )}
        {canEdit && (
          <DeletePopup title={t('common.deleteCard', { context: 'title' })} content={t('common.areYouSureYouWantToDeleteThisCard')} buttonContent={t('action.deleteCard')} onConfirm={onDelete}>
            <ButtonTmp type={ButtonType.Icon} title={t('common.deleteCard', { context: 'title' })} className={styles.headerButton}>
              <Icon type={IconType.Trash} size={IconSize.Size14} />
            </ButtonTmp>
          </DeletePopup>
        )}
        <div className={styles.headerListFieldWrapper}>
          <Dropdown
            ref={dropdown}
            options={selectedBoard.lists.map((list) => ({
              name: list.name,
              id: list.id,
            }))}
            placeholder={selectedList.name}
            defaultItem={selectedList}
            isSearchable
            onChange={onMove}
            submitOnBlur
          >
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div className={classNames(canEdit && gStyles.cursorPointer)} onClick={handleDropdownClick}>
              <div className={classNames(styles.headerListField)}>{selectedList.name}</div>
              <Icon type={IconType.TriangleDown} title={t('common.moveCardToList')} size={IconSize.Size10} className={styles.headerListFieldIcon} />
            </div>
          </Dropdown>
        </div>
      </div>
    );

    const membersNode = (
      <div className={styles.headerItems}>
        <div className={styles.text}>
          {t('common.members', { context: 'title' })}
          {canEdit && (
            <BoardMembershipsPopup items={allBoardMemberships} currentUserIds={userIds} onUserSelect={onUserAdd} onUserDeselect={onUserRemove}>
              <ButtonTmp type={ButtonType.Icon} title={t('common.addMember')}>
                <Icon type={IconType.Plus} size={IconSize.Size10} className={styles.iconAddButton2} />
              </ButtonTmp>
            </BoardMembershipsPopup>
          )}
        </div>
        {users.map((user) => (
          <span key={user.id} className={styles.headerItem}>
            <User name={user.name} avatarUrl={user.avatarUrl} size="small" />
          </span>
        ))}
      </div>
    );

    const labelsNode = (
      <div className={styles.headerItems}>
        <div className={styles.text}>
          {t('common.labels', { context: 'title' })}
          {canEdit && (
            <LabelsPopup
              items={allLabels}
              currentIds={labelIds}
              onSelect={onLabelAdd}
              onDeselect={onLabelRemove}
              onCreate={onLabelCreate}
              onUpdate={onLabelUpdate}
              onMove={onLabelMove}
              onDelete={onLabelDelete}
            >
              <ButtonTmp type={ButtonType.Icon} title={t('common.addLabel')}>
                <Icon type={IconType.Plus} size={IconSize.Size10} className={styles.iconAddButton2} />
              </ButtonTmp>
            </LabelsPopup>
          )}
        </div>
        {labels.map((label) => (
          <span key={label.id} className={styles.headerItem}>
            <Label name={label.name} color={label.color} variant="cardModal" />
          </span>
        ))}
      </div>
    );

    const dueDateNode = (
      <div className={styles.headerItems}>
        <div className={styles.text}>
          {t('common.dueDate', { context: 'title' })}
          {canEdit && (
            <DueDateEditPopup defaultValue={dueDate} onUpdate={handleDueDateUpdate}>
              <ButtonTmp type={ButtonType.Icon} title={dueDate ? t('common.editDueDate') : t('common.addDueDate')}>
                <Icon type={dueDate ? IconType.Pencil : IconType.Plus} size={IconSize.Size10} className={styles.iconAddButton2} />
              </ButtonTmp>
            </DueDateEditPopup>
          )}
        </div>
        <span className={styles.headerItem}>
          {canEdit ? (
            <DueDateEditPopup defaultValue={dueDate} onUpdate={handleDueDateUpdate}>
              <DueDate value={dueDate} />
            </DueDateEditPopup>
          ) : (
            <DueDate value={dueDate} />
          )}
        </span>
      </div>
    );

    const timerNode = (
      <div className={styles.headerItems}>
        <div className={styles.text}>
          {t('common.timer', { context: 'title' })}
          {canEdit && (
            <TimerEditPopup defaultValue={timer} onUpdate={handleTimerUpdate}>
              <ButtonTmp type={ButtonType.Icon} title={t('common.editTimer')}>
                <Icon type={IconType.Pencil} size={IconSize.Size10} className={styles.iconAddButton2} />
              </ButtonTmp>
            </TimerEditPopup>
          )}
        </div>
        <span className={styles.headerItem}>
          <Timer startedAt={timer ? timer.startedAt : undefined} total={timer ? timer.total : 0} variant="cardModal" onClick={canEdit ? handleToggleTimerClick : undefined} />
        </span>
      </div>
    );

    const subscribeNode = (
      <div className={styles.headerItems}>
        <div className={styles.text}>{t('common.notifications')}</div>
        <span className={styles.headerItem}>
          <ButtonTmp type={ButtonType.Default} title={isSubscribed ? t('action.unsubscribe') : t('action.subscribe')} onClick={handleToggleSubscriptionClick} className={styles.subscribeButton}>
            {isSubscribed ? t('common.subscribed') : t('action.subscribe')}
          </ButtonTmp>
        </span>
      </div>
    );

    const colorNames = ['black', 'grey', 'white', 'brown', 'red', 'purple', 'pink', 'green', 'lime', 'yellow', 'blue', 'cyan', 'orange'];

    function recolorPlugin() {
      function transformer(tree) {
        const currentColorClass = [];
        visit(tree, (node, index, parent) => {
          if (node.type === 'comment') {
            const commentContent = node.value.trim().split('-');
            const colorIndex = colorNames.indexOf(commentContent[0]);
            if (colorIndex !== -1) {
              if (commentContent[1] === 'end') {
                const cIndex = currentColorClass.indexOf(colorNames[colorIndex]);
                if (cIndex !== -1) {
                  currentColorClass.splice(cIndex, 1);
                }
              } else {
                currentColorClass.unshift(colorNames[colorIndex]);
              }
            }
          }

          if (currentColorClass.length > 0) {
            if (node.type === 'text' && node.value !== '\n') {
              // eslint-disable-next-line no-param-reassign
              parent.children[index] = {
                type: 'element',
                tagName: 'span',
                properties: { className: currentColorClass[0] },
                children: [{ type: 'text', value: node.value }],
              };
            }
          }
        });
        return tree;
      }
      return transformer;
    }

    function readdCopyButtonPlugin() {
      function transformer(tree) {
        visit(tree, 'element', (node) => {
          if (node.tagName === 'div' && node.properties && node.properties.class && node.properties.class.includes('copied')) {
            // eslint-disable-next-line no-param-reassign
            node.children = [
              {
                type: 'element',
                tagName: 'svg',
                properties: { className: 'octicon-copy', ariaHidden: 'true', viewBox: '0 0 16 16', fill: 'currentColor', height: 12, width: 12 },
                children: [
                  {
                    type: 'element',
                    tagName: 'path',
                    properties: {
                      fillRule: 'evenodd',
                      d: 'M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z',
                    },
                    children: [],
                  },
                  {
                    type: 'element',
                    tagName: 'path',
                    properties: {
                      fillRule: 'evenodd',
                      d: 'M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z',
                    },
                    children: [],
                  },
                ],
              },
              {
                type: 'element',
                tagName: 'svg',
                properties: { className: 'octicon-check', ariaHidden: 'true', viewBox: '0 0 16 16', fill: 'currentColor', height: 12, width: 12 },
                children: [
                  {
                    type: 'element',
                    tagName: 'path',
                    properties: {
                      fillRule: 'evenodd',
                      d: 'M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z',
                    },
                    children: [],
                  },
                ],
              },
            ];
          }
        });
        return tree;
      }
      return transformer;
    }

    const rehypePlugins = [
      [rehypeExternalLinks, { target: ['_blank'], rel: ['noreferrer', 'noopener'] }],
      [recolorPlugin],
      [
        rehypeSanitize,
        {
          ...defaultSchema,
          attributes: {
            ...defaultSchema.attributes,
            pre: [...(defaultSchema.attributes.pre || []), ['className', /^language-./]],
            code: [...(defaultSchema.attributes.code || []), ['className', 'code-highlight', /^language-./]],
            div: [...(defaultSchema.attributes.div || []), ['class', 'copied'], ['data-code']], // for copy button
            ul: [...(defaultSchema.attributes.ul || []), ['className', 'contains-task-list']],
            span: [
              ...(defaultSchema.attributes.span || []),
              [
                'className',
                ...colorNames,
                // classNames from @uiw/react-markdown-preview/core/markdown.css
                // eslint-disable-next-line prettier/prettier
                'highlight-line', 'line-number', 'code-line', 'token', 'comment', 'prolog', 'doctype', 'cdata', 'namespace', 'property', 'tag', 'selector', 'constant', 'symbol', 'maybe-class-name', 'property-access', 'operator', 'boolean', 'number', 'class', 'attr-name', 'string', 'char', 'builtin', 'deleted', 'inserted', 'variable', 'entity', 'url', 'color', 'atrule', 'attr-value', 'function', 'class-name', 'rule', 'regex', 'important', 'keyword', 'coord', 'bold', 'italic',
                // other classNames from Prism
                // eslint-disable-next-line prettier/prettier
                'punctuation', 'parameter', 'arrow','control-flow', 'null', 'nil', 'method', 'console',
              ],
              ['line'],
            ],
          },
        },
      ],
      [readdCopyButtonPlugin],
    ];

    const remarkPlugins = isGithubConnected ? [[remarkGithub, { repository: githubRepo }]] : null;

    const descriptionEditOpenNode = description ? (
      <ButtonTmp title={t('common.editDescription')} onClick={handleDescClick} className={classNames(styles.descriptionText, styles.cursorPointer)} ref={descriptionEditButtonRef}>
        <MDEditor.Markdown source={description} remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} />
      </ButtonTmp>
    ) : (
      <ButtonTmp type={ButtonType.Default} title={t('common.addDescription')} onClick={handleDescClick} className={styles.descriptionButton}>
        <span className={styles.descriptionButtonText}>{t('action.addDescription')}</span>
      </ButtonTmp>
    );

    const descriptionEditNode = isDescOpened ? (
      <DescriptionEdit
        ref={descEditRef}
        defaultValue={description}
        onUpdate={handleDescriptionUpdate}
        cardId={id}
        onLocalDescChange={handleLocalDescChange}
        onClose={handleDescClose}
        descriptionHeight={descriptionHeight}
        availableColors={colorNames}
        descriptionMode={descriptionMode}
        userId={userId}
        onUserUpdate={onUserUpdate}
        isGithubConnected={isGithubConnected}
        githubRepo={githubRepo}
        rehypePlugins={rehypePlugins}
        remarkPlugins={remarkPlugins}
      />
    ) : (
      descriptionEditOpenNode
    );

    const descriptionNode = (description || canEdit) && (
      <div className={styles.contentModule}>
        <div className={styles.moduleHeader}>
          <Icon type={IconType.BarsStaggered} size={IconSize.Size20} className={styles.moduleIcon} />
          {t('common.description')}
          {canEdit && (
            <ButtonTmp type={ButtonType.Icon} title={description ? t('common.editDescription') : t('common.addDescription')} onClick={handleDescButtonClick}>
              <Icon type={description ? IconType.Pencil : IconType.Plus} size={IconSize.Size10} className={styles.iconAddButton} />
            </ButtonTmp>
          )}
          {canEdit && unsavedDesc && <span className={styles.localChangesLoaded}>{t('common.unsavedChanges')}</span>}
          <ButtonTmp type={ButtonType.Icon} title={t('common.toggleDescription')} onClick={handleToggleDescShown} className={styles.buttonToggle}>
            <Icon type={descShown ? IconType.Minus : IconType.Plus} size={IconSize.Size10} />
          </ButtonTmp>
        </div>
        <div className={styles.moduleBody}>
          {descShown && canEdit && descriptionEditNode}
          {descShown && !canEdit && (
            <div className={styles.descriptionText}>
              <MDEditor.Markdown source={description} remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} />
            </div>
          )}
        </div>
      </div>
    );

    const tasksNode = (tasks.length > 0 || canEdit) && (
      <div className={styles.contentModule}>
        <div className={styles.moduleHeader}>
          <Icon type={IconType.Check} size={IconSize.Size20} className={styles.moduleIcon} />
          {t('common.tasks')}
          {canEdit && (
            <ButtonTmp type={ButtonType.Icon} title={t('common.addTask')} onClick={handleTaskAddOpen}>
              <Icon type={IconType.Plus} size={IconSize.Size10} className={styles.iconAddButton} />
            </ButtonTmp>
          )}
          <ButtonTmp type={ButtonType.Icon} title={t('common.toggleTasks')} onClick={handleToggleTasksShown} className={styles.buttonToggle}>
            <Icon type={taskShown ? IconType.Minus : IconType.Plus} size={IconSize.Size10} />
          </ButtonTmp>
        </div>
        <div className={styles.moduleBody}>
          {taskShown && <Tasks ref={tasksRef} items={tasks} canEdit={canEdit} onCreate={onTaskCreate} onUpdate={onTaskUpdate} onMove={onTaskMove} onDelete={onTaskDelete} />}
        </div>
      </div>
    );

    const attachmentsNode = (
      <div className={styles.contentModule}>
        <div className={styles.moduleHeader}>
          <Icon type={IconType.Attach} size={IconSize.Size20} className={styles.moduleIcon} />
          {t('common.attachments')}
          {canEdit && (
            <AttachmentAdd onCreate={onAttachmentCreate}>
              <ButtonTmp type={ButtonType.Icon} title={t('common.addAttachmentButton')}>
                <Icon type={IconType.Plus} size={IconSize.Size10} className={styles.iconAddButton} />
              </ButtonTmp>
            </AttachmentAdd>
          )}
          <ButtonTmp type={ButtonType.Icon} title={t('common.toggleAttachments')} onClick={handleToggleAttacShown} className={styles.buttonToggle}>
            <Icon type={attacShown ? IconType.Minus : IconType.Plus} size={IconSize.Size10} />
          </ButtonTmp>
        </div>
        <div className={styles.moduleBody}>
          {attacShown && (
            <>
              <Attachments
                items={attachments}
                canEdit={canEdit}
                onUpdate={onAttachmentUpdate}
                onDelete={onAttachmentDelete}
                onCoverUpdate={handleCoverUpdate}
                onGalleryOpen={handleGalleryOpen}
                onGalleryClose={handleGalleryClose}
              />
              <AttachmentAdd onCreate={onAttachmentCreate}>
                <ButtonTmp type={ButtonType.Default} title={t('common.addAttachmentButton')} className={styles.addAttachmentButton}>
                  {t('common.addAttachment')} <span className={styles.hint}>{t('common.addAttachmentExtra')}</span>
                </ButtonTmp>
              </AttachmentAdd>
            </>
          )}
        </div>
      </div>
    );

    const activitiesNode = (
      <Activities
        items={activities}
        isFetching={isActivitiesFetching}
        isAllFetched={isAllActivitiesFetched}
        isDetailsVisible={isActivitiesDetailsVisible}
        isDetailsFetching={isActivitiesDetailsFetching}
        canEdit={canEditCommentActivities}
        canEditAllComments={canEditAllCommentActivities}
        onFetch={onActivitiesFetch}
        onDetailsToggle={onActivitiesDetailsToggle}
        onCommentCreate={onCommentActivityCreate}
        onCommentUpdate={onCommentActivityUpdate}
        onCommentDelete={onCommentActivityDelete}
        toggleCommShown={handleToggleCommShown}
        commShown={commShown}
      />
    );

    const contentNode = (
      <div className={classNames(styles.mainContainer, gStyles.scrollableY)}>
        {headerNode}
        <div className={styles.moduleContainer}>
          {membersNode}
          {labelsNode}
          {dueDateNode}
          {timerNode}
          {subscribeNode}
          <hr className={styles.hr} />
        </div>
        <div className={styles.moduleContainer}>
          {descriptionNode}
          <hr className={styles.hr} />
        </div>
        <div className={styles.moduleContainer}>
          {tasksNode}
          <hr className={styles.hr} />
        </div>
        <div className={styles.moduleContainer}>
          {attachmentsNode}
          <hr className={styles.hr} />
        </div>
        <div className={styles.moduleContainer}>
          {activitiesNode}
          <hr className={styles.hr} />
        </div>
      </div>
    );

    return <div className={styles.wrapper}>{canEdit ? <AttachmentAddZone onCreate={onAttachmentCreate}>{contentNode}</AttachmentAddZone> : contentNode}</div>;
  },
);

CardModal.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  description: PropTypes.string,
  dueDate: PropTypes.instanceOf(Date),
  timer: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  isSubscribed: PropTypes.bool.isRequired,
  isActivitiesFetching: PropTypes.bool.isRequired,
  isAllActivitiesFetched: PropTypes.bool.isRequired,
  isActivitiesDetailsVisible: PropTypes.bool.isRequired,
  isActivitiesDetailsFetching: PropTypes.bool.isRequired,
  listId: PropTypes.string.isRequired,
  boardId: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
  /* eslint-disable react/forbid-prop-types */
  users: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  tasks: PropTypes.array.isRequired,
  attachments: PropTypes.array.isRequired,
  activities: PropTypes.array.isRequired,
  descriptionMode: PropTypes.string.isRequired,
  descriptionShown: PropTypes.bool.isRequired,
  tasksShown: PropTypes.bool.isRequired,
  attachmentsShown: PropTypes.bool.isRequired,
  commentsShown: PropTypes.bool.isRequired,
  userId: PropTypes.string.isRequired,
  isGithubConnected: PropTypes.bool.isRequired,
  githubRepo: PropTypes.string.isRequired,
  allProjectsToLists: PropTypes.array.isRequired,
  allBoardMemberships: PropTypes.array.isRequired,
  allLabels: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  canEdit: PropTypes.bool.isRequired,
  canEditCommentActivities: PropTypes.bool.isRequired,
  canEditAllCommentActivities: PropTypes.bool.isRequired,
  onUserUpdate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onTransfer: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onBoardFetch: PropTypes.func.isRequired,
  onLabelAdd: PropTypes.func.isRequired,
  onLabelRemove: PropTypes.func.isRequired,
  onLabelCreate: PropTypes.func.isRequired,
  onLabelUpdate: PropTypes.func.isRequired,
  onLabelMove: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
  onTaskCreate: PropTypes.func.isRequired,
  onTaskUpdate: PropTypes.func.isRequired,
  onTaskMove: PropTypes.func.isRequired,
  onTaskDelete: PropTypes.func.isRequired,
  onAttachmentCreate: PropTypes.func.isRequired,
  onAttachmentUpdate: PropTypes.func.isRequired,
  onAttachmentDelete: PropTypes.func.isRequired,
  onActivitiesFetch: PropTypes.func.isRequired,
  onActivitiesDetailsToggle: PropTypes.func.isRequired,
  onCommentActivityCreate: PropTypes.func.isRequired,
  onCommentActivityUpdate: PropTypes.func.isRequired,
  onCommentActivityDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

CardModal.defaultProps = {
  description: undefined,
  dueDate: undefined,
  timer: undefined,
};

export default CardModal;
