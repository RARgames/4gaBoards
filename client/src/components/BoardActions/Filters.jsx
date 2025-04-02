import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import Label from '../Label';
import LabelsPopup from '../LabelsPopup';
import MembershipsPopup from '../MembershipsPopup';
import User from '../User';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';

import * as s from './Filters.module.scss';

const Filters = React.memo(({ users, labels, allBoardMemberships, allLabels, canEdit, onUserAdd, onUserRemove, onLabelAdd, onLabelRemove, onLabelCreate, onLabelUpdate, onLabelDelete }) => {
  const [t] = useTranslation();

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

  return (
    <>
      <span className={s.filter}>
        <MembershipsPopup
          items={allBoardMemberships}
          currentUserIds={users.map((user) => user.id)}
          title={t('common.filterByMembers', { context: 'title' })}
          onUserSelect={onUserAdd}
          onUserDeselect={onUserRemove}
          offset={16}
          wrapperClassName={s.popupWrapper}
        >
          <Button title={t('common.filterByMembers', { context: 'title' })} className={s.filterButton}>
            <span className={s.filterTitle}>
              <Icon type={IconType.User} size={IconSize.Size13} />
            </span>
          </Button>
        </MembershipsPopup>
        {users.map((user, index) => (
          <span key={user.id} className={classNames(s.filterItem, index + 1 === users.length && s.lastFilterItem)}>
            <User name={user.name} avatarUrl={user.avatarUrl} size="tiny" onClick={() => handleRemoveUserClick(user.id)} isRemovable />
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
            </span>
          </Button>
        </LabelsPopup>
        {labels.map((label, index) => (
          <span key={label.id} className={classNames(s.filterItem, index + 1 === labels.length && s.lastFilterItem)}>
            <Label name={label.name} color={label.color} variant="labels" onClick={() => handleRemoveLabelClick(label.id)} isRemovable />
          </span>
        ))}
        {labels.length > 0 && (
          <Button style={ButtonStyle.Icon} title={t('common.clearFilter')} onClick={handleRemoveAllLabelsClick} className={s.clearButton}>
            <Icon type={IconType.Close} size={IconSize.Size10} />
          </Button>
        )}
      </span>
    </>
  );
});

Filters.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  users: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  allBoardMemberships: PropTypes.array.isRequired,
  allLabels: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  canEdit: PropTypes.bool.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onLabelAdd: PropTypes.func.isRequired,
  onLabelRemove: PropTypes.func.isRequired,
  onLabelCreate: PropTypes.func.isRequired,
  onLabelUpdate: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
};

export default Filters;
