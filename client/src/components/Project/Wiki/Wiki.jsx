import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import PropTypes from 'prop-types';

import Config from '../../../constants/Config';
import Paths from '../../../constants/Paths';
import ProjectNavContainer from '../../../containers/Project/ProjectNavContainer';
import { isLocalId } from '../../../utils/local-id';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../../Utils';
import WikiPageView from './WikiPageView';
import WikiTree from './WikiTree';

import * as s from './Wiki.module.scss';

const Wiki = React.memo(
  ({ projectId, wikiPageSlug, wikiPages, currentPage, currentPageUpdatedByUser, canEdit, preferredDetailsFont, onWikiPagesFetch, onWikiPageFetch, onCreate, onUpdate, onDelete, onRestoreRevision }) => {
    const [t] = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
      onWikiPagesFetch(projectId);
    }, [projectId, onWikiPagesFetch]);

    useEffect(() => {
      if (!wikiPageSlug && wikiPages.length > 0) {
        const rootPages = wikiPages.filter((page) => !page.parentId).sort((a, b) => a.position - b.position);

        if (rootPages[0]) {
          navigate(Paths.PROJECT_WIKI_PAGE.replace(':id', projectId).replace(':slug', rootPages[0].slug), { replace: true });
        }
      }
    }, [wikiPageSlug, wikiPages, projectId, navigate]);

    useEffect(() => {
      if (currentPage && currentPage.id && !isLocalId(currentPage.id) && currentPage.content === undefined) {
        onWikiPageFetch(currentPage.id);
      }
    }, [currentPage, onWikiPageFetch]);

    const handleCreatePage = useCallback(
      (parentId) => {
        const siblings = wikiPages.filter((page) => (page.parentId || null) === (parentId || null));
        const position = (siblings.length + 1) * Config.POSITION_GAP;

        onCreate(projectId, {
          title: t('common.newPage'),
          parentId: parentId || undefined,
          position,
        });
      },
      [wikiPages, projectId, onCreate, t],
    );

    if (wikiPages.length === 0) {
      return (
        <div className={s.wrapper}>
          <ProjectNavContainer />
          <div className={s.empty}>
            <Icon type={IconType.List} size={IconSize.Size20} className={s.emptyIcon} />
            <h1 className={s.emptyTitle}>{t('common.noWikiPages_title')}</h1>
            {canEdit && (
              <Button style={ButtonStyle.Submit} onClick={() => handleCreatePage(null)}>
                {t('action.createFirstWikiPage')}
              </Button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className={s.wrapper}>
        <ProjectNavContainer />
        <div className={s.body}>
          <div className={s.tree}>
            <WikiTree projectId={projectId} pages={wikiPages} currentSlug={wikiPageSlug} canEdit={canEdit} onCreate={handleCreatePage} onUpdate={onUpdate} />
          </div>
          <div className={s.content}>
            {currentPage && currentPage.content !== undefined && (
              <WikiPageView
                page={currentPage}
                updatedByUser={currentPageUpdatedByUser}
                canEdit={canEdit}
                preferredDetailsFont={preferredDetailsFont}
                wikiPages={wikiPages}
                wikiBasePath={Paths.PROJECT_WIKI.replace(':id', projectId)}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onRestoreRevision={onRestoreRevision}
              />
            )}
          </div>
        </div>
      </div>
    );
  },
);

Wiki.propTypes = {
  projectId: PropTypes.string.isRequired,
  wikiPageSlug: PropTypes.string,
  wikiPages: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentPage: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  currentPageUpdatedByUser: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  preferredDetailsFont: PropTypes.string.isRequired,
  onWikiPagesFetch: PropTypes.func.isRequired,
  onWikiPageFetch: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onRestoreRevision: PropTypes.func.isRequired,
};

Wiki.defaultProps = {
  wikiPageSlug: undefined,
  currentPage: undefined,
  currentPageUpdatedByUser: undefined,
};

export default Wiki;
