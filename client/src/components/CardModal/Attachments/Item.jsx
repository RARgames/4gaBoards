import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import ActivityPopup from '../../ActivityPopup';
import DeletePopup from '../../DeletePopup';
import { Button, ButtonStyle, Icon, IconType, IconSize, Loader, LoaderSize } from '../../Utils';
import EditPopup from './EditPopup';

import * as s from './Item.module.scss';

const Item = React.forwardRef(
  (
    {
      cardId,
      cardName,
      name,
      url,
      coverUrl,
      isCover,
      isPersisted,
      canEdit,
      activities,
      isActivitiesFetching,
      isAllActivitiesFetched,
      createdAt,
      createdBy,
      updatedAt,
      updatedBy,
      boardMemberships,
      onCoverSelect,
      onCoverDeselect,
      onClick,
      onUpdate,
      onDelete,
      onActivitiesFetch,
    },
    ref,
  ) => {
    const [t] = useTranslation();

    const handleClick = useCallback(() => {
      if (onClick) {
        onClick();
      } else {
        window.open(url, '_blank');
      }
    }, [onClick, url]);

    const handleToggleCoverClick = useCallback(() => {
      if (isCover) {
        onCoverDeselect();
      } else {
        onCoverSelect();
      }
    }, [isCover, onCoverSelect, onCoverDeselect]);

    if (!isPersisted) {
      return (
        <div className={clsx(s.wrapper, s.wrapperSubmitting)}>
          <Loader size={LoaderSize.Normal} />
        </div>
      );
    }

    const filename = url.split('/').pop();
    const extension = filename.slice((Math.max(0, filename.lastIndexOf('.')) || Infinity) + 1);

    return (
      <div ref={ref} className={s.wrapper}>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div className={s.thumbnail} style={{ background: coverUrl && `url("${coverUrl}") center / cover` }} onClick={handleClick}>
          {coverUrl ? (
            isCover && (
              <div className={s.imageSelected}>
                <Icon type={IconType.Star} size={IconSize.Size14} className={s.imageIcon} />
              </div>
            )
          ) : (
            <span className={s.extension}>{extension || '-'}</span>
          )}
        </div>
        <div className={s.details}>
          <span className={s.name}>{name}</span>
          <span className={s.date}>{t('format:dateTime', { postProcess: 'formatDate', value: createdAt })}</span>
          {coverUrl && canEdit && (
            <Button
              style={ButtonStyle.NoBackground}
              title={isCover ? t('action.removeCover', { context: 'title' }) : t('action.makeCover', { context: 'title' })}
              onClick={handleToggleCoverClick}
              className={s.optionButton}
            >
              <Icon type={IconType.WindowMaximize} size={IconSize.Size10} className={s.optionIcon} />
              <span className={s.optionText}>{isCover ? t('action.removeCover', { context: 'title' }) : t('action.makeCover', { context: 'title' })}</span>
            </Button>
          )}
        </div>
        {canEdit && (
          <div className={s.buttons}>
            <ActivityPopup
              title={t('common.activityFor', { name })}
              createdAt={createdAt}
              createdBy={createdBy}
              updatedAt={updatedAt}
              updatedBy={updatedBy}
              memberships={boardMemberships}
              isNotMemberTitle={t('common.noLongerBoardMember')}
              cardId={cardId}
              cardName={cardName}
              activities={activities}
              isFetching={isActivitiesFetching}
              isAllFetched={isAllActivitiesFetched}
              onFetch={onActivitiesFetch}
              position="left-start"
              offset={0}
            >
              <Button style={ButtonStyle.Icon} title={t('common.checkActivity')} disabled={!isPersisted} className={s.target}>
                <Icon type={IconType.Activity} size={IconSize.Size10} />
              </Button>
            </ActivityPopup>
            <EditPopup defaultData={{ name }} onUpdate={onUpdate} position="left-start" offset={0}>
              <Button style={ButtonStyle.Icon} title={t('common.editAttachmentName')} className={s.target}>
                <Icon type={IconType.Pencil} size={IconSize.Size10} />
              </Button>
            </EditPopup>
            <DeletePopup
              title={t('common.deleteAttachment', { context: 'title' })}
              content={t('common.areYouSureYouWantToDeleteThisAttachment')}
              buttonContent={t('action.deleteAttachment')}
              onConfirm={onDelete}
              position="left-start"
              offset={0}
            >
              <Button style={ButtonStyle.Icon} title={t('common.deleteAttachment', { context: 'title' })} disabled={!isPersisted} className={s.target}>
                <Icon type={IconType.Trash} size={IconSize.Size10} />
              </Button>
            </DeletePopup>
          </div>
        )}
      </div>
    );
  },
);

Item.propTypes = {
  cardId: PropTypes.string.isRequired,
  cardName: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  url: PropTypes.string,
  coverUrl: PropTypes.string,
  isCover: PropTypes.bool.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  activities: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isActivitiesFetching: PropTypes.bool.isRequired,
  isAllActivitiesFetched: PropTypes.bool.isRequired,
  createdAt: PropTypes.instanceOf(Date),
  createdBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.instanceOf(Date),
  updatedBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onClick: PropTypes.func,
  onCoverSelect: PropTypes.func.isRequired,
  onCoverDeselect: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onActivitiesFetch: PropTypes.func.isRequired,
};

Item.defaultProps = {
  url: undefined,
  coverUrl: undefined,
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
  onClick: undefined,
};

export default React.memo(Item);
