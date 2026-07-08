import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNowStrict } from 'date-fns';
import PropTypes from 'prop-types';

import api from '../../../api';
import { getAccessToken } from '../../../utils/access-token-storage';
import { Button, ButtonStyle, Loader, LoaderSize, MDPreview, Popup, withPopup } from '../../Utils';

import * as s from './WikiHistoryPopup.module.scss';

const WikiHistoryPopup = React.memo(({ page, canEdit, onRestoreRevision, onClose }) => {
  const [t] = useTranslation();
  const [selectedRevision, setSelectedRevision] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const revisions = page.revisions || [];

  const handleSelectRevision = useCallback(
    async (revisionSummary) => {
      setIsFetching(true);

      try {
        const { item } = await api.getWikiPageRevision(page.id, revisionSummary.id, {
          Authorization: `Bearer ${getAccessToken()}`,
        });

        setSelectedRevision(item);
      } catch {
        setSelectedRevision(null);
      } finally {
        setIsFetching(false);
      }
    },
    [page.id],
  );

  const handleBackToList = useCallback(() => {
    setSelectedRevision(null);
  }, []);

  const handleRestore = useCallback(() => {
    onRestoreRevision(page.id, selectedRevision.id);
    onClose();
  }, [page.id, selectedRevision, onRestoreRevision, onClose]);

  if (selectedRevision) {
    return (
      <>
        <Popup.Header onBack={handleBackToList}>{selectedRevision.title}</Popup.Header>
        <Popup.Content>
          <div className={s.revisionPreview}>
            <MDPreview source={selectedRevision.content} preferredDetailsFont="sans" />
          </div>
          {canEdit && (
            <div className={s.restoreControls}>
              <Button style={ButtonStyle.Submit} content={t('action.restoreThisVersion')} onClick={handleRestore} />
            </div>
          )}
        </Popup.Content>
      </>
    );
  }

  return (
    <>
      <Popup.Header>{t('common.wikiPageHistory')}</Popup.Header>
      <Popup.Content>
        {isFetching && <Loader size={LoaderSize.Small} />}
        {!isFetching && revisions.length === 0 && <div className={s.empty}>{t('common.noRevisionsYet')}</div>}
        {!isFetching && (
          <div className={s.list}>
            {revisions.map((revision) => (
              <Button key={revision.id} style={ButtonStyle.Popup} className={s.revisionItem} onClick={() => handleSelectRevision(revision)}>
                <div className={s.revisionInfo}>
                  <div className={s.revisionTitle}>{revision.title}</div>
                  <div className={s.revisionDate}>{formatDistanceToNowStrict(new Date(revision.createdAt), { addSuffix: true })}</div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </Popup.Content>
    </>
  );
});

WikiHistoryPopup.propTypes = {
  page: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  onRestoreRevision: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(WikiHistoryPopup);
