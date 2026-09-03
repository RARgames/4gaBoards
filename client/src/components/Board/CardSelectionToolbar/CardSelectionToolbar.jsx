import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import CardMoveStepContainer from '../../../containers/CardMoveStepContainer';
import DeleteStep from '../../DeleteStep';
import DueDateEditStep from '../../DueDateEditStep';
import { Button, ButtonStyle, Icon, IconType, IconSize, withPopup } from '../../Utils';

import * as s from './CardSelectionToolbar.module.scss';

const DueDateEditPopup = withPopup(DueDateEditStep);
const CardMovePopup = withPopup(CardMoveStepContainer);
const DeletePopup = withPopup(DeleteStep);

// Bulk-action bar for the board's multi-selection. It floats over the board (rather than living
// in the header) so it stays reachable in every view that renders cards, and it renders nothing
// at all until at least one card is selected.
const CardSelectionToolbar = React.memo(({ boardId, cards, defaultPath, onUpdate, onMove, onTransfer, onArchive, onDelete, onClear, onBoardFetch }) => {
  const [t] = useTranslation();
  const [isLinksCopied, setIsLinksCopied] = useState(false);
  const prevBoardId = useRef(boardId);

  const cardIds = useMemo(() => cards.map((card) => card.id), [cards]);
  const isActive = cards.length > 0;

  const handleDueDateUpdate = useCallback(
    (dueDate) => {
      onUpdate(cardIds, { dueDate });
    },
    [cardIds, onUpdate],
  );

  const handleMove = useCallback(
    (listId) => {
      onMove(cardIds, listId);
    },
    [cardIds, onMove],
  );

  const handleTransfer = useCallback(
    (nextBoardId, listId) => {
      onTransfer(cardIds, nextBoardId, listId);
    },
    [cardIds, onTransfer],
  );

  const handleArchive = useCallback(() => {
    onArchive(cardIds);
  }, [cardIds, onArchive]);

  const handleDelete = useCallback(() => {
    onDelete(cardIds);
  }, [cardIds, onDelete]);

  // One link per line — the same text a user would get by copying each card's link in turn.
  const handleCopyLinks = useCallback(() => {
    navigator.clipboard.writeText(cards.map((card) => card.url).join('\n'));
    setIsLinksCopied(true);
    setTimeout(() => setIsLinksCopied(false), 1500);
  }, [cards]);

  // A selection only makes sense on the board it was made on.
  useEffect(() => {
    if (prevBoardId.current !== boardId) {
      prevBoardId.current = boardId;
      onClear();
    }
  }, [boardId, onClear]);

  useEffect(() => {
    if (!isActive) {
      return undefined;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onClear]);

  if (!isActive) {
    return null;
  }

  return (
    <div className={s.wrapper}>
      <div className={s.bar}>
        <span className={s.count}>{t('common.cardsSelected', { count: cards.length })}</span>
        <span className={s.separator} />
        <DueDateEditPopup onUpdate={handleDueDateUpdate} position="top" offset={8}>
          <Button style={ButtonStyle.IconText} title={t('action.editDueDate', { context: 'title' })} className={s.action}>
            <Icon type={IconType.Calendar} size={IconSize.Size13} className={s.actionIcon} />
            {t('action.editDueDate', { context: 'title' })}
          </Button>
        </DueDateEditPopup>
        <CardMovePopup defaultPath={defaultPath} onMove={handleMove} onTransfer={handleTransfer} onBoardFetch={onBoardFetch} position="top" offset={8}>
          <Button style={ButtonStyle.IconText} title={t('action.moveCard', { context: 'title' })} className={s.action}>
            <Icon type={IconType.MoveUpDown} size={IconSize.Size13} className={s.actionIcon} />
            {t('action.move')}
          </Button>
        </CardMovePopup>
        <Button style={ButtonStyle.IconText} title={t('action.copyLinks')} onClick={handleCopyLinks} className={s.action}>
          <Icon type={isLinksCopied ? IconType.Check : IconType.Link} size={IconSize.Size13} className={s.actionIcon} />
          {t('action.copyLinks')}
        </Button>
        <Button style={ButtonStyle.IconText} title={t('action.archiveCards', { context: 'title' })} onClick={handleArchive} className={s.action}>
          <Icon type={IconType.Archive} size={IconSize.Size13} className={s.actionIcon} />
          {t('action.archive')}
        </Button>
        <DeletePopup
          title={t('common.deleteCards', { context: 'title' })}
          content={t('common.areYouSureYouWantToDeleteTheseCards', { count: cards.length })}
          buttonContent={t('action.deleteCards')}
          onConfirm={handleDelete}
          position="top"
          offset={8}
        >
          <Button style={ButtonStyle.IconText} title={t('action.deleteCards', { context: 'title' })} className={s.action}>
            <Icon type={IconType.Trash} size={IconSize.Size13} className={s.actionIcon} />
            {t('action.delete')}
          </Button>
        </DeletePopup>
        <span className={s.separator} />
        <Button style={ButtonStyle.Icon} title={t('action.clearSelection')} onClick={onClear} className={s.clearButton}>
          <Icon type={IconType.Close} size={IconSize.Size13} />
        </Button>
      </div>
    </div>
  );
});

CardSelectionToolbar.propTypes = {
  boardId: PropTypes.string,
  cards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  defaultPath: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onTransfer: PropTypes.func.isRequired,
  onArchive: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onBoardFetch: PropTypes.func.isRequired,
};

CardSelectionToolbar.defaultProps = {
  boardId: undefined,
};

export default CardSelectionToolbar;
