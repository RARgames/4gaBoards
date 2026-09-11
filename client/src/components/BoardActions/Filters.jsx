import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFloating, autoUpdate, offset as posOffset, flip, shift, useDismiss, useInteractions, FloatingPortal } from '@floating-ui/react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import DueDate from '../DueDate';
import FiltersDueDatePopup from '../FiltersDueDatePopup';
import Label from '../Label';
import LabelsPopup from '../LabelsPopup';
import MembershipsPopup from '../MembershipsPopup';
import PrioritiesFilterPopup from '../PrioritiesFilterPopup';
import Priority from '../Priority';
import User from '../User';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';

import * as s from './Filters.module.scss';

const Filters = React.memo(
  ({
    users,
    labels,
    priorities,
    allBoardMemberships,
    boardMemberships,
    allLabels,
    allPriorities,
    canEdit,
    dueDate,
    justSelectedDay,
    onUserAdd,
    onUserRemove,
    onLabelAdd,
    onLabelRemove,
    onPriorityAdd,
    onPriorityRemove,
    onLabelCreate,
    onLabelUpdate,
    onLabelDelete,
    onBoardSearchParamsUpdate,
  }) => {
    const [t] = useTranslation();
    const [dueDateValue, setDueDateValue] = useState(dueDate);
    const [justSelectedDayValue, setJustSelectedDayValue] = useState(justSelectedDay);
    // The four filters collapse behind one control. Closed, the badge says how
    // many are set; open, each row shows what it is set to.
    const [isOpen, setIsOpen] = useState(false);

    const handleToggleClick = useCallback(() => {
      setIsOpen((prev) => !prev);
    }, []);

    const { refs, floatingStyles, context } = useFloating({
      open: isOpen,
      onOpenChange: setIsOpen,
      placement: 'bottom-start',
      middleware: [posOffset(6), flip(), shift({ padding: 8 })],
      whileElementsMounted: autoUpdate,
    });

    const dismiss = useDismiss(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

    const activeCount = users.length + labels.length + priorities.length + (dueDateValue ? 1 : 0);

    const handleRemoveUserClick = useCallback(
      (id) => {
        onUserRemove(id);
      },
      [onUserRemove],
    );

    const handleRemoveAllUsersClick = useCallback(() => {
      users.forEach((user) => onUserRemove(user.id));
    }, [users, onUserRemove]);

    const handleRemoveLabelClick = useCallback(
      (id) => {
        onLabelRemove(id);
      },
      [onLabelRemove],
    );

    const handleRemoveAllLabelsClick = useCallback(() => {
      labels.forEach((label) => onLabelRemove(label.id));
    }, [labels, onLabelRemove]);

    const handleRemovePriorityClick = useCallback(
      (id) => {
        onPriorityRemove(id);
      },
      [onPriorityRemove],
    );

    const handleRemoveAllPrioritiesClick = useCallback(() => {
      priorities.forEach((priority) => onPriorityRemove(priority.id));
    }, [priorities, onPriorityRemove]);

    const handleFilterDueDateChange = useCallback(
      (value, value2) => {
        setDueDateValue(value);
        setJustSelectedDayValue(value2);
        onBoardSearchParamsUpdate({ dueDate: value, justSelectedDay: value2 });
      },
      [onBoardSearchParamsUpdate],
    );

    const handleRemoveDueDateClick = useCallback(() => {
      setDueDateValue(null);
      setJustSelectedDayValue(false);
      onBoardSearchParamsUpdate({ dueDate: null, justSelectedDay: false });
    }, [onBoardSearchParamsUpdate]);

    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <div className={s.wrapper} ref={refs.setReference} {...getReferenceProps()}>
        <Button title={t('common.filters', { context: 'title' })} onClick={handleToggleClick} className={clsx(s.toggle, isOpen && s.toggleOpen)} aria-expanded={isOpen}>
          <Icon type={IconType.Sliders} size={IconSize.Size13} className={s.toggleIcon} />
          <span className={s.toggleLabel}>{t('common.filters', { context: 'title' })}</span>
          {activeCount > 0 && <span className={s.toggleBadge}>{activeCount}</span>}
          <Icon type={IconType.TriangleDown} size={IconSize.Size10} className={clsx(s.toggleChevron, isOpen && s.toggleChevronOpen)} />
        </Button>
        {isOpen && (
          <FloatingPortal>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <div ref={refs.setFloating} style={floatingStyles} className={s.panel} {...getFloatingProps()}>
              <span className={s.filter}>
                <MembershipsPopup
                  items={allBoardMemberships}
                  currentUserIds={users.map((user) => user.id)}
                  title={t('common.filterByMembers', { context: 'title' })}
                  memberships={boardMemberships}
                  onUserSelect={onUserAdd}
                  onUserDeselect={onUserRemove}
                  offset={16}
                  wrapperClassName={s.popupWrapper}
                >
                  <Button title={t('common.filterByMembers', { context: 'title' })} className={s.filterButton}>
                    <span className={s.filterTitle}>
                      <Icon type={IconType.User} size={IconSize.Size13} />
                      <span className={s.filterName}>{t('common.members')}</span>
                    </span>
                  </Button>
                </MembershipsPopup>
                {users.map((user, index) => (
                  <span key={user.id} className={clsx(s.filterItem, index + 1 === users.length && s.lastFilterItem)}>
                    <User
                      name={user.name}
                      avatarUrl={user.avatarUrl}
                      size="tiny"
                      onClick={() => handleRemoveUserClick(user.id)}
                      isMember={boardMemberships.some((m) => m.user?.id === user.id)}
                      isNotMemberTitle={t('common.noLongerBoardMember')}
                      isRemovable
                    />
                  </span>
                ))}
                {users.length > 0 && (
                  <Button style={ButtonStyle.Icon} title={t('common.clearFilter')} onClick={handleRemoveAllUsersClick} className={s.clearButton}>
                    <Icon type={IconType.Close} size={IconSize.Size10} />
                  </Button>
                )}
              </span>
              <span className={s.filter}>
                <LabelsPopup
                  items={allLabels}
                  currentIds={labels.map((label) => label.id)}
                  title={t('common.filterByLabels', { context: 'title' })}
                  canEdit={canEdit}
                  onSelect={onLabelAdd}
                  onDeselect={onLabelRemove}
                  onCreate={onLabelCreate}
                  onUpdate={onLabelUpdate}
                  onDelete={onLabelDelete}
                  offset={16}
                  wrapperClassName={s.popupWrapper}
                >
                  <Button title={t('common.filterByLabels', { context: 'title' })} className={s.filterButton}>
                    <span className={s.filterTitle}>
                      <Icon type={IconType.Label} size={IconSize.Size13} />
                      <span className={s.filterName}>{t('common.labels')}</span>
                    </span>
                  </Button>
                </LabelsPopup>
                {labels.map((label, index) => (
                  <span key={label.id} className={clsx(s.filterItem, index + 1 === labels.length && s.lastFilterItem)}>
                    <Label name={label.name} color={label.color} variant="labels" onClick={() => handleRemoveLabelClick(label.id)} isRemovable />
                  </span>
                ))}
                {labels.length > 0 && (
                  <Button style={ButtonStyle.Icon} title={t('common.clearFilter')} onClick={handleRemoveAllLabelsClick} className={s.clearButton}>
                    <Icon type={IconType.Close} size={IconSize.Size10} />
                  </Button>
                )}
              </span>
              <span className={s.filter}>
                <PrioritiesFilterPopup
                  items={allPriorities}
                  currentIds={priorities.map((priority) => priority.id)}
                  title={t('common.filterByPriorities', { context: 'title' })}
                  onSelect={onPriorityAdd}
                  onDeselect={onPriorityRemove}
                  offset={16}
                  wrapperClassName={s.popupWrapper}
                >
                  <Button title={t('common.filterByPriorities', { context: 'title' })} className={s.filterButton}>
                    <span className={s.filterTitle}>
                      <Icon type={IconType.Star} size={IconSize.Size13} />
                      <span className={s.filterName}>{t('common.priority_title', { context: 'title' })}</span>
                    </span>
                  </Button>
                </PrioritiesFilterPopup>
                {priorities.map((priority, index) => (
                  <span key={priority.id} className={clsx(s.filterItem, index + 1 === priorities.length && s.lastFilterItem)}>
                    <Priority name={priority.name} color={priority.color} variant="card" onClick={() => handleRemovePriorityClick(priority.id)} />
                  </span>
                ))}
                {priorities.length > 0 && (
                  <Button style={ButtonStyle.Icon} title={t('common.clearFilter')} onClick={handleRemoveAllPrioritiesClick} className={s.clearButton}>
                    <Icon type={IconType.Close} size={IconSize.Size10} />
                  </Button>
                )}
              </span>
              <span className={s.filter}>
                <FiltersDueDatePopup
                  title={t('common.filterByDueDate', { context: 'title' })}
                  defaultValue={dueDateValue}
                  justSelectedDayDefaultValue={justSelectedDayValue}
                  onUpdate={handleFilterDueDateChange}
                  offset={16}
                  wrapperClassName={s.popupWrapper}
                >
                  <Button title={t('common.filterByDueDate', { context: 'title' })} className={clsx(s.filterButton, dueDateValue && s.filterButtonDueDateIsFiltered)}>
                    <span className={s.filterTitle}>
                      <Icon type={IconType.Calendar} size={IconSize.Size13} />
                      <span className={s.filterName}>{t('common.dueDate_title', { context: 'title' })}</span>
                    </span>
                    {dueDateValue && (
                      <span className={clsx(s.filterItem, s.lastFilterItem, s.filterItemDueDate)}>
                        <DueDate value={dueDateValue} variant="card" isClickable />
                      </span>
                    )}
                  </Button>
                </FiltersDueDatePopup>
                {dueDateValue && (
                  <Button style={ButtonStyle.Icon} title={t('common.clearFilter')} onClick={handleRemoveDueDateClick} className={clsx(s.clearButton, s.clearButtonDueDate)}>
                    <Icon type={IconType.Close} size={IconSize.Size10} />
                  </Button>
                )}
              </span>
            </div>
          </FloatingPortal>
        )}
      </div>
    );
  },
);

Filters.propTypes = {
  users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  labels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  priorities: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allBoardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allLabels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allPriorities: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  dueDate: PropTypes.instanceOf(Date),
  justSelectedDay: PropTypes.bool,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onLabelAdd: PropTypes.func.isRequired,
  onLabelRemove: PropTypes.func.isRequired,
  onPriorityAdd: PropTypes.func.isRequired,
  onPriorityRemove: PropTypes.func.isRequired,
  onLabelCreate: PropTypes.func.isRequired,
  onLabelUpdate: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
  onBoardSearchParamsUpdate: PropTypes.func.isRequired,
};

Filters.defaultProps = {
  dueDate: undefined,
  justSelectedDay: false,
};

export default Filters;
