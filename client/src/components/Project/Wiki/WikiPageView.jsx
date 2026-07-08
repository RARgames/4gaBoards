import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNowStrict } from 'date-fns';
import PropTypes from 'prop-types';

import { Button, ButtonStyle, Icon, IconType, IconSize, MDEditor, MDPreview, TextArea, TextAreaStyle } from '../../Utils';
import WikiDeleteStep from './WikiDeleteStep';
import WikiHistoryPopup from './WikiHistoryPopup';

import * as gs from '../../../global.module.scss';
import * as s from './WikiPageView.module.scss';

const WikiPageView = React.memo(({ page, updatedByUser, canEdit, preferredDetailsFont, wikiPages, wikiBasePath, onUpdate, onDelete, onRestoreRevision }) => {
  const [t] = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(page.title);
  const [contentValue, setContentValue] = useState(page.content);

  useEffect(() => {
    setIsEditing(false);
    setTitleValue(page.title);
    setContentValue(page.content);
  }, [page.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEditClick = useCallback(() => {
    setTitleValue(page.title);
    setContentValue(page.content);
    setIsEditing(true);
  }, [page]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSave = useCallback(() => {
    const data = {};

    const cleanTitle = titleValue.trim();
    if (cleanTitle && cleanTitle !== page.title) {
      data.title = cleanTitle;
    }

    if (contentValue !== page.content) {
      data.content = contentValue;
    }

    if (Object.keys(data).length > 0) {
      onUpdate(page.id, data);
    }

    setIsEditing(false);
  }, [titleValue, contentValue, page, onUpdate]);

  const handleEditorKeyDown = useCallback(
    (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    },
    [handleSave, handleCancel],
  );

  const handleDeleteConfirm = useCallback(
    (withChildren) => {
      onDelete(page.id, withChildren);
    },
    [page.id, onDelete],
  );

  if (isEditing) {
    return (
      <div className={s.wrapper}>
        <TextArea
          value={titleValue}
          style={TextAreaStyle.Default}
          maxRows={2}
          className={s.titleInput}
          onChange={(e) => setTitleValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
        />
        <MDEditor
          value={contentValue}
          onChange={setContentValue}
          onKeyDown={handleEditorKeyDown}
          height={480}
          preferredDetailsFont={preferredDetailsFont}
          textareaProps={{ placeholder: t('common.enterDescription') }}
        />
        <div className={gs.controls}>
          <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={handleCancel} />
          <Button style={ButtonStyle.Submit} content={t('action.save')} onClick={handleSave} />
        </div>
      </div>
    );
  }

  return (
    <div className={s.wrapper}>
      <div className={s.header}>
        <h1 className={s.title}>{page.title}</h1>
        <div className={s.actions}>
          {canEdit && (
            <Button style={ButtonStyle.Icon} title={t('common.editWikiPage')} onClick={handleEditClick}>
              <Icon type={IconType.Pencil} size={IconSize.Size14} />
            </Button>
          )}
          <WikiHistoryPopup page={page} canEdit={canEdit} onRestoreRevision={onRestoreRevision} offset={5} position="bottom-end">
            <Button style={ButtonStyle.Icon} title={t('common.wikiPageHistory')}>
              <Icon type={IconType.Activity} size={IconSize.Size14} />
            </Button>
          </WikiHistoryPopup>
          {canEdit && (
            <WikiDeleteStep page={page} onConfirm={handleDeleteConfirm} offset={5} position="bottom-end">
              <Button style={ButtonStyle.Icon} title={t('common.deleteWikiPage', { context: 'title' })}>
                <Icon type={IconType.Trash} size={IconSize.Size14} />
              </Button>
            </WikiDeleteStep>
          )}
        </div>
      </div>
      {updatedByUser && <div className={s.meta}>{t('common.updatedByAt', { name: updatedByUser.name, time: formatDistanceToNowStrict(new Date(page.updatedAt || page.createdAt), { addSuffix: true }) })}</div>}
      <MDPreview source={page.content} preferredDetailsFont={preferredDetailsFont} wikiPages={wikiPages} wikiBasePath={wikiBasePath} />
    </div>
  );
});

WikiPageView.propTypes = {
  page: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  updatedByUser: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  preferredDetailsFont: PropTypes.string.isRequired,
  wikiPages: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  wikiBasePath: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onRestoreRevision: PropTypes.func.isRequired,
};

WikiPageView.defaultProps = {
  updatedByUser: undefined,
};

export default WikiPageView;
