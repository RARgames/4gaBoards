import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { getBoardAccentColor } from '../../utils/board-colors';
import { Icon, IconType, IconSize } from '../Utils';

import * as s from './ProjectTicketPicker.module.scss';

const MAX_RESULTS = 8;

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

const ProjectTicketPicker = React.memo(({ projectId, cardId, projects, assignedCards, allCards, onChange }) => {
  const [t] = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const wrapperRef = useRef(null);
  const searchFieldRef = useRef(null);

  const selectedProject = projectId ? projects.find((project) => project.id === projectId) : null;
  const selectedCard = cardId ? [...assignedCards, ...allCards].find((card) => card.id === cardId) : null;

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
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  const handlePickProject = useCallback(
    (project) => {
      onChange({ projectId: project.id, cardId: null });
      handleClose();
    },
    [onChange, handleClose],
  );

  const handlePickCard = useCallback(
    (card) => {
      onChange({ projectId: card.projectId, cardId: card.id });
      handleClose();
    },
    [onChange, handleClose],
  );

  const handleClearProject = useCallback(
    (e) => {
      e.stopPropagation();
      onChange({ projectId: null, cardId: null });
    },
    [onChange],
  );

  const handleClearCard = useCallback(
    (e) => {
      e.stopPropagation();
      onChange({ projectId, cardId: null });
    },
    [projectId, onChange],
  );

  const trimmedQuery = query.trim();

  const { projectResults, cardSections, flatResults } = useMemo(() => {
    if (trimmedQuery) {
      const matchingProjects = projectId ? [] : projects.filter((project) => project.name.toLowerCase().includes(trimmedQuery.toLowerCase())).slice(0, MAX_RESULTS);

      const pool = projectId ? allCards.filter((card) => card.projectId === projectId) : allCards;
      const matchingCards = pool.filter((card) => card.name.toLowerCase().includes(trimmedQuery.toLowerCase())).slice(0, MAX_RESULTS);

      return {
        projectResults: matchingProjects,
        cardSections: [{ title: t('common.matchingTickets', { context: 'title' }), cards: matchingCards }],
        flatResults: [...matchingProjects.map((project) => ({ type: 'project', item: project })), ...matchingCards.map((card) => ({ type: 'card', item: card }))],
      };
    }

    if (projectId) {
      const scopedAssigned = assignedCards.filter((card) => card.projectId === projectId);
      const assignedIds = new Set(scopedAssigned.map((card) => card.id));
      const moreTickets = allCards.filter((card) => card.projectId === projectId && !assignedIds.has(card.id)).slice(0, MAX_RESULTS);

      return {
        projectResults: [],
        cardSections: [
          { title: t('common.assignedToYou', { context: 'title' }), cards: scopedAssigned.slice(0, MAX_RESULTS) },
          { title: t('common.moreTickets', { context: 'title' }), cards: moreTickets },
        ],
        flatResults: [...scopedAssigned.map((card) => ({ type: 'card', item: card })), ...moreTickets.map((card) => ({ type: 'card', item: card }))],
      };
    }

    return {
      projectResults: projects.slice(0, MAX_RESULTS),
      cardSections: [{ title: t('common.assignedToYou', { context: 'title' }), cards: assignedCards.slice(0, MAX_RESULTS) }],
      flatResults: [...projects.slice(0, MAX_RESULTS).map((project) => ({ type: 'project', item: project })), ...assignedCards.slice(0, MAX_RESULTS).map((card) => ({ type: 'card', item: card }))],
    };
  }, [trimmedQuery, projectId, projects, assignedCards, allCards, t]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        handleClose();
        return;
      }
      if (e.key === 'Enter' && flatResults.length > 0) {
        const [top] = flatResults;
        if (top.type === 'project') {
          handlePickProject(top.item);
        } else {
          handlePickCard(top.item);
        }
      }
    },
    [flatResults, handleClose, handlePickProject, handlePickCard],
  );

  const renderCardSubtitle = (card) => (projectId ? card.boardName : `${card.projectName} · ${card.boardName}`);

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
          {selectedCard && (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
            <div className={s.chip} onClick={handleOpen}>
              <span className={s.chipLabel}>{selectedCard.name}</span>
              <button type="button" className={s.chipRemove} onClick={handleClearCard} title={t('action.remove')}>
                <Icon type={IconType.Close} size={IconSize.Size8} />
              </button>
            </div>
          )}
          {!selectedCard && (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
            <div className={s.addTicketAffordance} onClick={handleOpen}>
              <Icon type={IconType.Plus} size={IconSize.Size8} />
              {t('common.linkTicket')}
            </div>
          )}
        </div>
      )}
      {isOpen && (
        <div className={s.popup}>
          <input ref={searchFieldRef} className={s.searchInput} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} placeholder={t('common.searchProjectsAndTickets')} />
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
                          <span className={s.resultSubtitle}>{renderCardSubtitle(card)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ),
            )}
            {flatResults.length === 0 && <div className={s.emptyResults}>{t('common.noResults')}</div>}
          </div>
        </div>
      )}
    </div>
  );
});

ProjectTicketPicker.propTypes = {
  projectId: PropTypes.string,
  cardId: PropTypes.string,
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  assignedCards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allCards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onChange: PropTypes.func.isRequired,
};

ProjectTicketPicker.defaultProps = {
  projectId: null,
  cardId: null,
};

export default ProjectTicketPicker;
