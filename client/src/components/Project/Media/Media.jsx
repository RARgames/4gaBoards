import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Gallery, Item as GalleryItem } from 'react-photoswipe-gallery';
import { Link } from 'react-router';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import Paths from '../../../constants/Paths';
import CardDetailPanelContainer from '../../../containers/Project/CardDetailPanelContainer';
import ProjectNavContainer from '../../../containers/Project/ProjectNavContainer';
import { getCardColor } from '../../../utils/board-colors';
import { Button, ButtonStyle, Dropdown, DropdownStyle, Icon, IconType, IconSize } from '../../Utils';

import * as s from './Media.module.scss';

const Filters = {
  ALL: 'all',
  IMAGES: 'images',
  FILES: 'files',
  DOCUMENTS: 'documents',
  ATTACHMENTS: 'attachments',
};

const ALL_BOARDS_ITEM = {
  id: 'all',
  name: null,
};

const Media = React.memo(({ projectId, isFetching, documents, attachments, onMediaFetch, onBoardFetch }) => {
  const [t] = useTranslation();
  const [filter, setFilter] = useState(Filters.ALL);
  const [boardId, setBoardId] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    onMediaFetch(projectId);
  }, [projectId, onMediaFetch]);

  const items = useMemo(() => {
    const documentItems = documents.map((document) => ({
      source: 'document',
      id: `document-${document.id}`,
      name: document.name,
      url: document.url,
      coverUrl: document.coverUrl,
      image: document.image,
      captionPath: document.folder ? `${t('common.documents')} / ${document.folder}` : t('common.documents'),
    }));

    const attachmentItems = attachments.map((attachment) => ({
      source: 'attachment',
      id: `attachment-${attachment.id}`,
      name: attachment.name,
      url: attachment.url,
      coverUrl: attachment.coverUrl,
      image: attachment.image,
      cardId: attachment.cardId,
      boardId: attachment.boardId,
      boardName: attachment.boardName,
      captionPath: t('common.inCardOnBoard', { card: attachment.cardName, board: attachment.boardName }),
    }));

    return [...documentItems, ...attachmentItems];
  }, [documents, attachments, t]);

  const boards = useMemo(() => {
    const byId = new Map();
    attachments.forEach((attachment) => {
      if (attachment.boardId && !byId.has(attachment.boardId)) {
        byId.set(attachment.boardId, { id: attachment.boardId, name: attachment.boardName });
      }
    });
    return Array.from(byId.values());
  }, [attachments]);

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        if (boardId && item.boardId !== boardId) {
          return false;
        }

        switch (filter) {
          case Filters.IMAGES:
            return !!item.image;
          case Filters.FILES:
            return !item.image;
          case Filters.DOCUMENTS:
            return item.source === 'document';
          case Filters.ATTACHMENTS:
            return item.source === 'attachment';
          default:
            return true;
        }
      }),
    [items, filter, boardId],
  );

  const imageItems = filteredItems.filter((item) => item.image);
  const fileItems = filteredItems.filter((item) => !item.image);

  const handleBoardChange = useCallback((item) => {
    setBoardId(item.id === ALL_BOARDS_ITEM.id ? null : item.id);
  }, []);

  // The card panel resolves its data (card/board/list/labels/members) from the client store, which
  // only has full board contents for boards already opened elsewhere in the app — fetch on demand
  // so the panel doesn't silently render empty for a board the user hasn't visited yet.
  const handleCardInfoClick = useCallback(
    (item) => {
      onBoardFetch(item.boardId);
      setSelectedCard({ id: item.cardId, boardId: item.boardId });
    },
    [onBoardFetch],
  );

  const handlePanelClose = useCallback(() => {
    setSelectedCard(null);
  }, []);

  const renderFilterChip = (value, label) => (
    <Button style={ButtonStyle.NoBackground} className={clsx(s.chip, filter === value && s.chipActive)} onClick={() => setFilter(value)}>
      {label}
    </Button>
  );

  const renderCardInfoButton = (item, className) =>
    item.source === 'attachment' &&
    item.cardId && (
      <Button style={ButtonStyle.Icon} title={t('action.viewCardInfo')} className={className} onClick={() => handleCardInfoClick(item)}>
        <Icon type={IconType.Info} size={IconSize.Size13} />
      </Button>
    );

  return (
    <div className={s.wrapper}>
      <ProjectNavContainer />
      <div className={s.content}>
        <div className={s.body}>
          <div className={s.header}>
            <div className={s.filterChips}>
              {renderFilterChip(Filters.ALL, t('common.allMedia'))}
              {renderFilterChip(Filters.IMAGES, t('common.images'))}
              {renderFilterChip(Filters.FILES, t('common.files'))}
              {renderFilterChip(Filters.DOCUMENTS, t('common.documents'))}
              {renderFilterChip(Filters.ATTACHMENTS, t('common.cardAttachments'))}
            </div>
            <div className={s.headerActions}>
              {boards.length > 0 && (
                <Dropdown
                  style={DropdownStyle.Default}
                  options={[ALL_BOARDS_ITEM, ...boards]}
                  defaultItem={ALL_BOARDS_ITEM}
                  placeholder={t('common.allBoards')}
                  onChange={handleBoardChange}
                  className={s.boardDropdown}
                />
              )}
              <Link to={Paths.PROJECT_DOCUMENTS.replace(':id', projectId)}>
                <Button style={ButtonStyle.Submit} content={t('action.goToDocuments')} />
              </Link>
            </div>
          </div>
          {!isFetching && items.length === 0 && (
            <div className={s.empty}>
              <Icon type={IconType.Image} size={IconSize.Size20} className={s.emptyIcon} />
              <h1 className={s.emptyTitle}>{t('common.noMediaYet_title')}</h1>
            </div>
          )}
          {items.length > 0 && filteredItems.length === 0 && (
            <div className={s.empty}>
              <h1 className={s.emptyTitle}>{t('common.noMatchingMedia_title')}</h1>
            </div>
          )}
          {imageItems.length > 0 && (
            <Gallery
              withCaption
              withDownloadButton
              options={{
                wheelToZoom: true,
                showHideAnimationType: 'none',
              }}
            >
              <div className={s.grid}>
                {imageItems.map((item) => (
                  <div key={item.id} className={s.gridItemWrapper}>
                    <GalleryItem
                      original={item.url}
                      caption={`${item.name} — ${item.captionPath}`}
                      {...item.image} // eslint-disable-line react/jsx-props-no-spreading
                    >
                      {({ ref, open }) => (
                        <button ref={ref} type="button" className={s.gridItem} onClick={open}>
                          <div className={s.gridThumbnail} style={{ backgroundImage: `url(${item.coverUrl})` }} />
                          <div className={s.gridName}>{item.name}</div>
                        </button>
                      )}
                    </GalleryItem>
                    {renderCardInfoButton(item, s.cardInfoButton)}
                  </div>
                ))}
              </div>
            </Gallery>
          )}
          {fileItems.length > 0 && (
            <div className={s.fileList}>
              {fileItems.map((item) => (
                <div key={item.id} className={s.fileRow}>
                  <Icon type={IconType.Attach} size={IconSize.Size14} className={s.fileIcon} />
                  <span className={s.fileName}>{item.name}</span>
                  <span className={s.fileSource}>{item.source === 'attachment' && item.cardId ? <Link to={Paths.CARDS.replace(':id', item.cardId)}>{item.captionPath}</Link> : item.captionPath}</span>
                  {renderCardInfoButton(item, s.cardInfoButtonInline)}
                  <a href={item.url} target="_blank" rel="noreferrer" className={s.fileDownload}>
                    {t('action.download', { context: 'title' })}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
        {selectedCard && <CardDetailPanelContainer cardId={selectedCard.id} canEdit={false} color={getCardColor(selectedCard.boardId, selectedCard.id)} onClose={handlePanelClose} />}
      </div>
    </div>
  );
});

Media.propTypes = {
  projectId: PropTypes.string.isRequired,
  isFetching: PropTypes.bool.isRequired,
  documents: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  attachments: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onMediaFetch: PropTypes.func.isRequired,
  onBoardFetch: PropTypes.func.isRequired,
};

export default Media;
