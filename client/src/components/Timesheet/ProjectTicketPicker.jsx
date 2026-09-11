import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import api from '../../api';
import Config from '../../constants/Config';
import Paths from '../../constants/Paths';
import { getAccessToken } from '../../utils/access-token-storage';
import { getBoardAccentColor } from '../../utils/board-colors';
import { Icon, IconType, IconSize } from '../Utils';

import * as s from './ProjectTicketPicker.module.scss';

// Results render in a scrollable list (see .results in the stylesheet), so this is generous
// rather than tight — it exists to cap DOM size on huge boards, not to hide matches. Anything
// still cut off past this is surfaced via a "+N more" hint (moreCount below) instead of silently
// vanishing, which is what happened before at the old cap of 8.
const MAX_RESULTS = 25;

// Slices a match array for display while keeping track of how many were left out, so callers can
// show a "+N more" hint instead of truncating silently.
const sliceWithMore = (items) => ({ items: items.slice(0, MAX_RESULTS), moreCount: Math.max(0, items.length - MAX_RESULTS) });

const highlight = (text, query) => {
  if (!query) {
    return text;
  }
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) {
    return text;
  }
  return (
    <>
      {text.slice(0, index)}
      <mark className={s.highlight}>{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
};

const ProjectTicketPicker = React.memo(({ projectId, boardId, listId, cardId, projects, assignedCards, allCards, defaultCardName, onChange }) => {
  const [t] = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  // allCards only reflects boards already loaded into the client's ORM cache (i.e. boards the
  // user has actually opened), so a project's tickets can go missing from search entirely. Once
  // a project is selected, fetch every one of its boards' card summaries (and each board's lists,
  // for the column step) on demand so search actually covers the whole project regardless of
  // what's been opened before.
  const [projectCardsByProjectId, setProjectCardsByProjectId] = useState({});
  const [listsByBoardId, setListsByBoardId] = useState({});
  const [loadingProjectId, setLoadingProjectId] = useState(null);
  const fetchedProjectIdsRef = useRef(new Set());

  // Before a project is picked, allCards/assignedCards only cover boards already loaded into the
  // ORM cache, so a search here can miss cards on boards the user hasn't opened this session. This
  // debounced server search backfills that gap — see server/api/controllers/cards/search.js.
  const [rootSearchResults, setRootSearchResults] = useState([]);
  const [rootSearchHasMore, setRootSearchHasMore] = useState(false);
  const [isSearchingRoot, setIsSearchingRoot] = useState(false);
  const rootSearchSeqRef = useRef(0);

  // Logging time against work that has no ticket yet is common enough that the picker offers to
  // create one on the spot rather than sending the user off to the board and back.
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [createError, setCreateError] = useState(null);

  const wrapperRef = useRef(null);
  const searchFieldRef = useRef(null);

  const trimmedQuery = query.trim();

  const selectedProject = projectId ? projects.find((project) => project.id === projectId) : null;
  const selectedCard = cardId ? [...assignedCards, ...allCards, ...Object.values(projectCardsByProjectId).flat(), ...rootSearchResults].find((card) => card.id === cardId) : null;
  const selectedBoard = selectedProject && boardId ? (selectedProject.boards || []).find((board) => board.id === boardId) : null;
  // Older entries (or entries picked before the board/list steps existed) may carry a cardId with
  // no explicit boardId/listId — fall back to the card's own board/list so the chip row and
  // scoping still work.
  const effectiveBoardId = boardId || (selectedCard && selectedCard.boardId) || null;
  const effectiveBoardName = (selectedBoard && selectedBoard.name) || (selectedCard && selectedCard.boardName) || null;
  const selectedList = effectiveBoardId && listId ? (listsByBoardId[effectiveBoardId] || []).find((list) => list.id === listId) : null;
  const effectiveListId = listId || (selectedCard && selectedCard.listId) || null;
  const effectiveListName = (selectedList && selectedList.name) || (selectedCard && selectedCard.listName) || null;

  useEffect(() => {
    if (!projectId || fetchedProjectIdsRef.current.has(projectId)) {
      return undefined;
    }

    const project = projects.find((p) => p.id === projectId);
    if (!project || !project.boards || project.boards.length === 0) {
      return undefined;
    }

    fetchedProjectIdsRef.current.add(projectId);
    setLoadingProjectId(projectId);

    let cancelled = false;
    Promise.all(
      project.boards.map((board) =>
        api
          .getBoardCardsSummary(board.id, { Authorization: `Bearer ${getAccessToken()}` })
          .then((res) => ({
            boardId: board.id,
            lists: res.lists || [],
            cards: (res.items || []).map((card) => {
              const list = (res.lists || []).find((l) => l.id === card.listId);
              return { id: card.id, name: card.name, projectId, projectName: project.name, boardId: board.id, boardName: board.name, listId: card.listId || null, listName: list ? list.name : null };
            }),
          }))
          .catch(() => ({ boardId: board.id, lists: [], cards: [] })),
      ),
    ).then((results) => {
      if (cancelled) {
        return;
      }
      setProjectCardsByProjectId((prev) => ({ ...prev, [projectId]: results.flatMap((result) => result.cards) }));
      setListsByBoardId((prev) => {
        const next = { ...prev };
        results.forEach((result) => {
          next[result.boardId] = result.lists;
        });
        return next;
      });
      setLoadingProjectId((current) => (current === projectId ? null : current));
    });

    return () => {
      cancelled = true;
    };
  }, [projectId, projects]);

  useEffect(() => {
    if (projectId || trimmedQuery.length < 2) {
      setRootSearchResults([]);
      setRootSearchHasMore(false);
      setIsSearchingRoot(false);
      return undefined;
    }

    setIsSearchingRoot(true);
    rootSearchSeqRef.current += 1;
    const seq = rootSearchSeqRef.current;

    const timeoutId = setTimeout(() => {
      api
        .searchCards(trimmedQuery, { Authorization: `Bearer ${getAccessToken()}` })
        .then((res) => {
          if (rootSearchSeqRef.current !== seq) {
            return;
          }
          setRootSearchResults(res.items || []);
          setRootSearchHasMore(!!res.hasMore);
          setIsSearchingRoot(false);
        })
        .catch(() => {
          if (rootSearchSeqRef.current !== seq) {
            return;
          }
          setRootSearchResults([]);
          setRootSearchHasMore(false);
          setIsSearchingRoot(false);
        });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [projectId, trimmedQuery]);

  useEffect(() => {
    if (isOpen) {
      searchFieldRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [isOpen]);

  const handleOpen = useCallback(() => {
    setQuery('');
    setCreateError(null);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setCreateError(null);
  }, []);

  const handlePickProject = useCallback(
    (project) => {
      onChange({ projectId: project.id, boardId: null, listId: null, cardId: null });
      handleClose();
    },
    [onChange, handleClose],
  );

  const handlePickBoard = useCallback(
    (board) => {
      onChange({ projectId, boardId: board.id, listId: null, cardId: null });
      handleClose();
    },
    [projectId, onChange, handleClose],
  );

  const handlePickList = useCallback(
    (list) => {
      onChange({ projectId, boardId: effectiveBoardId, listId: list.id, cardId: null });
      handleClose();
    },
    [projectId, effectiveBoardId, onChange, handleClose],
  );

  const handlePickCard = useCallback(
    (card) => {
      // Pass the name along directly rather than making the caller re-look the card up: it may
      // only exist in this component's on-demand-fetched pool, not in assignedCards/allCards.
      onChange({ projectId: card.projectId, boardId: card.boardId || boardId || null, listId: card.listId || listId || null, cardId: card.id, cardName: card.name });
      handleClose();
    },
    [boardId, listId, onChange, handleClose],
  );

  const handleClearProject = useCallback(
    (e) => {
      e.stopPropagation();
      onChange({ projectId: null, boardId: null, listId: null, cardId: null });
    },
    [onChange],
  );

  const handleClearBoard = useCallback(
    (e) => {
      e.stopPropagation();
      onChange({ projectId, boardId: null, listId: null, cardId: null });
    },
    [projectId, onChange],
  );

  const handleClearList = useCallback(
    (e) => {
      e.stopPropagation();
      onChange({ projectId, boardId, listId: null, cardId: null });
    },
    [projectId, boardId, onChange],
  );

  const handleClearCard = useCallback(
    (e) => {
      e.stopPropagation();
      onChange({ projectId, boardId, listId, cardId: null });
    },
    [projectId, boardId, listId, onChange],
  );

  const isLoadingProjectCards = projectId !== null && loadingProjectId === projectId;
  const projectPool = projectId ? projectCardsByProjectId[projectId] || allCards.filter((card) => card.projectId === projectId) : null;
  const boardPool = effectiveBoardId ? (projectPool || []).filter((card) => card.boardId === effectiveBoardId) : null;
  const listPool = effectiveListId ? (boardPool || []).filter((card) => card.listId === effectiveListId) : null;
  const boardLists = useMemo(() => (effectiveBoardId ? listsByBoardId[effectiveBoardId] || [] : []), [effectiveBoardId, listsByBoardId]);

  // A new ticket needs a column to live in. Use the one the user picked, or fall back to the
  // board's first column (the usual "new work lands here" convention) — the target is named in the
  // button either way, so it's never a surprise.
  const createTargetList = useMemo(() => {
    if (!effectiveBoardId) {
      return null;
    }
    if (effectiveListId) {
      return boardLists.find((list) => list.id === effectiveListId) || (effectiveListName ? { id: effectiveListId, name: effectiveListName } : null);
    }
    return boardLists[0] || null;
  }, [effectiveBoardId, effectiveListId, effectiveListName, boardLists]);

  // Cards created from a time entry always inherit its title. Search text is only for finding
  // existing cards and must never allow (or rename) a newly created card when the title is blank.
  const createCardName = (defaultCardName || '').trim();
  const canCreateCard = Boolean(createTargetList && createCardName);

  const handleCreateCard = useCallback(() => {
    if (!canCreateCard || isCreatingCard) {
      return;
    }

    setIsCreatingCard(true);
    setCreateError(null);

    api
      .createAndAssignCard(createTargetList.id, createCardName, { Authorization: `Bearer ${getAccessToken()}` })
      .then(({ item }) => {
        // Seed the new card into this picker's own pool so the chip row can resolve it without
        // waiting on a refetch (the project fetch below only runs once per project).
        setProjectCardsByProjectId((prev) => {
          const existing = prev[item.projectId] || allCards.filter((card) => card.projectId === item.projectId);
          return { ...prev, [item.projectId]: [...existing, item] };
        });
        setIsCreatingCard(false);
        onChange({ projectId: item.projectId, boardId: item.boardId, listId: item.listId, cardId: item.id, cardName: item.name });
        handleClose();
      })
      .catch((error) => {
        setIsCreatingCard(false);
        // A non-member gets notFound and a viewer gets forbidden, but both mean the same thing
        // to the user, so don't make them guess which.
        setCreateError(error && (error.code === 'E_FORBIDDEN' || error.code === 'E_NOT_FOUND') ? 'noRights' : 'failed');
      });
  }, [canCreateCard, isCreatingCard, createTargetList, createCardName, allCards, onChange, handleClose]);

  const { projectResults, projectsMoreCount, boardSection, listSection, cardSections, flatResults } = useMemo(() => {
    if (trimmedQuery) {
      const lowerQuery = trimmedQuery.toLowerCase();

      if (!projectId) {
        const { items: matchingProjects, moreCount: projectsMore } = sliceWithMore(projects.filter((project) => project.name.toLowerCase().includes(lowerQuery)));

        // allCards only covers boards already loaded into the ORM cache. Backfill with the
        // debounced server search (rootSearchResults) for boards the user hasn't opened this
        // session, preferring the cached copy of a card when both sources have it.
        const cachedMatches = allCards.filter((card) => card.name.toLowerCase().includes(lowerQuery));
        const cachedIds = new Set(cachedMatches.map((card) => card.id));
        const serverOnlyMatches = rootSearchResults.filter((card) => !cachedIds.has(card.id));
        const combinedMatches = [...cachedMatches, ...serverOnlyMatches];
        const { items: matchingCards, moreCount: combinedMoreCount } = sliceWithMore(combinedMatches);
        // Once the server says there's more than we fetched, our own slice count is no longer
        // meaningful (we don't know the true total) — show it as an open-ended "more" hint instead.
        const moreCount = rootSearchHasMore ? 0 : combinedMoreCount;
        const moreIsApproximate = rootSearchHasMore;

        return {
          projectResults: matchingProjects,
          projectsMoreCount: projectsMore,
          boardSection: null,
          listSection: null,
          cardSections: [{ title: t('common.matchingTickets', { context: 'title' }), cards: matchingCards, moreCount, moreIsApproximate }],
          flatResults: [...matchingProjects.map((project) => ({ type: 'project', item: project })), ...matchingCards.map((card) => ({ type: 'card', item: card }))],
        };
      }

      if (!effectiveBoardId) {
        const { items: matchingBoards, moreCount: boardsMore } = sliceWithMore(((selectedProject && selectedProject.boards) || []).filter((board) => board.name.toLowerCase().includes(lowerQuery)));
        const { items: matchingCards, moreCount } = sliceWithMore((projectPool || []).filter((card) => card.name.toLowerCase().includes(lowerQuery)));

        return {
          projectResults: [],
          projectsMoreCount: 0,
          boardSection: { title: t('common.matchingBoards', { context: 'title' }), boards: matchingBoards, moreCount: boardsMore },
          listSection: null,
          cardSections: [{ title: t('common.matchingTickets', { context: 'title' }), cards: matchingCards, moreCount }],
          flatResults: [...matchingBoards.map((board) => ({ type: 'board', item: board })), ...matchingCards.map((card) => ({ type: 'card', item: card }))],
        };
      }

      if (!effectiveListId) {
        const { items: matchingLists, moreCount: listsMore } = sliceWithMore(boardLists.filter((list) => list.name.toLowerCase().includes(lowerQuery)));
        const { items: matchingCards, moreCount } = sliceWithMore((boardPool || []).filter((card) => card.name.toLowerCase().includes(lowerQuery)));

        return {
          projectResults: [],
          projectsMoreCount: 0,
          boardSection: null,
          listSection: { title: t('common.matchingLists', { context: 'title' }), lists: matchingLists, moreCount: listsMore },
          cardSections: [{ title: t('common.matchingTickets', { context: 'title' }), cards: matchingCards, moreCount }],
          flatResults: [...matchingLists.map((list) => ({ type: 'list', item: list })), ...matchingCards.map((card) => ({ type: 'card', item: card }))],
        };
      }

      const { items: matchingCards, moreCount } = sliceWithMore((listPool || []).filter((card) => card.name.toLowerCase().includes(lowerQuery)));

      return {
        projectResults: [],
        projectsMoreCount: 0,
        boardSection: null,
        listSection: null,
        cardSections: [{ title: t('common.matchingTickets', { context: 'title' }), cards: matchingCards, moreCount }],
        flatResults: matchingCards.map((card) => ({ type: 'card', item: card })),
      };
    }

    if (!projectId) {
      const { items: projectItems, moreCount: projectsMore } = sliceWithMore(projects);
      const { items: assignedItems, moreCount } = sliceWithMore(assignedCards);

      return {
        projectResults: projectItems,
        projectsMoreCount: projectsMore,
        boardSection: null,
        listSection: null,
        cardSections: [{ title: t('common.assignedToYou', { context: 'title' }), cards: assignedItems, moreCount }],
        flatResults: [...projectItems.map((project) => ({ type: 'project', item: project })), ...assignedItems.map((card) => ({ type: 'card', item: card }))],
      };
    }

    if (!effectiveBoardId) {
      const { items: boards, moreCount: boardsMore } = sliceWithMore((selectedProject && selectedProject.boards) || []);
      const { items: scopedAssigned, moreCount } = sliceWithMore(assignedCards.filter((card) => card.projectId === projectId));

      return {
        projectResults: [],
        projectsMoreCount: 0,
        boardSection: { title: t('common.yourBoards', { context: 'title' }), boards, moreCount: boardsMore },
        listSection: null,
        cardSections: scopedAssigned.length > 0 ? [{ title: t('common.assignedToYou', { context: 'title' }), cards: scopedAssigned, moreCount }] : [],
        flatResults: [...boards.map((board) => ({ type: 'board', item: board })), ...scopedAssigned.map((card) => ({ type: 'card', item: card }))],
      };
    }

    if (!effectiveListId) {
      const { items: listItems, moreCount: listsMore } = sliceWithMore(boardLists);
      const { items: scopedAssigned, moreCount } = sliceWithMore(assignedCards.filter((card) => card.projectId === projectId && card.boardId === effectiveBoardId));

      return {
        projectResults: [],
        projectsMoreCount: 0,
        boardSection: null,
        listSection: { title: t('common.yourLists', { context: 'title' }), lists: listItems, moreCount: listsMore },
        cardSections: scopedAssigned.length > 0 ? [{ title: t('common.assignedToYou', { context: 'title' }), cards: scopedAssigned, moreCount }] : [],
        flatResults: [...listItems.map((list) => ({ type: 'list', item: list })), ...scopedAssigned.map((card) => ({ type: 'card', item: card }))],
      };
    }

    const { items: scopedAssigned, moreCount: assignedMore } = sliceWithMore(
      assignedCards.filter((card) => card.projectId === projectId && card.boardId === effectiveBoardId && card.listId === effectiveListId),
    );
    const assignedIds = new Set(scopedAssigned.map((card) => card.id));
    const { items: moreTickets, moreCount: moreTicketsMore } = sliceWithMore((listPool || []).filter((card) => !assignedIds.has(card.id)));

    return {
      projectResults: [],
      projectsMoreCount: 0,
      boardSection: null,
      listSection: null,
      cardSections: [
        { title: t('common.assignedToYou', { context: 'title' }), cards: scopedAssigned, moreCount: assignedMore },
        { title: t('common.moreTickets', { context: 'title' }), cards: moreTickets, moreCount: moreTicketsMore },
      ],
      flatResults: [...scopedAssigned.map((card) => ({ type: 'card', item: card })), ...moreTickets.map((card) => ({ type: 'card', item: card }))],
    };
  }, [trimmedQuery, projectId, effectiveBoardId, effectiveListId, projects, selectedProject, assignedCards, allCards, projectPool, boardPool, listPool, boardLists, rootSearchResults, rootSearchHasMore, t]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        // Escape backs out of the step, not out of the whole entry — EntryPopup's own document-level
        // Escape handler would otherwise discard the unsaved entry behind it.
        e.stopPropagation();
        handleClose();
        return;
      }
      if (e.key === 'Enter' && flatResults.length > 0) {
        const [top] = flatResults;
        if (top.type === 'project') {
          handlePickProject(top.item);
        } else if (top.type === 'board') {
          handlePickBoard(top.item);
        } else if (top.type === 'list') {
          handlePickList(top.item);
        } else {
          handlePickCard(top.item);
        }
      }
    },
    [flatResults, handleClose, handlePickProject, handlePickBoard, handlePickList, handlePickCard],
  );

  // The create action also lives inside the picker popup (where the search text names the ticket),
  // but that's only reachable once the popup is open. This is the visible-by-default entry point:
  // create straight away when we already know where the ticket goes and what to call it, otherwise
  // open the picker so the user can supply the missing piece.
  const handlePrimaryAction = useCallback(() => {
    if (canCreateCard) {
      handleCreateCard();
      return;
    }
    handleOpen();
  }, [canCreateCard, handleCreateCard, handleOpen]);

  // Deliberately a real navigation rather than a react-router <Link>: the /cards/:id route renders
  // from the ORM cache and derives the board from the card, so an in-app transition from the
  // Timesheet — where no board has been loaded — lands on "Card Not Found". A full load bootstraps
  // the board properly, and as a bonus this makes middle-click / open-in-new-tab work.
  const cardHref = selectedCard ? `${Config.BASE_PATH}${Paths.CARDS.replace(':id', selectedCard.id)}` : null;

  const renderCardSubtitle = (card) => {
    if (!projectId) {
      return `${card.projectName} · ${card.boardName}`;
    }
    if (!effectiveBoardId) {
      return card.boardName;
    }
    if (!effectiveListId) {
      return card.listName;
    }
    return null;
  };

  // Everything the popover already knows about where this entry belongs, read out as a trail so
  // the step can cover the chip row without the user losing their place.
  const scopeTrail = [selectedProject && selectedProject.name, effectiveBoardName, effectiveListName, selectedCard && selectedCard.name].filter(Boolean);

  return (
    <div className={s.wrapper} ref={wrapperRef}>
      {!selectedProject && !selectedCard && (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
        <div className={s.affordance} onClick={handleOpen}>
          <Icon type={IconType.Plus} size={IconSize.Size10} />
          {t('common.linkProjectOrTicket')}
        </div>
      )}
      {(selectedProject || selectedCard) && (
        <div className={s.chipRow}>
          {selectedProject && (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
            <div className={s.chip} onClick={handleOpen}>
              <span className={s.chipDot} style={{ background: getBoardAccentColor(selectedProject.id) }} />
              <span className={s.chipLabel}>{selectedProject.name}</span>
              <button type="button" className={s.chipRemove} onClick={handleClearProject} title={t('action.remove')}>
                <Icon type={IconType.Close} size={IconSize.Size8} />
              </button>
            </div>
          )}
          {effectiveBoardName && (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
            <div className={s.chip} onClick={handleOpen}>
              <span className={s.chipLabel}>{effectiveBoardName}</span>
              <button type="button" className={s.chipRemove} onClick={handleClearBoard} title={t('action.remove')}>
                <Icon type={IconType.Close} size={IconSize.Size8} />
              </button>
            </div>
          )}
          {effectiveListName && (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
            <div className={s.chip} onClick={handleOpen}>
              <span className={s.chipLabel}>{effectiveListName}</span>
              <button type="button" className={s.chipRemove} onClick={handleClearList} title={t('action.remove')}>
                <Icon type={IconType.Close} size={IconSize.Size8} />
              </button>
            </div>
          )}
          {selectedCard && (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
            <div className={s.chip} onClick={handleOpen}>
              <span className={s.chipLabel}>{selectedCard.name}</span>
              <a href={cardHref} className={s.chipOpen} title={t('action.openTicket')} onClick={(e) => e.stopPropagation()}>
                <Icon type={IconType.WindowMaximize} size={IconSize.Size8} />
              </a>
              <button type="button" className={s.chipRemove} onClick={handleClearCard} title={t('action.remove')}>
                <Icon type={IconType.Close} size={IconSize.Size8} />
              </button>
            </div>
          )}
          {!selectedCard && effectiveListId && (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
            <div className={s.addTicketAffordance} onClick={handleOpen}>
              <Icon type={IconType.Plus} size={IconSize.Size8} />
              {t('common.linkTicket')}
            </div>
          )}
          {!selectedCard && !effectiveListId && effectiveBoardId && (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
            <div className={s.addTicketAffordance} onClick={handleOpen}>
              <Icon type={IconType.Plus} size={IconSize.Size8} />
              {t('common.linkList')}
            </div>
          )}
          {!selectedCard && !effectiveBoardId && selectedProject && (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
            <div className={s.addTicketAffordance} onClick={handleOpen}>
              <Icon type={IconType.Plus} size={IconSize.Size8} />
              {t('common.linkBoard')}
            </div>
          )}
        </div>
      )}
      {selectedCard ? (
        <a href={cardHref} target="_blank" rel="noopener noreferrer" className={s.openAction}>
          <Icon type={IconType.WindowMaximize} size={IconSize.Size13} />
          {t('common.openTicketOnBoard')}
        </a>
      ) : (
        // Linking existing work is the common case and creating a ticket the exception, so the link
        // action carries the weight here and creating sits beside it as a quiet dashed alternative.
        // Save, at the foot of the form, is the only filled button in the popover.
        <div className={s.actionRow}>
          <button type="button" className={s.linkAction} onClick={handleOpen}>
            <Icon type={IconType.Link} size={IconSize.Size13} />
            {t('common.linkACard')}
          </button>
          <button type="button" className={s.createAction} onClick={handlePrimaryAction} disabled={!createCardName || isCreatingCard} title={createCardName ? undefined : t('common.titlePlaceholder')}>
            <Icon type={IconType.Plus} size={IconSize.Size13} />
            {isCreatingCard ? t('common.creatingTicket') : t('common.createTicketOnBoard')}
          </button>
        </div>
      )}
      {isOpen && (
        // A step over the whole popover rather than a menu hanging off the field: the popover is
        // only 300px wide, and a nested dropdown inside a popup inside the grid stacked three
        // overlapping surfaces. Escape and the back arrow both return to the form with whatever
        // was picked, so nothing is lost by leaving.
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div className={s.stepPanel} onKeyDown={handleKeyDown}>
          <div className={s.stepHeader}>
            <button type="button" className={s.stepBack} onClick={handleClose} title={t('common.back')}>
              <Icon type={IconType.AngleLeft} size={IconSize.Size13} />
            </button>
            <div className={s.stepTitles}>
              <span className={s.stepTitle}>{t('common.linkedWork')}</span>
              <span className={s.stepScope}>{scopeTrail.length > 0 ? scopeTrail.join(' › ') : t('common.notLinked')}</span>
            </div>
          </div>
          <input ref={searchFieldRef} className={s.searchInput} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} placeholder={t('common.searchProjectsAndTickets')} />
          {!projectId && <div className={s.stepHint}>{t('common.linkBoardOrListHint')}</div>}
          <div className={s.results}>
            {projectResults.length > 0 && (
              <div className={s.section}>
                <div className={s.sectionTitle}>{t('common.yourProjects', { context: 'title' })}</div>
                {projectResults.map((project) => (
                  // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
                  <div key={project.id} className={s.resultRow} onClick={() => handlePickProject(project)}>
                    <span className={s.chipDot} style={{ background: getBoardAccentColor(project.id) }} />
                    <span className={s.resultLabel}>{highlight(project.name, trimmedQuery)}</span>
                  </div>
                ))}
                {projectsMoreCount > 0 && <div className={s.moreResultsHint}>{t('common.moreResults', { count: projectsMoreCount })}</div>}
              </div>
            )}
            {boardSection && boardSection.boards.length > 0 && (
              <div className={s.section}>
                <div className={s.sectionTitle}>{boardSection.title}</div>
                {boardSection.boards.map((board) => (
                  // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
                  <div key={board.id} className={s.resultRow} onClick={() => handlePickBoard(board)}>
                    <span className={s.resultLabel}>{highlight(board.name, trimmedQuery)}</span>
                  </div>
                ))}
                {boardSection.moreCount > 0 && <div className={s.moreResultsHint}>{t('common.moreResults', { count: boardSection.moreCount })}</div>}
              </div>
            )}
            {listSection && listSection.lists.length > 0 && (
              <div className={s.section}>
                <div className={s.sectionTitle}>{listSection.title}</div>
                {listSection.lists.map((list) => (
                  // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
                  <div key={list.id} className={s.resultRow} onClick={() => handlePickList(list)}>
                    <span className={s.resultLabel}>{highlight(list.name, trimmedQuery)}</span>
                  </div>
                ))}
                {listSection.moreCount > 0 && <div className={s.moreResultsHint}>{t('common.moreResults', { count: listSection.moreCount })}</div>}
              </div>
            )}
            {cardSections.map(
              (section) =>
                section.cards.length > 0 && (
                  <div className={s.section} key={section.title}>
                    <div className={s.sectionTitle}>{section.title}</div>
                    {section.cards.map((card) => (
                      // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
                      <div key={card.id} className={s.resultRow} onClick={() => handlePickCard(card)}>
                        <div className={s.resultTexts}>
                          <span className={s.resultLabel}>{highlight(card.name, trimmedQuery)}</span>
                          {renderCardSubtitle(card) && <span className={s.resultSubtitle}>{renderCardSubtitle(card)}</span>}
                        </div>
                      </div>
                    ))}
                    {(section.moreCount > 0 || section.moreIsApproximate) && (
                      <div className={s.moreResultsHint}>{section.moreIsApproximate ? t('common.moreResultsApprox') : t('common.moreResults', { count: section.moreCount })}</div>
                    )}
                  </div>
                ),
            )}
            {flatResults.length === 0 && <div className={s.emptyResults}>{isLoadingProjectCards || isSearchingRoot ? t('common.loading') : t('common.noResults')}</div>}
          </div>
          {canCreateCard && (
            <button type="button" className={s.createRow} onClick={handleCreateCard} disabled={isCreatingCard}>
              <Icon type={IconType.Plus} size={IconSize.Size10} />
              <span className={s.createLabel}>{isCreatingCard ? t('common.creatingTicket') : t('common.createTicketIn', { name: createCardName, list: createTargetList.name })}</span>
            </button>
          )}
        </div>
      )}
      {createError && <div className={s.createError}>{createError === 'noRights' ? t('common.createTicketNoRights') : t('common.createTicketFailed')}</div>}
    </div>
  );
});

ProjectTicketPicker.propTypes = {
  projectId: PropTypes.string,
  boardId: PropTypes.string,
  listId: PropTypes.string,
  cardId: PropTypes.string,
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  assignedCards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allCards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  defaultCardName: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

ProjectTicketPicker.defaultProps = {
  projectId: null,
  boardId: null,
  listId: null,
  cardId: null,
  defaultCardName: '',
};

export default ProjectTicketPicker;
