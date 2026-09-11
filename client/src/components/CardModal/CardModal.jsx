import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import api from '../../api';
import Paths from '../../constants/Paths';
import CardLinksContainer from '../../containers/CardLinksContainer';
import { useLocalStorage } from '../../hooks';
import { useToggle } from '../../lib/hooks';
import { registerDescriptionOpenHandler } from '../../sagas/core/services/cards';
import { getAccessToken } from '../../utils/access-token-storage';
import formatDuration from '../../utils/format-duration';
import ActionsPopup from '../Card/ActionsPopup';
import DeletePopup from '../DeletePopup';
import DueDate from '../DueDate';
import DueDateEditPopup from '../DueDateEditPopup';
import Label from '../Label';
import LabelsPopup from '../LabelsPopup';
import MembershipsPopup from '../MembershipsPopup';
import Priority from '../Priority';
import Tasks from '../Tasks';
import User from '../User';
import { Button, ButtonStyle, Icon, IconType, IconSize, Dropdown, DropdownStyle, MDPreview, LinkifiedTextRenderer } from '../Utils';
import AttachmentAdd from './AttachmentAdd';
import AttachmentAddZone from './AttachmentAddZone';
import Attachments from './Attachments';
import Comments from './Comments';
import DescriptionEdit from './DescriptionEdit';
import NameField from './NameField';

import * as gs from '../../global.module.scss';
import * as s from './CardModal.module.scss';

const CardModal = React.memo(
  ({
    name,
    id,
    description,
    dueDate,
    startDate,
    timer,
    isSubscribed,
    isActivitiesFetching,
    isAllActivitiesFetched,
    isCommentsFetching,
    isAllCommentsFetched,
    listId,
    boardId,
    projectId,
    users,
    labels,
    tasks,
    attachments,
    comments,
    activities,
    descriptionMode,
    descriptionShown,
    tasksShown,
    attachmentsShown,
    commentsShown,
    hideCardModalActivity,
    preferredDetailsFont,
    userId,
    isGithubConnected,
    githubRepo,
    allProjectsToLists,
    boardMemberships,
    boardAndCardMemberships,
    boardAndTaskMemberships,
    allLabels,
    priority,
    allPriorities,
    parent,
    childCards,
    pickableHeroes,
    canEdit,
    canEditCommentActivities,
    canEditAllCommentActivities,
    commentMode,
    commentCount,
    url,
    closestTaskDueDate,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    onUserPrefsUpdate,
    onUpdate,
    onMove,
    onTransfer,
    onDuplicate,
    onArchive,
    onDelete,
    onUserAdd,
    onUserRemove,
    onBoardFetch,
    onCardFetch,
    onLabelAdd,
    onLabelRemove,
    onLabelCreate,
    onLabelUpdate,
    onLabelDelete,
    onTaskCreate,
    onTaskUpdate,
    onTaskDuplicate,
    onTaskMove,
    onTaskDelete,
    onUserToTaskAdd,
    onUserFromTaskRemove,
    onAttachmentCreate,
    onAttachmentUpdate,
    onAttachmentDelete,
    onActivitiesFetch,
    onCommentsFetch,
    onCommentActivityCreate,
    onCommentActivityUpdate,
    onCommentActivityDelete,
    onCreateTimeEntry,
    onClose,
  }) => {
    const [t] = useTranslation();
    const navigate = useNavigate();

    const handleSelectChild = useCallback(
      (childId) => {
        navigate(Paths.CARDS.replace(':id', childId));
      },
      [navigate],
    );

    const isGalleryOpened = useRef(false);
    const nameEdit = useRef(null);
    const dropdown = useRef(null);
    const tasksRef = useRef(null);
    const descEditRef = useRef(null);
    const descriptionEditButtonRef = useRef(null);
    const didMountRef = useRef(false);
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

    useEffect(() => {
      if (!didMountRef.current) {
        didMountRef.current = true;
        return;
      }
      onBoardFetch(boardId);
    }, [boardId, onBoardFetch]);

    // Attachments are excluded from the board payload, so fetch the full set when a card is opened
    useEffect(() => {
      onCardFetch(id);
    }, [id, onCardFetch]);

    const handleToggleDescShown = useCallback(() => {
      toggleDescShown();
      onUserPrefsUpdate({ descriptionShown: !descShown });
    }, [descShown, onUserPrefsUpdate, toggleDescShown]);

    const handleToggleTasksShown = useCallback(() => {
      toggleTasksShown();
      onUserPrefsUpdate({ tasksShown: !taskShown });
    }, [taskShown, onUserPrefsUpdate, toggleTasksShown]);

    const handleToggleAttacShown = useCallback(() => {
      toggleAttacShown();
      onUserPrefsUpdate({ attachmentsShown: !attacShown });
    }, [attacShown, onUserPrefsUpdate, toggleAttacShown]);

    const handleToggleCommShown = useCallback(() => {
      toggleCommShown();
      onUserPrefsUpdate({ commentsShown: !commShown });
    }, [commShown, onUserPrefsUpdate, toggleCommShown]);

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

    const handleStartDateUpdate = useCallback(
      (newStartDate) => {
        onUpdate({
          startDate: newStartDate,
        });
      },
      [onUpdate],
    );

    const [timeTotalMinutes, setTimeTotalMinutes] = useState(0);

    useEffect(() => {
      let isCancelled = false;

      api
        .getCardTimeEntries(id, { Authorization: `Bearer ${getAccessToken()}` })
        .then((body) => {
          if (!isCancelled) {
            setTimeTotalMinutes(body.totalMinutes);
          }
        })
        .catch(() => {});

      return () => {
        isCancelled = true;
      };
    }, [id]);

    const handleCreateTimeEntryClick = useCallback(() => {
      onCreateTimeEntry();
    }, [onCreateTimeEntry]);

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
        tasksRef.current?.openTaskAdd();
      }, 0);
      return () => clearTimeout(timeout);
    }, [handleToggleTasksShown, taskShown]);

    const handleNameEdit = useCallback(() => {
      if (canEdit) {
        nameEdit.current?.open();
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
        dropdown.current?.open();
      }
    }, [canEdit]);

    const handleDescButtonClick = useCallback(() => {
      if (!descShown) {
        handleToggleDescShown();
      }
      if (!isDescOpened) {
        setIsDescOpened(true);
      } else if (descEditRef.current) {
        descEditRef.current?.focus();
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

    useEffect(() => {
      registerDescriptionOpenHandler(() => {
        setIsDescOpened(true);
      });
    }, []);

    const userIds = users.map((user) => user.id);
    const labelIds = labels.map((label) => label.id);

    const headerNode = (
      <div className={s.header}>
        {childCards.length > 0 && <div className={s.heroCardBanner}>{t('common.heroCardBanner')}</div>}
        <div className={s.headerFirstLine}>
          <Button style={ButtonStyle.Icon} title={isSubscribed ? t('action.unsubscribe') : t('action.subscribe')} onClick={handleToggleSubscriptionClick} className={s.headerNotificationsButton}>
            <Icon type={isSubscribed ? IconType.Bell : IconType.BellEmpty} size={IconSize.Size14} className={s.headerNotificationsIcon} />
          </Button>
          <div className={s.headerTitleWrapper}>
            <NameField defaultValue={name} onUpdate={handleNameUpdate} ref={nameEdit}>
              {/*  eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
              <div className={clsx(s.headerTitle, canEdit && gs.cursorPointer)} onClick={handleNameEdit} title={name}>
                <LinkifiedTextRenderer text={name} iconClassName={s.linkIcon} />
              </div>
            </NameField>
          </div>
          {canEdit && (
            <DeletePopup
              title={t('common.deleteCard', { context: 'title' })}
              content={t('common.areYouSureYouWantToDeleteThisCard')}
              buttonContent={t('action.deleteCard')}
              onConfirm={onDelete}
              position="left-start"
              offset={0}
            >
              <Button style={ButtonStyle.Icon} title={t('common.deleteCard', { context: 'title' })}>
                <Icon type={IconType.Trash} size={IconSize.Size14} />
              </Button>
            </DeletePopup>
          )}
          {canEdit && (
            <ActionsPopup
              card={{
                id,
                name,
                dueDate,
                timer,
                boardId,
                listId,
                projectId,
              }}
              allBoardMemberships={boardAndCardMemberships}
              boardMemberships={boardMemberships}
              currentUserIds={users.map((user) => user.id)}
              labels={allLabels}
              currentLabelIds={labels.map((label) => label.id)}
              url={url}
              canEdit={canEdit}
              createdAt={createdAt}
              createdBy={createdBy}
              updatedAt={updatedAt}
              updatedBy={updatedBy}
              activities={activities}
              isActivitiesFetching={isActivitiesFetching}
              isAllActivitiesFetched={isAllActivitiesFetched}
              onActivitiesFetch={onActivitiesFetch}
              onNameEdit={handleNameEdit}
              onUpdate={onUpdate}
              onMove={onMove}
              onTransfer={onTransfer}
              onDuplicate={onDuplicate}
              onArchive={onArchive}
              onDelete={onDelete}
              onUserAdd={onUserAdd}
              onUserRemove={onUserRemove}
              onBoardFetch={onBoardFetch}
              onLabelAdd={onLabelAdd}
              onLabelRemove={onLabelRemove}
              onLabelCreate={onLabelCreate}
              onLabelUpdate={onLabelUpdate}
              onLabelDelete={onLabelDelete}
              position="left-start"
              offset={0}
              hideCloseButton
            >
              <Button style={ButtonStyle.Icon} title={t('common.editCard')}>
                <Icon type={IconType.EllipsisVertical} size={IconSize.Size14} />
              </Button>
            </ActionsPopup>
          )}
          <Button style={ButtonStyle.Icon} title={t('common.closeCard')} onClick={handleClose}>
            <Icon type={IconType.Close} size={IconSize.Size14} />
          </Button>
        </div>
        <div className={s.headerListFieldWrapper}>
          <Dropdown
            ref={dropdown}
            style={DropdownStyle.FullWidth}
            options={selectedBoard.lists.map((list) => ({
              name: list.name,
              id: list.id,
            }))}
            placeholder={selectedList?.name || ''}
            defaultItem={selectedList}
            isSearchable
            onChange={(list) => onMove(list.id)}
            selectFirstOnSearch
            dropdownMenuClassName={s.dropdownMenu}
          >
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div className={clsx(canEdit && gs.cursorPointer)} onClick={handleDropdownClick}>
              <div className={clsx(s.headerListField)} title={selectedList?.name}>
                {selectedList?.name}
              </div>
              <Icon type={IconType.TriangleDown} title={t('common.moveCardToList')} size={IconSize.Size10} className={s.headerListFieldIcon} />
            </div>
          </Dropdown>
        </div>
      </div>
    );

    const visibleMembersCount = 5;
    const membersNode = (
      <div className={s.headerItems}>
        <div className={s.text}>
          {t('common.members', { context: 'title' })}
          {canEdit && (
            <div className={s.popupWrapper}>
              <MembershipsPopup items={boardAndCardMemberships} currentUserIds={userIds} memberships={boardMemberships} onUserSelect={onUserAdd} onUserDeselect={onUserRemove} offset={0}>
                <Button style={ButtonStyle.Icon} title={t('common.addMember')}>
                  <Icon type={IconType.Plus} size={IconSize.Size10} className={s.iconAddButton2} />
                </Button>
              </MembershipsPopup>
            </div>
          )}
        </div>
        <MembershipsPopup items={boardAndCardMemberships} currentUserIds={userIds} memberships={boardMemberships} onUserSelect={onUserAdd} onUserDeselect={onUserRemove} offset={0} disabled={!canEdit}>
          {users.slice(0, visibleMembersCount).map((user, index) => (
            <span key={user.id} className={clsx(s.headerItem, s.user, users.length <= visibleMembersCount && users.length === index + 1 && s.lastUser)}>
              <User name={user.name} avatarUrl={user.avatarUrl} size="small" isMember={boardMemberships.some((m) => m.user?.id === user.id)} isNotMemberTitle={t('common.noLongerBoardMember')} />
            </span>
          ))}
          {users.length > visibleMembersCount && (
            <span
              className={clsx(s.headerItem, s.user, s.moreUsers)}
              title={users
                .slice(visibleMembersCount)
                .map((user) => user.name)
                .join(',\n')}
            >
              +{users.length - visibleMembersCount}
            </span>
          )}
        </MembershipsPopup>
      </div>
    );

    const labelsNode = (
      <div className={clsx(s.headerItems, s.headerItemsInline)}>
        <div className={clsx(s.text, s.textInline)}>
          {t('common.labels', { context: 'title' })}
          {canEdit && (
            <div className={s.popupWrapper}>
              <LabelsPopup
                items={allLabels}
                currentIds={labelIds}
                canEdit={canEdit}
                onSelect={onLabelAdd}
                onDeselect={onLabelRemove}
                onCreate={onLabelCreate}
                onUpdate={onLabelUpdate}
                onDelete={onLabelDelete}
                offset={0}
              >
                <Button style={ButtonStyle.Icon} title={t('common.addLabel')}>
                  <Icon type={IconType.Plus} size={IconSize.Size10} className={s.iconAddButton2} />
                </Button>
              </LabelsPopup>
            </div>
          )}
        </div>
        <LabelsPopup
          items={allLabels}
          currentIds={labelIds}
          canEdit={canEdit}
          onSelect={onLabelAdd}
          onDeselect={onLabelRemove}
          onCreate={onLabelCreate}
          onUpdate={onLabelUpdate}
          onDelete={onLabelDelete}
          offset={0}
          disabled={!canEdit}
        >
          {labels.map((label) => (
            <span key={label.id} className={s.headerItem}>
              <Label name={label.name} color={label.color} variant="cardModal" isClickable={canEdit} />
            </span>
          ))}
        </LabelsPopup>
      </div>
    );

    const priorityOptions = [{ id: 'none', name: t('common.noPriority') }, ...allPriorities.map((p) => ({ id: p.id, name: p.name }))];
    const priorityDefaultItem = priority ? { id: priority.id, name: priority.name } : { id: 'none', name: t('common.noPriority') };

    const heroOptions = [{ id: 'none', name: t('common.noHero') }, ...pickableHeroes];
    const heroDefaultItem = parent ? { id: parent.id, name: parent.name } : { id: 'none', name: t('common.noHero') };

    // Unified hierarchy block: the card's parent (Hero) and its children rendered as two
    // clearly-separated rows within one section. Keeps both related concepts together
    // instead of scattered among other subsections.
    const hierarchyNode = (
      <div className={s.hierarchyBlock}>
        <div className={s.hierarchyRow}>
          <div className={s.text}>{t('common.hero_title', { context: 'title' })}</div>
          {canEdit ? (
            <Dropdown
              key={parent ? parent.id : 'none'}
              style={DropdownStyle.FullWidth}
              options={heroOptions}
              placeholder={heroDefaultItem.name}
              defaultItem={heroDefaultItem}
              isSearchable
              onChange={(option) => onUpdate({ parentCardId: option.id === 'none' ? null : option.id })}
            />
          ) : (
            <span className={s.headerItem}>{parent ? parent.name : t('common.noHero')}</span>
          )}
        </div>
        {childCards.length > 0 && (
          <div className={s.hierarchyRow}>
            <div className={s.text}>
              {t('common.heroChildren_title', { context: 'title' })} ({childCards.length})
            </div>
            <div className={s.heroChildrenList}>
              {childCards.map((child) => (
                <Button key={child.id} style={ButtonStyle.Default} title={child.name} onClick={() => handleSelectChild(child.id)} className={s.heroChildrenItem}>
                  {child.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );

    const priorityNode = (
      <div className={s.headerItems}>
        <div className={s.text}>{t('common.priority_title', { context: 'title' })}</div>
        {canEdit ? (
          <Dropdown
            key={priority ? priority.id : 'none'}
            style={DropdownStyle.FullWidth}
            options={priorityOptions}
            placeholder={priorityDefaultItem.name}
            defaultItem={priorityDefaultItem}
            isSearchable
            onChange={(option) => onUpdate({ priority: option.id === 'none' ? null : option.id })}
          />
        ) : (
          <span className={s.headerItem}>{priority ? <Priority name={priority.name} color={priority.color} /> : t('common.noPriority')}</span>
        )}
      </div>
    );

    const dueDateNode = (
      <div className={s.headerItems}>
        <div className={s.text}>
          {t('common.dueDate', { context: 'title' })}
          {canEdit && (
            <div className={s.popupWrapper}>
              <DueDateEditPopup defaultValue={dueDate} onUpdate={handleDueDateUpdate} offset={0}>
                <Button style={ButtonStyle.Icon} title={dueDate ? t('common.editDueDate') : t('common.addDueDate')}>
                  <Icon type={dueDate ? IconType.Pencil : IconType.Plus} size={IconSize.Size10} className={s.iconAddButton2} />
                </Button>
              </DueDateEditPopup>
            </div>
          )}
        </div>
        <span className={s.headerItem}>
          <DueDateEditPopup defaultValue={dueDate} onUpdate={handleDueDateUpdate} disabled={!canEdit}>
            <DueDate value={dueDate} isClickable={canEdit} />
          </DueDateEditPopup>
        </span>
      </div>
    );

    const startDateNode = (
      <div className={s.headerItems}>
        <div className={s.text}>
          {t('common.startDate', { context: 'title' })}
          {canEdit && (
            <div className={s.popupWrapper}>
              <DueDateEditPopup defaultValue={startDate} onUpdate={handleStartDateUpdate} offset={0}>
                <Button style={ButtonStyle.Icon} title={startDate ? t('common.editStartDate') : t('common.addStartDate')}>
                  <Icon type={startDate ? IconType.Pencil : IconType.Plus} size={IconSize.Size10} className={s.iconAddButton2} />
                </Button>
              </DueDateEditPopup>
            </div>
          )}
        </div>
        <span className={s.headerItem}>
          <DueDateEditPopup defaultValue={startDate} onUpdate={handleStartDateUpdate} disabled={!canEdit}>
            <DueDate value={startDate} isClickable={canEdit} />
          </DueDateEditPopup>
        </span>
      </div>
    );

    const timeNode = (
      <div className={s.headerItems}>
        <div className={s.text}>
          {t('common.time', { context: 'title' })}
          {canEdit && (
            <div className={s.popupWrapper}>
              <Button style={ButtonStyle.Icon} title={t('common.addTimeEntry', { context: 'title' })} onClick={handleCreateTimeEntryClick}>
                <Icon type={IconType.Plus} size={IconSize.Size10} className={s.iconAddButton2} />
              </Button>
            </div>
          )}
        </div>
        <span className={s.headerItem}>{formatDuration(timeTotalMinutes)}</span>
      </div>
    );

    const createdNode = (
      <div className={s.headerItems}>
        <div className={s.text}>{t('common.created')}</div>
        <span className={clsx(s.headerItem, s.activity)}>
          {createdBy && (
            <User
              name={createdBy.name}
              avatarUrl={createdBy.avatarUrl}
              size="small"
              isMember={boardMemberships.some((m) => m.user?.id === createdBy.id)}
              isNotMemberTitle={t('common.noLongerBoardMember')}
              className={s.activityItem}
            />
          )}
          {createdAt && <DueDate value={createdAt} variant="cardModalActivity" showRelative />}
        </span>
      </div>
    );

    const updatedNode = (
      <div className={s.headerItems}>
        <div className={s.text}>{t('common.updated')}</div>
        <span className={clsx(s.headerItem, s.activity)}>
          {updatedBy && (
            <User
              name={updatedBy.name}
              avatarUrl={updatedBy.avatarUrl}
              size="small"
              isMember={boardMemberships.some((m) => m.user?.id === updatedBy.id)}
              isNotMemberTitle={t('common.noLongerBoardMember')}
              className={s.activityItem}
            />
          )}
          {updatedAt && <DueDate value={updatedAt} variant="cardModalActivity" showRelative />}
        </span>
      </div>
    );

    const descriptionEditOpenNode = description ? (
      <Button title={t('common.editDescription')} onClick={handleDescClick} className={clsx(s.descriptionText, s.cursorPointer)} ref={descriptionEditButtonRef}>
        <MDPreview source={description} isGithubConnected={isGithubConnected} githubRepo={githubRepo} preferredDetailsFont={preferredDetailsFont} />
      </Button>
    ) : (
      <Button style={ButtonStyle.Default} title={t('common.addDescription')} onClick={handleDescClick} className={s.descriptionButton}>
        <span className={s.descriptionButtonText}>{t('action.addDescription')}</span>
      </Button>
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
        descriptionMode={descriptionMode}
        userId={userId}
        onUserPrefsUpdate={onUserPrefsUpdate}
        isGithubConnected={isGithubConnected}
        githubRepo={githubRepo}
        preferredDetailsFont={preferredDetailsFont}
      />
    ) : (
      descriptionEditOpenNode
    );

    const descriptionNode = (
      <div>
        <div className={s.moduleHeader}>
          <Icon type={IconType.BarsStaggered} size={IconSize.Size20} className={s.moduleIcon} />
          {t('common.description')}
          {canEdit && (
            <Button style={ButtonStyle.Icon} title={description ? t('common.editDescription') : t('common.addDescription')} onClick={handleDescButtonClick}>
              <Icon type={description ? IconType.Pencil : IconType.Plus} size={IconSize.Size10} className={s.iconAddButton} />
            </Button>
          )}
          {canEdit && unsavedDesc && <span className={s.localChangesLoaded}>{t('common.unsavedChanges')}</span>}
          <Button style={ButtonStyle.Icon} title={t('common.toggleDescription')} onClick={handleToggleDescShown} className={s.buttonToggle} aria-expanded={descShown}>
            <Icon type={IconType.TriangleDown} size={IconSize.Size10} className={clsx(s.moduleChevron, !descShown && s.moduleChevronCollapsed)} />
          </Button>
        </div>
        <div>
          {descShown && canEdit && descriptionEditNode}
          {descShown && !canEdit && description && (
            <div className={s.descriptionText}>
              <MDPreview source={description} isGithubConnected={isGithubConnected} githubRepo={githubRepo} preferredDetailsFont={preferredDetailsFont} />
            </div>
          )}
        </div>
      </div>
    );

    const completedTasks = tasks.filter((task) => task.isCompleted);

    const tasksNode = (
      <div>
        <div className={s.moduleHeader}>
          <Icon type={IconType.Check} size={IconSize.Size20} className={s.moduleIcon} />
          {t('common.tasks')}
          {tasks.length > 0 && closestTaskDueDate && (
            <div className={s.taskDueDateSummaryWrapper}>
              <DueDate variant="tasksCard" value={closestTaskDueDate} titlePrefix={t('common.dueDateSummary')} iconSize={IconSize.Size12} />
            </div>
          )}
          {tasks.length > 0 && (
            <div className={s.headerCount}>
              ({completedTasks.length}/{tasks.length})
            </div>
          )}
          {canEdit && (
            <Button style={ButtonStyle.Icon} title={t('common.addTask')} onClick={handleTaskAddOpen}>
              <Icon type={IconType.Plus} size={IconSize.Size10} className={s.iconAddButton} />
            </Button>
          )}
          <Button style={ButtonStyle.Icon} title={t('common.toggleTasks')} onClick={handleToggleTasksShown} className={s.buttonToggle} aria-expanded={taskShown}>
            <Icon type={IconType.TriangleDown} size={IconSize.Size10} className={clsx(s.moduleChevron, !taskShown && s.moduleChevronCollapsed)} />
          </Button>
        </div>
        <div>
          {taskShown && (
            <Tasks
              ref={tasksRef}
              variant="cardModal"
              cardId={id}
              cardName={name}
              items={tasks}
              canEdit={canEdit}
              allBoardMemberships={boardAndTaskMemberships}
              boardMemberships={boardMemberships}
              allPriorities={allPriorities}
              isActivitiesFetching={isActivitiesFetching}
              isAllActivitiesFetched={isAllActivitiesFetched}
              onCreate={onTaskCreate}
              onUpdate={onTaskUpdate}
              onMove={onTaskMove}
              onDuplicate={onTaskDuplicate}
              onDelete={onTaskDelete}
              onUserAdd={onUserToTaskAdd}
              onUserRemove={onUserFromTaskRemove}
              onActivitiesFetch={onActivitiesFetch}
            />
          )}
        </div>
      </div>
    );

    const attachmentsNode = (
      <div>
        <div className={s.moduleHeader}>
          <Icon type={IconType.Attach} size={IconSize.Size20} className={s.moduleIcon} />
          {t('common.attachments')}
          {attachments.length > 0 && <div className={s.headerCount}>({attachments.length})</div>}
          {canEdit && (
            <AttachmentAdd onCreate={onAttachmentCreate}>
              <Button style={ButtonStyle.Icon} title={t('common.addAttachmentButton')}>
                <Icon type={IconType.Plus} size={IconSize.Size10} className={s.iconAddButton} />
              </Button>
            </AttachmentAdd>
          )}
          <Button style={ButtonStyle.Icon} title={t('common.toggleAttachments')} onClick={handleToggleAttacShown} className={s.buttonToggle} aria-expanded={attacShown}>
            <Icon type={IconType.TriangleDown} size={IconSize.Size10} className={clsx(s.moduleChevron, !attacShown && s.moduleChevronCollapsed)} />
          </Button>
        </div>
        <div>
          {attacShown && (
            <>
              <Attachments
                cardId={id}
                cardName={name}
                items={attachments}
                canEdit={canEdit}
                isActivitiesFetching={isActivitiesFetching}
                isAllActivitiesFetched={isAllActivitiesFetched}
                boardMemberships={boardMemberships}
                onUpdate={onAttachmentUpdate}
                onDelete={onAttachmentDelete}
                onCoverUpdate={handleCoverUpdate}
                onGalleryOpen={handleGalleryOpen}
                onGalleryClose={handleGalleryClose}
                onActivitiesFetch={onActivitiesFetch}
              />
              {canEdit && (
                <AttachmentAdd onCreate={onAttachmentCreate}>
                  <Button style={ButtonStyle.Default} title={t('common.addAttachmentButton')} className={s.addAttachmentButton}>
                    {t('common.addAttachment')} <span className={s.hint}>{t('common.addAttachmentExtra')}</span>
                  </Button>
                </AttachmentAdd>
              )}
            </>
          )}
        </div>
      </div>
    );

    const commentsNode = (
      <Comments
        cardId={id}
        cardName={name}
        items={comments}
        isCommentsFetching={isCommentsFetching}
        isAllCommentsFetched={isAllCommentsFetched}
        isActivitiesFetching={isActivitiesFetching}
        isAllActivitiesFetched={isAllActivitiesFetched}
        canEdit={canEditCommentActivities}
        canEditAllComments={canEditAllCommentActivities}
        commentMode={commentMode}
        isGithubConnected={isGithubConnected}
        githubRepo={githubRepo}
        commentCount={commentCount}
        preferredDetailsFont={preferredDetailsFont}
        boardMemberships={boardMemberships}
        onCommentsFetch={onCommentsFetch}
        onActivitiesFetch={onActivitiesFetch}
        onCommentCreate={onCommentActivityCreate}
        onCommentUpdate={onCommentActivityUpdate}
        onCommentDelete={onCommentActivityDelete}
        toggleCommShown={handleToggleCommShown}
        commShown={commShown}
        onUserPrefsUpdate={onUserPrefsUpdate}
      />
    );

    // The first image attachment doubles as the card's visual: a small thumbnail
    // in the list tells you nothing about a screenshot, so it also renders at a
    // readable size under the description. The list keeps its own thumbnail.
    const previewAttachment = attachments.find((attachment) => attachment.image && attachment.url);

    const contentNode = (
      <div className={s.flexContainer}>
        {headerNode}
        {/* Two columns: set-once metadata moves to a sidebar so the main column
            opens on Description -> Tasks -> Attachments -> Comments instead of
            having the attribute rows push them below the fold. */}
        <div className={clsx(s.mainContainer, gs.scrollableY)}>
          <div className={s.columns}>
            <div className={s.mainColumn}>
              <div className={s.moduleContainer}>
                {labelsNode}
                {descriptionNode}
                {previewAttachment && (
                  <div className={s.descriptionPreview}>
                    <img src={previewAttachment.url} alt={previewAttachment.name} title={previewAttachment.name} className={s.descriptionPreviewImage} />
                  </div>
                )}
                <hr className={s.hr} />
              </div>
              <div className={s.moduleContainer}>
                {tasksNode}
                <hr className={s.hr} />
              </div>
              <div className={s.moduleContainer}>
                {commentsNode}
                <hr className={s.hr} />
              </div>
              <div className={s.moduleContainer}>{attachmentsNode}</div>
            </div>
            <aside className={s.sideColumn}>
              {membersNode}
              {priorityNode}
              <div className={s.sideRow}>
                {startDateNode}
                {dueDateNode}
              </div>
              {timeNode}
              <CardLinksContainer cardId={id} canEdit={canEdit} />
              {hierarchyNode}
              {(!hideCardModalActivity || updatedAt || updatedBy) && (
                <div className={s.sideFoot}>
                  {!hideCardModalActivity && createdNode}
                  {!hideCardModalActivity && (updatedAt || updatedBy) && updatedNode}
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    );

    return <div className={s.wrapper}>{canEdit ? <AttachmentAddZone onCreate={onAttachmentCreate}>{contentNode}</AttachmentAddZone> : contentNode}</div>;
  },
);

CardModal.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  description: PropTypes.string,
  dueDate: PropTypes.instanceOf(Date),
  startDate: PropTypes.instanceOf(Date),
  timer: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  isSubscribed: PropTypes.bool.isRequired,
  isActivitiesFetching: PropTypes.bool.isRequired,
  isAllActivitiesFetched: PropTypes.bool.isRequired,
  isCommentsFetching: PropTypes.bool.isRequired,
  isAllCommentsFetched: PropTypes.bool.isRequired,
  listId: PropTypes.string.isRequired,
  boardId: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
  users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  labels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  tasks: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  attachments: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  comments: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  activities: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  descriptionMode: PropTypes.string.isRequired,
  descriptionShown: PropTypes.bool.isRequired,
  tasksShown: PropTypes.bool.isRequired,
  attachmentsShown: PropTypes.bool.isRequired,
  commentsShown: PropTypes.bool.isRequired,
  hideCardModalActivity: PropTypes.bool.isRequired,
  preferredDetailsFont: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  isGithubConnected: PropTypes.bool.isRequired,
  githubRepo: PropTypes.string.isRequired,
  allProjectsToLists: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardAndCardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardAndTaskMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allLabels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  priority: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  allPriorities: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  parent: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  childCards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  pickableHeroes: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  canEditCommentActivities: PropTypes.bool.isRequired,
  canEditAllCommentActivities: PropTypes.bool.isRequired,
  commentMode: PropTypes.string.isRequired,
  commentCount: PropTypes.number.isRequired,
  url: PropTypes.string.isRequired,
  closestTaskDueDate: PropTypes.instanceOf(Date),
  createdAt: PropTypes.instanceOf(Date),
  createdBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.instanceOf(Date),
  updatedBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onUserPrefsUpdate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onTransfer: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onArchive: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onBoardFetch: PropTypes.func.isRequired,
  onCardFetch: PropTypes.func.isRequired,
  onLabelAdd: PropTypes.func.isRequired,
  onLabelRemove: PropTypes.func.isRequired,
  onLabelCreate: PropTypes.func.isRequired,
  onLabelUpdate: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
  onTaskCreate: PropTypes.func.isRequired,
  onTaskUpdate: PropTypes.func.isRequired,
  onTaskDuplicate: PropTypes.func.isRequired,
  onTaskMove: PropTypes.func.isRequired,
  onTaskDelete: PropTypes.func.isRequired,
  onUserToTaskAdd: PropTypes.func.isRequired,
  onUserFromTaskRemove: PropTypes.func.isRequired,
  onAttachmentCreate: PropTypes.func.isRequired,
  onAttachmentUpdate: PropTypes.func.isRequired,
  onAttachmentDelete: PropTypes.func.isRequired,
  onActivitiesFetch: PropTypes.func.isRequired,
  onCommentsFetch: PropTypes.func.isRequired,
  onCommentActivityCreate: PropTypes.func.isRequired,
  onCommentActivityUpdate: PropTypes.func.isRequired,
  onCommentActivityDelete: PropTypes.func.isRequired,
  onCreateTimeEntry: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

CardModal.defaultProps = {
  description: undefined,
  dueDate: undefined,
  startDate: undefined,
  timer: undefined,
  priority: undefined,
  parent: undefined,
  closestTaskDueDate: undefined,
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
};

export default CardModal;
